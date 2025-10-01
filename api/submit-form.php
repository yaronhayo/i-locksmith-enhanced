<?php
/**
 * I Locksmith Form Submission Handler
 * Processes form submissions with validation, reCAPTCHA verification, and Resend email notifications
 * Version: 1.0.0
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Load environment variables
require_once __DIR__ . '/config.php';

class FormProcessor {
    private $config;
    private $errors = [];

    public function __construct($config) {
        $this->config = $config;
    }

    public function process() {
        try {
            // Get and validate input
            $input = $this->getInput();

            if (!$this->validateInput($input)) {
                return $this->errorResponse('Validation failed', $this->errors);
            }

            // Verify reCAPTCHA
            if (!$this->verifyRecaptcha($input['recaptcha_response'] ?? '')) {
                return $this->errorResponse('reCAPTCHA verification failed');
            }

            // Sanitize data
            $data = $this->sanitizeData($input);

            // Send notifications
            $emailSent = $this->sendNotifications($data);

            if (!$emailSent) {
                return $this->errorResponse('Failed to send notification');
            }

            // Store lead (optional)
            $this->storeLead($data);

            return $this->successResponse('Form submitted successfully');

        } catch (Exception $e) {
            error_log('Form submission error: ' . $e->getMessage());
            return $this->errorResponse('An unexpected error occurred');
        }
    }

    private function getInput() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            throw new Exception('Invalid JSON input');
        }

        return $data;
    }

    private function validateInput($input) {
        $valid = true;

        // Required fields
        $requiredFields = ['name', 'phone', 'address', 'service_type', 'needed'];

        foreach ($requiredFields as $field) {
            if (empty($input[$field]) || trim($input[$field]) === '') {
                $this->errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
                $valid = false;
            }
        }

        // Validate name
        if (!empty($input['name'])) {
            if (strlen($input['name']) < 2) {
                $this->errors[] = 'Name must be at least 2 characters long';
                $valid = false;
            }
            if (!preg_match('/^[a-zA-Z\s\'-]+$/', $input['name'])) {
                $this->errors[] = 'Name contains invalid characters';
                $valid = false;
            }
        }

        // Validate phone
        if (!empty($input['phone'])) {
            $phone = preg_replace('/\D/', '', $input['phone']);
            if (strlen($phone) !== 10) {
                $this->errors[] = 'Phone number must be exactly 10 digits';
                $valid = false;
            }
        }

        // Validate email (if provided)
        if (!empty($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = 'Invalid email address';
            $valid = false;
        }

        // Validate address
        if (!empty($input['address']) && strlen($input['address']) < 5) {
            $this->errors[] = 'Please provide a complete address';
            $valid = false;
        }

        return $valid;
    }

    private function verifyRecaptcha($response) {
        // Skip reCAPTCHA verification if not configured or in development
        if (empty($this->config['RECAPTCHA_SECRET_KEY']) || $this->config['NODE_ENV'] === 'development') {
            return true;
        }

        if (empty($response)) {
            return false;
        }

        $data = [
            'secret' => $this->config['RECAPTCHA_SECRET_KEY'],
            'response' => $response,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
        ];

        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];

        $context = stream_context_create($options);
        $result = file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);

        if ($result === FALSE) {
            return false;
        }

        $json = json_decode($result, true);
        return isset($json['success']) && $json['success'] === true;
    }

    private function sanitizeData($input) {
        $sanitized = [];

        // Basic string fields
        $stringFields = ['name', 'phone', 'email', 'address', 'service_type', 'needed', 'notes'];
        foreach ($stringFields as $field) {
            $sanitized[$field] = isset($input[$field]) ? trim(htmlspecialchars($input[$field], ENT_QUOTES, 'UTF-8')) : '';
        }

        // Format phone number
        $sanitized['phone'] = preg_replace('/\D/', '', $sanitized['phone']);
        if (strlen($sanitized['phone']) === 10) {
            $sanitized['phone'] = sprintf('(%s) %s-%s',
                substr($sanitized['phone'], 0, 3),
                substr($sanitized['phone'], 3, 3),
                substr($sanitized['phone'], 6, 4)
            );
        }

        // Session data
        $sanitized['timestamp'] = $input['timestamp'] ?? date('c');
        $sanitized['page_url'] = $input['page_url'] ?? '';
        $sanitized['page_title'] = $input['page_title'] ?? '';
        $sanitized['referrer'] = $input['referrer'] ?? '';
        $sanitized['user_agent'] = $input['user_agent'] ?? '';
        $sanitized['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
        $sanitized['form_source'] = $input['form_source'] ?? '';

        return $sanitized;
    }

    private function sendNotifications($data) {
        try {
            // Send email notification
            return $this->sendEmailNotification($data);
        } catch (Exception $e) {
            error_log('Email notification error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendEmailNotification($data) {
        $resendApiKey = $this->config['RESEND_API_KEY'];
        $notificationEmail = $this->config['NOTIFICATION_EMAIL'];
        $fromEmail = $this->config['FROM_EMAIL'];
        $fromName = $this->config['FROM_NAME'];

        if (empty($resendApiKey)) {
            error_log('Resend API key not configured');
            return false;
        }

        // Create email content
        $subject = $this->createEmailSubject($data);
        $htmlContent = $this->createEmailContent($data);
        $textContent = $this->createTextContent($data);

        // Prepare email data
        $emailData = [
            'from' => "$fromName <$fromEmail>",
            'to' => [$notificationEmail],
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent
        ];

        // Add customer copy if email provided
        if (!empty($data['email'])) {
            $emailData['reply_to'] = [$data['email']];

            // Send customer confirmation email
            $this->sendCustomerConfirmation($data);
        }

        // Send via Resend API
        return $this->sendViaResend($emailData);
    }

    private function sendCustomerConfirmation($data) {
        $resendApiKey = $this->config['RESEND_API_KEY'];
        $fromEmail = $this->config['FROM_EMAIL'];
        $fromName = $this->config['FROM_NAME'];

        $confirmationData = [
            'from' => "$fromName <$fromEmail>",
            'to' => [$data['email']],
            'subject' => 'Thank You - Service Request Received | I Locksmith',
            'html' => $this->createCustomerConfirmationHtml($data),
            'text' => $this->createCustomerConfirmationText($data)
        ];

        $this->sendViaResend($confirmationData);
    }

    private function sendViaResend($emailData) {
        $resendApiKey = $this->config['RESEND_API_KEY'];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $resendApiKey,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        } else {
            error_log('Resend API error: ' . $response);

            // Try fallback email method
            return $this->sendFallbackEmail($data);
        }
    }

    private function createEmailSubject($data) {
        $priority = '';
        if ($data['needed'] === 'ASAP') {
            $priority = '🔥 URGENT - ';
        }

        return "{$priority}🔐 New Lead: {$data['service_type']} - {$data['name']}";
    }

    private function createEmailContent($data) {
        $priorityClass = $data['needed'] === 'ASAP' ? 'priority-high' : '';
        $urgentBanner = $data['needed'] === 'ASAP' ?
            '<div style="background: #ff0000; color: white; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px;">🚨 URGENT REQUEST - ASAP SERVICE NEEDED 🚨</div>' : '';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>New Locksmith Lead</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .content { padding: 30px 20px; }
                .field-group { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #DC143C; }
                .field-label { font-weight: bold; color: #DC143C; margin-bottom: 5px; display: block; }
                .field-value { color: #333; font-size: 16px; }
                .priority-high { border-left-color: #ff0000 !important; background: #fff5f5 !important; }
                .session-info { border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; }
                .session-info h3 { color: #666; font-size: 16px; margin-bottom: 15px; }
                .session-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .session-item { font-size: 14px; color: #666; }
                .session-label { font-weight: bold; color: #333; }
                .footer { background: #1C1C1C; color: white; padding: 20px; text-align: center; font-size: 14px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
                @media (max-width: 600px) {
                    .session-grid { grid-template-columns: 1fr; }
                    .container { margin: 10px; }
                    .content { padding: 20px 15px; }
                }
            </style>
        </head>
        <body>
            <div class='container'>
                $urgentBanner

                <div class='header'>
                    <h1>🔐 New Locksmith Lead</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>I Locksmith - Service Request</p>
                </div>

                <div class='content'>
                    <div class='field-group $priorityClass'>
                        <span class='field-label'>🚨 Priority Level</span>
                        <div class='field-value' style='font-weight: bold; font-size: 18px;'>" .
                        ($data['needed'] === 'ASAP' ? '🔥 URGENT - ASAP' : htmlspecialchars($data['needed'])) .
                        "</div>
                    </div>

                    <div class='field-group'>
                        <span class='field-label'>👤 Customer Name</span>
                        <div class='field-value'>" . htmlspecialchars($data['name']) . "</div>
                    </div>

                    <div class='field-group'>
                        <span class='field-label'>📞 Phone Number</span>
                        <div class='field-value'>
                            <a href='tel:" . preg_replace('/\D/', '', $data['phone']) . "' style='color: #DC143C; text-decoration: none; font-weight: bold;'>" . htmlspecialchars($data['phone']) . "</a>
                        </div>
                    </div>";

        if (!empty($data['email'])) {
            $content .= "
                    <div class='field-group'>
                        <span class='field-label'>📧 Email Address</span>
                        <div class='field-value'>
                            <a href='mailto:" . htmlspecialchars($data['email']) . "' style='color: #DC143C; text-decoration: none;'>" . htmlspecialchars($data['email']) . "</a>
                        </div>
                    </div>";
        }

        $content .= "
                    <div class='field-group'>
                        <span class='field-label'>📍 Service Address</span>
                        <div class='field-value'>
                            <a href='https://maps.google.com/?q=" . urlencode($data['address']) . "' style='color: #DC143C; text-decoration: none;' target='_blank'>
                                " . htmlspecialchars($data['address']) . "
                            </a>
                        </div>
                    </div>

                    <div class='field-group'>
                        <span class='field-label'>🔧 Service Type</span>
                        <div class='field-value' style='font-weight: bold; color: #DC143C;'>" . htmlspecialchars($data['service_type']) . "</div>
                    </div>";

        if (!empty($data['notes'])) {
            $content .= "
                    <div class='field-group'>
                        <span class='field-label'>📝 Additional Notes</span>
                        <div class='field-value'>" . nl2br(htmlspecialchars($data['notes'])) . "</div>
                    </div>";
        }

        $content .= "
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='tel:" . preg_replace('/\D/', '', $data['phone']) . "' class='cta-button'>📞 Call Customer</a>
                        <a href='https://maps.google.com/?q=" . urlencode($data['address']) . "' class='cta-button' target='_blank'>🗺️ View Location</a>
                    </div>

                    <div class='session-info'>
                        <h3>📊 Session Information</h3>
                        <div class='session-grid'>
                            <div class='session-item'>
                                <span class='session-label'>Timestamp:</span><br>
                                " . date('M j, Y g:i A T', strtotime($data['timestamp'])) . "
                            </div>
                            <div class='session-item'>
                                <span class='session-label'>Source Page:</span><br>
                                <a href='" . htmlspecialchars($data['page_url']) . "' style='color: #DC143C;'>" . htmlspecialchars($data['page_title']) . "</a>
                            </div>
                            <div class='session-item'>
                                <span class='session-label'>Referrer:</span><br>
                                " . (empty($data['referrer']) ? 'Direct' : htmlspecialchars($data['referrer'])) . "
                            </div>
                            <div class='session-item'>
                                <span class='session-label'>IP Address:</span><br>
                                " . htmlspecialchars($data['ip_address']) . "
                            </div>
                        </div>
                    </div>
                </div>

                <div class='footer'>
                    <strong>I Locksmith</strong><br>
                    Professional Locksmith Services<br>
                    📞 (574) 318-7797 | 📧 " . htmlspecialchars($this->config['BUSINESS_EMAIL']) . "<br>
                    🌐 " . htmlspecialchars($this->config['WEBSITE_URL']) . "
                </div>
            </div>
        </body>
        </html>";

        return $content;
    }

    private function createTextContent($data) {
        $text = "🔐 NEW LOCKSMITH LEAD\n";
        $text .= "========================\n\n";

        if ($data['needed'] === 'ASAP') {
            $text .= "🔥 URGENT - ASAP SERVICE NEEDED\n\n";
        }

        $text .= "👤 Customer: " . $data['name'] . "\n";
        $text .= "📞 Phone: " . $data['phone'] . "\n";

        if (!empty($data['email'])) {
            $text .= "📧 Email: " . $data['email'] . "\n";
        }

        $text .= "📍 Address: " . $data['address'] . "\n";
        $text .= "🔧 Service: " . $data['service_type'] . "\n";
        $text .= "⏰ When Needed: " . $data['needed'] . "\n";

        if (!empty($data['notes'])) {
            $text .= "📝 Notes: " . $data['notes'] . "\n";
        }

        $text .= "\n📊 SESSION INFO:\n";
        $text .= "Timestamp: " . date('M j, Y g:i A T', strtotime($data['timestamp'])) . "\n";
        $text .= "Source: " . $data['page_title'] . "\n";
        $text .= "URL: " . $data['page_url'] . "\n";
        $text .= "IP: " . $data['ip_address'] . "\n";

        return $text;
    }

    private function createCustomerConfirmationHtml($data) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Service Request Confirmed - I Locksmith</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 30px 20px; text-align: center; }
                .content { padding: 30px 20px; }
                .info-box { background: #f8f9fa; border-left: 4px solid #DC143C; padding: 15px; margin: 20px 0; border-radius: 8px; }
                .footer { background: #1C1C1C; color: white; padding: 20px; text-align: center; font-size: 14px; }
                .contact-info { background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                .contact-info a { color: white; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>✅ Request Received</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>Thank you for choosing I Locksmith!</p>
                </div>

                <div class='content'>
                    <p>Hi " . htmlspecialchars($data['name']) . ",</p>

                    <p>Thank you for your service request! We have received your information and will contact you shortly to discuss your <strong>" . htmlspecialchars($data['service_type']) . "</strong> needs.</p>

                    <div class='info-box'>
                        <h3>📋 Your Request Details:</h3>
                        <p><strong>Service:</strong> " . htmlspecialchars($data['service_type']) . "</p>
                        <p><strong>Address:</strong> " . htmlspecialchars($data['address']) . "</p>
                        <p><strong>When Needed:</strong> " . htmlspecialchars($data['needed']) . "</p>
                        " . (!empty($data['notes']) ? "<p><strong>Notes:</strong> " . nl2br(htmlspecialchars($data['notes'])) . "</p>" : "") . "
                        <p><strong>Submitted:</strong> " . date('M j, Y g:i A T', strtotime($data['timestamp'])) . "</p>
                    </div>

                    <div class='contact-info'>
                        <h3>Need Immediate Assistance?</h3>
                        <p>For urgent locksmith services, call us directly:</p>
                        <p style='font-size: 24px; margin: 10px 0;'>
                            <a href='tel:5743187797'>📞 (574) 318-7797</a>
                        </p>
                        <p style='font-size: 14px; opacity: 0.9;'>Available 24/7 for Emergency Services</p>
                    </div>

                    <p>We serve South Bend, Mishawaka, Elkhart, and surrounding areas with professional locksmith services. Our licensed and insured technicians are ready to help with all your security needs.</p>

                    <p>Thank you for trusting I Locksmith with your security needs!</p>

                    <p>Best regards,<br>
                    <strong>The I Locksmith Team</strong></p>
                </div>

                <div class='footer'>
                    <strong>I Locksmith</strong><br>
                    Professional Locksmith Services<br>
                    📞 (574) 318-7797 | 📧 " . htmlspecialchars($this->config['BUSINESS_EMAIL']) . "<br>
                    🌐 " . htmlspecialchars($this->config['WEBSITE_URL']) . "
                </div>
            </div>
        </body>
        </html>";
    }

    private function createCustomerConfirmationText($data) {
        return "Thank you for your service request!\n\n" .
               "Hi " . $data['name'] . ",\n\n" .
               "We have received your request for " . $data['service_type'] . " service and will contact you shortly.\n\n" .
               "REQUEST DETAILS:\n" .
               "Service: " . $data['service_type'] . "\n" .
               "Address: " . $data['address'] . "\n" .
               "When Needed: " . $data['needed'] . "\n" .
               (!empty($data['notes']) ? "Notes: " . $data['notes'] . "\n" : "") .
               "Submitted: " . date('M j, Y g:i A T', strtotime($data['timestamp'])) . "\n\n" .
               "For urgent assistance, call us directly at (574) 318-7797\n" .
               "Available 24/7 for Emergency Services\n\n" .
               "Thank you for trusting I Locksmith!\n\n" .
               "The I Locksmith Team\n" .
               $this->config['WEBSITE_URL'];
    }

    private function storeLead($data) {
        // Optional: Store lead data in database
        // This can be implemented later if needed

        // For now, just log the lead
        $logData = [
            'timestamp' => $data['timestamp'],
            'name' => $data['name'],
            'phone' => $data['phone'],
            'service_type' => $data['service_type'],
            'needed' => $data['needed'],
            'page_url' => $data['page_url']
        ];

        error_log('New lead: ' . json_encode($logData));
    }

    private function successResponse($message) {
        http_response_code(200);
        return json_encode(['success' => true, 'message' => $message]);
    }

    private function sendFallbackEmail($data) {
        try {
            // Try built-in PHP mail function as fallback
            if ($this->sendPHPMail($data)) {
                error_log('Fallback PHP mail sent successfully');
                return true;
            }

            // Try SMTP fallback if configured
            if ($this->sendSMTPMail($data)) {
                error_log('Fallback SMTP mail sent successfully');
                return true;
            }

            // Last resort - save to file for manual processing
            $this->saveToFile($data);
            error_log('Email fallback failed, saved submission to file');
            return true; // Still return true since we saved the data
        } catch (Exception $e) {
            error_log('Fallback email error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendPHPMail($data) {
        $notificationEmail = $this->config['NOTIFICATION_EMAIL'];
        $fromEmail = $this->config['FROM_EMAIL'];
        $fromName = $this->config['FROM_NAME'];

        $subject = $this->createEmailSubject($data);
        $textContent = $this->createTextContent($data);

        $headers = [
            'From: ' . $fromName . ' <' . $fromEmail . '>',
            'Reply-To: ' . $fromEmail,
            'X-Mailer: PHP/' . phpversion(),
            'Content-Type: text/plain; charset=UTF-8'
        ];

        return mail($notificationEmail, $subject, $textContent, implode("\r\n", $headers));
    }

    private function sendSMTPMail($data) {
        // Check if SMTP configuration exists
        if (empty($this->config['SMTP_HOST']) || empty($this->config['SMTP_USER'])) {
            return false;
        }

        // Basic SMTP implementation would go here
        // For now, return false to use file fallback
        return false;
    }

    private function saveToFile($data) {
        $filename = __DIR__ . '/../logs/failed-submissions-' . date('Y-m-d') . '.json';
        $logDir = dirname($filename);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $submission = [
            'timestamp' => date('c'),
            'data' => $data,
            'note' => 'Email delivery failed - requires manual processing'
        ];

        file_put_contents($filename, json_encode($submission, JSON_PRETTY_PRINT) . "\n", FILE_APPEND | LOCK_EX);
    }

    private function errorResponse($message, $errors = []) {
        http_response_code(400);
        return json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);
    }
}

// Process the form
try {
    $processor = new FormProcessor($config);
    echo $processor->process();
} catch (Exception $e) {
    error_log('Fatal form processing error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>
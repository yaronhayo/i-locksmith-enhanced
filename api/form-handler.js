/**
 * I Locksmith Form Submission Handler
 * Vercel serverless function for handling form submissions with Resend email integration
 */

const { Resend } = require('resend');

// Initialize Resend with API key (set in Vercel environment variables)
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        // Validate required fields
        const requiredFields = ['name', 'phone', 'address', 'service_type', 'needed'];
        const missingFields = requiredFields.filter(field => !data[field]?.trim());

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields
            });
        }

        // Verify reCAPTCHA if present
        if (data.recaptcha_response) {
            const recaptchaValid = await verifyRecaptcha(data.recaptcha_response);
            if (!recaptchaValid) {
                return res.status(400).json({ error: 'reCAPTCHA verification failed' });
            }
        }

        // Sanitize and process data
        const sanitizedData = sanitizeFormData(data);

        // Send email notification
        const emailSent = await sendEmailNotification(sanitizedData);

        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send email notification' });
        }

        // Log submission (optional - store in database)
        await logSubmission(sanitizedData);

        return res.status(200).json({
            success: true,
            message: 'Form submitted successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Form submission error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Please try again or call (574) 318-7797 directly'
        });
    }
}

async function verifyRecaptcha(recaptchaResponse) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaResponse
            })
        });

        const result = await response.json();
        return result.success && result.score > 0.5; // Adjust score threshold as needed

    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}

function sanitizeFormData(data) {
    const sanitized = {};

    // Sanitize text fields
    const textFields = ['name', 'phone', 'email', 'address', 'service_type', 'needed', 'notes'];
    textFields.forEach(field => {
        if (data[field]) {
            sanitized[field] = data[field].toString().trim().substring(0, 1000); // Limit length
        }
    });

    // Preserve session information
    const sessionFields = [
        'timestamp', 'page_url', 'page_title', 'referrer',
        'user_agent', 'screen_resolution', 'language', 'timezone'
    ];
    sessionFields.forEach(field => {
        if (data[field]) {
            sanitized[field] = data[field].toString().trim();
        }
    });

    return sanitized;
}

async function sendEmailNotification(data) {
    try {
        // Determine priority level
        const isUrgent = data.needed === 'ASAP';
        const priorityEmoji = isUrgent ? '🚨' : '🔐';
        const priorityText = isUrgent ? 'URGENT - ' : '';

        // Create email content
        const emailHtml = createEmailTemplate(data, isUrgent);

        // Send email
        const emailResult = await resend.emails.send({
            from: 'I Locksmith <noreply@ilocksmithindiana.com>',
            to: ['yaron@gettmarketing.com'],
            subject: `${priorityEmoji} ${priorityText}New Lead - ${data.service_type} - ${data.name}`,
            html: emailHtml,
            // Add tags for tracking
            tags: [
                {
                    name: 'lead_source',
                    value: 'website_form'
                },
                {
                    name: 'service_type',
                    value: data.service_type.toLowerCase().replace(/\s+/g, '_')
                },
                {
                    name: 'priority',
                    value: isUrgent ? 'urgent' : 'normal'
                }
            ]
        });

        return emailResult.error ? false : true;

    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

function createEmailTemplate(data, isUrgent) {
    const priorityClass = isUrgent ? 'priority-urgent' : 'priority-normal';
    const priorityBadge = isUrgent ?
        '<div style="background: #ff0000; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 14px; margin-bottom: 20px;">🚨 URGENT - ASAP SERVICE</div>' : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Locksmith Lead - ${data.name}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                background-color: #f5f7fa;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #DC143C 0%, #FF4500 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            }
            .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: 700;
                position: relative;
                z-index: 1;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.95;
                font-size: 16px;
                position: relative;
                z-index: 1;
            }
            .content { padding: 40px 30px; }

            .priority-urgent { border-left: 5px solid #ff0000; }
            .priority-normal { border-left: 5px solid #DC143C; }

            .field-group {
                margin-bottom: 24px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #DC143C;
                transition: all 0.3s ease;
            }
            .field-group:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .priority-urgent .field-group:first-child {
                border-left-color: #ff0000;
                background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
            }
            .field-label {
                font-weight: 700;
                color: #DC143C;
                margin-bottom: 8px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .field-value {
                color: #333;
                font-size: 16px;
                font-weight: 500;
            }
            .field-value a {
                color: #DC143C;
                text-decoration: none;
                font-weight: 600;
                border-bottom: 2px solid transparent;
                transition: border-color 0.3s ease;
            }
            .field-value a:hover {
                border-bottom-color: #DC143C;
            }

            .cta-section {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 12px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #DC143C 0%, #FF4500 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 700;
                margin: 8px;
                font-size: 16px;
                box-shadow: 0 4px 16px rgba(220, 20, 60, 0.3);
                transition: all 0.3s ease;
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(220, 20, 60, 0.4);
            }
            .cta-button.secondary {
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                box-shadow: 0 4px 16px rgba(108, 117, 125, 0.3);
            }

            .session-info {
                border-top: 3px solid #e9ecef;
                padding-top: 30px;
                margin-top: 40px;
            }
            .session-info h3 {
                color: #495057;
                font-size: 18px;
                margin-bottom: 20px;
                font-weight: 700;
            }
            .session-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }
            .session-item {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 8px;
                border-left: 3px solid #DC143C;
            }
            .session-label {
                font-weight: 700;
                color: #DC143C;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .session-value {
                color: #495057;
                font-size: 14px;
                word-break: break-all;
            }

            .footer {
                background: #1C1C1C;
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }
            .footer-logo {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #DC143C, #FF4500);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .footer-contact {
                opacity: 0.9;
                font-size: 14px;
                line-height: 1.8;
            }

            @media (max-width: 600px) {
                .content { padding: 20px; }
                .header { padding: 30px 20px; }
                .header h1 { font-size: 26px; }
                .session-grid { grid-template-columns: 1fr; }
                .cta-button {
                    display: block;
                    margin: 8px 0;
                    padding: 16px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 New Locksmith Lead</h1>
                <p>I Locksmith - Professional Service Request</p>
            </div>

            <div class="content ${priorityClass}">
                ${priorityBadge}

                <div class="field-group">
                    <div class="field-label">🚨 Priority Level</div>
                    <div class="field-value" style="font-size: 20px; font-weight: 700;">
                        ${data.needed === 'ASAP' ? '🔥 URGENT - IMMEDIATE SERVICE NEEDED' : `⏰ ${data.needed}`}
                    </div>
                </div>

                <div class="field-group">
                    <div class="field-label">👤 Customer Information</div>
                    <div class="field-value">
                        <strong style="font-size: 18px;">${data.name}</strong><br>
                        <a href="tel:${data.phone}" style="font-size: 18px;">📞 ${data.phone}</a>
                        ${data.email ? `<br><a href="mailto:${data.email}">📧 ${data.email}</a>` : ''}
                    </div>
                </div>

                <div class="field-group">
                    <div class="field-label">📍 Service Location</div>
                    <div class="field-value">
                        <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" target="_blank" style="font-size: 16px;">
                            🗺️ ${data.address}
                        </a>
                    </div>
                </div>

                <div class="field-group">
                    <div class="field-label">🔧 Service Details</div>
                    <div class="field-value">
                        <strong style="color: #DC143C; font-size: 18px;">${data.service_type}</strong>
                        ${data.notes ? `<br><br><strong>Additional Notes:</strong><br>${data.notes}` : ''}
                    </div>
                </div>

                <div class="cta-section">
                    <h3 style="margin-bottom: 20px; color: #333;">Quick Actions</h3>
                    <a href="tel:${data.phone}" class="cta-button">📞 Call Customer Now</a>
                    <a href="sms:${data.phone}" class="cta-button secondary">💬 Send SMS</a>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" class="cta-button secondary" target="_blank">🗺️ View Location</a>
                </div>

                <div class="session-info">
                    <h3>📊 Lead Intelligence</h3>
                    <div class="session-grid">
                        <div class="session-item">
                            <div class="session-label">Submission Time</div>
                            <div class="session-value">${new Date(data.timestamp).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                            })}</div>
                        </div>
                        <div class="session-item">
                            <div class="session-label">Source Page</div>
                            <div class="session-value">
                                <a href="${data.page_url}" target="_blank" style="color: #DC143C; font-size: 12px;">
                                    ${data.page_title}
                                </a>
                            </div>
                        </div>
                        <div class="session-item">
                            <div class="session-label">Traffic Source</div>
                            <div class="session-value">${data.referrer || 'Direct / Bookmarked'}</div>
                        </div>
                        <div class="session-item">
                            <div class="session-label">Location/Timezone</div>
                            <div class="session-value">${data.timezone || 'Unknown'}</div>
                        </div>
                        <div class="session-item">
                            <div class="session-label">Device Info</div>
                            <div class="session-value">
                                ${data.screen_resolution || 'Unknown'}<br>
                                <span style="font-size: 12px; opacity: 0.8;">${data.language || 'Unknown'}</span>
                            </div>
                        </div>
                        <div class="session-item">
                            <div class="session-label">Lead Score</div>
                            <div class="session-value">
                                <span style="color: ${isUrgent ? '#ff0000' : '#28a745'}; font-weight: 700;">
                                    ${isUrgent ? '🔥 HIGH' : '✅ MEDIUM'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="footer-logo">I LOCKSMITH</div>
                <div class="footer-contact">
                    Professional Locksmith Services<br>
                    📞 (574) 318-7797 | 📧 ilocksmithoffice@gmail.com<br>
                    🌐 ilocksmithindiana.com<br>
                    📍 219 N Dixie Way Ste 209, South Bend, IN 46637
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

async function logSubmission(data) {
    try {
        // This could be enhanced to log to a database
        console.log('Form submission logged:', {
            name: data.name,
            service_type: data.service_type,
            timestamp: data.timestamp,
            page_url: data.page_url
        });

        return true;
    } catch (error) {
        console.error('Logging error:', error);
        return false;
    }
}
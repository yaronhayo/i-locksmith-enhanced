<?php
/**
 * Configuration file for I Locksmith form processing
 * Loads environment variables and sets up configuration
 */

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return [];
    }

    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse key=value pairs
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes if present
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }

            $env[$key] = $value;
        }
    }

    return $env;
}

// Load .env file from parent directory
$envFile = __DIR__ . '/../.env';
$envVars = loadEnv($envFile);

// Merge with $_ENV and provide defaults
$config = [
    // reCAPTCHA Configuration
    'RECAPTCHA_SITE_KEY' => $envVars['RECAPTCHA_SITE_KEY'] ?? $_ENV['RECAPTCHA_SITE_KEY'] ?? '',
    'RECAPTCHA_SECRET_KEY' => $envVars['RECAPTCHA_SECRET_KEY'] ?? $_ENV['RECAPTCHA_SECRET_KEY'] ?? '',

    // Email Configuration (Resend)
    'RESEND_API_KEY' => $envVars['RESEND_API_KEY'] ?? $_ENV['RESEND_API_KEY'] ?? '',
    'NOTIFICATION_EMAIL' => $envVars['NOTIFICATION_EMAIL'] ?? $_ENV['NOTIFICATION_EMAIL'] ?? 'yaron@gettmarketing.com',
    'FROM_EMAIL' => $envVars['FROM_EMAIL'] ?? $_ENV['FROM_EMAIL'] ?? 'noreply@ilocksmithindiana.com',
    'FROM_NAME' => $envVars['FROM_NAME'] ?? $_ENV['FROM_NAME'] ?? 'I Locksmith',

    // Website Configuration
    'WEBSITE_URL' => $envVars['WEBSITE_URL'] ?? $_ENV['WEBSITE_URL'] ?? 'https://ilocksmithindiana.com',
    'THANK_YOU_URL' => $envVars['THANK_YOU_URL'] ?? $_ENV['THANK_YOU_URL'] ?? '/thank-you.html',

    // Business Information
    'BUSINESS_NAME' => $envVars['BUSINESS_NAME'] ?? $_ENV['BUSINESS_NAME'] ?? 'I Locksmith',
    'BUSINESS_PHONE' => $envVars['BUSINESS_PHONE'] ?? $_ENV['BUSINESS_PHONE'] ?? '+1 (574) 318-7797',
    'BUSINESS_EMAIL' => $envVars['BUSINESS_EMAIL'] ?? $_ENV['BUSINESS_EMAIL'] ?? 'ilocksmithoffice@gmail.com',
    'BUSINESS_ADDRESS' => $envVars['BUSINESS_ADDRESS'] ?? $_ENV['BUSINESS_ADDRESS'] ?? 'South Bend, IN',

    // Security Configuration
    'SESSION_SECRET' => $envVars['SESSION_SECRET'] ?? $_ENV['SESSION_SECRET'] ?? 'default_secret_change_me',

    // Development Settings
    'NODE_ENV' => $envVars['NODE_ENV'] ?? $_ENV['NODE_ENV'] ?? 'production',
    'DEBUG_MODE' => filter_var($envVars['DEBUG_MODE'] ?? $_ENV['DEBUG_MODE'] ?? 'false', FILTER_VALIDATE_BOOLEAN),

    // Form Configuration
    'MAX_FILE_SIZE' => intval($envVars['MAX_FILE_SIZE'] ?? $_ENV['MAX_FILE_SIZE'] ?? 5), // MB
    'ALLOWED_FILE_TYPES' => explode(',', $envVars['ALLOWED_FILE_TYPES'] ?? $_ENV['ALLOWED_FILE_TYPES'] ?? 'jpg,jpeg,png,pdf,doc,docx'),
    'RATE_LIMIT' => intval($envVars['RATE_LIMIT'] ?? $_ENV['RATE_LIMIT'] ?? 50), // requests per hour
];

// Validate required configuration
$requiredConfig = ['RESEND_API_KEY', 'NOTIFICATION_EMAIL'];
$missingConfig = [];

foreach ($requiredConfig as $key) {
    if (empty($config[$key])) {
        $missingConfig[] = $key;
    }
}

if (!empty($missingConfig) && $config['NODE_ENV'] === 'production') {
    error_log('Missing required configuration: ' . implode(', ', $missingConfig));
}

// Set timezone
date_default_timezone_set('America/Indiana/Indianapolis');

// Configure error reporting based on environment
if ($config['NODE_ENV'] === 'development' || $config['DEBUG_MODE']) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ERROR | E_WARNING | E_PARSE);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// Set up logging
if (!defined('LOG_FILE')) {
    define('LOG_FILE', __DIR__ . '/../logs/form-submissions.log');
}

// Ensure logs directory exists
$logDir = dirname(LOG_FILE);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

ini_set('error_log', LOG_FILE);
?>
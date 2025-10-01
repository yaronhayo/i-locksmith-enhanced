<?php
/**
 * Configuration endpoint for frontend
 * Returns public configuration values needed by JavaScript
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Load configuration
require_once __DIR__ . '/config.php';

// Return only public configuration values
$publicConfig = [
    'RECAPTCHA_SITE_KEY' => $config['RECAPTCHA_SITE_KEY'] ?? '',
    'WEBSITE_URL' => $config['WEBSITE_URL'] ?? '',
    'THANK_YOU_URL' => $config['THANK_YOU_URL'] ?? '/thank-you.html'
];

echo json_encode($publicConfig);
?>
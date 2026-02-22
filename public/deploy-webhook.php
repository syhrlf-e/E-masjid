<?php
// GitHub Webhook Auto Deploy
// URL: https://emasjid.oirul.com/deploy-webhook.php?token=YOUR_SECRET_TOKEN

$secret = 'emasjid-deploy-2026';

// Verify token
if (!isset($_GET['token']) || $_GET['token'] !== $secret) {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Run deploy script in background
exec('bash /var/www/emasjid/deploy.sh > /dev/null 2>&1 &');

http_response_code(200);
echo json_encode(['status' => 'Deploy started', 'time' => date('Y-m-d H:i:s')]);

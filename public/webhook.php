<?php
$secret = 'emasjid_webhook_2026';

$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$payload = file_get_contents('php://input');

if (!hash_equals('sha256=' . hash_hmac('sha256', $payload, $secret), $signature)) {
    http_response_code(403);
    die('Unauthorized');
}

exec('bash /var/www/emasjid/deploy.sh > /dev/null 2>&1 &');

http_response_code(200);
echo json_encode(['status' => 'deploying']);

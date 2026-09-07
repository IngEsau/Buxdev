<?php
// Runs only in a temporary test webroot; transport calls are renamed in the fixture.
declare(strict_types=1);
define('BUXDEV_CONTACT_TEST_MODE', true);
foreach (['CURLOPT_POST', 'CURLOPT_POSTFIELDS', 'CURLOPT_HTTPHEADER', 'CURLOPT_RETURNTRANSFER',
    'CURLOPT_CONNECTTIMEOUT', 'CURLOPT_TIMEOUT', 'CURLOPT_FOLLOWLOCATION', 'CURLOPT_SSL_VERIFYPEER',
    'CURLOPT_SSL_VERIFYHOST', 'CURLOPT_PROTOCOLS', 'CURLPROTO_HTTPS', 'CURLINFO_RESPONSE_CODE'] as $index => $name) {
    if (!defined($name)) define($name, $index + 1);
}
function buxdev_mock_curl_init(string $url): object { return (object) ['url' => $url]; }
function buxdev_mock_curl_setopt_array(object $handle, array $options): bool {
    if ($handle->url !== 'https://api.brevo.com/v3/smtp/email' || $options[CURLOPT_FOLLOWLOCATION] !== false) {
        throw new RuntimeException('Unexpected transport');
    }
    file_put_contents(__DIR__ . '/../last-email.json', $options[CURLOPT_POSTFIELDS]);
    return true;
}
function buxdev_mock_curl_exec(object $handle): string|false {
    return ($_SERVER['HTTP_X_TEST_BREVO'] ?? '') === 'timeout' ? false : '{"messageId":"mock-only"}';
}
function buxdev_mock_curl_getinfo(object $handle, int $option): int {
    return ($_SERVER['HTTP_X_TEST_BREVO'] ?? '') === 'failure' ? 500 : 201;
}
function buxdev_mock_curl_close(object $handle): void {}
require __DIR__ . '/api/contact.php';
ini_set('display_errors', '0');
try {
    buxdev_run_contact_endpoint();
} catch (Throwable) {
    buxdev_json_response(500, ['success' => false, 'code' => 'INTERNAL_ERROR']);
}

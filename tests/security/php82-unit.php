<?php
// Run inside an ephemeral local PHP 8.2 container; never calls Brevo.
declare(strict_types=1);
define('BUXDEV_CONTACT_TEST_MODE', true);
require __DIR__ . '/../../server/api/contact.php';
$_SERVER['DOCUMENT_ROOT'] = '/app/out';
$payload = ['type' => 'cotizacion', 'email' => 'qa@example.test', 'cellphone' => '+522221234567',
    'description' => '<script>QA</script> & café 漢字', 'privacyAcknowledged' => true, 'whatsappConsent' => false, 'website' => ''];
$valid = buxdev_validate_payload($payload);
assert($valid !== null);
$email = buxdev_build_brevo_payload($valid, ['from_email'=>'info@buxdev.com', 'from_name'=>'BUXDEV', 'to_email'=>'info@buxdev.com']);
assert(str_contains($email['htmlContent'], '&lt;script&gt;'));
assert(!str_contains($email['htmlContent'], '<script>'));
foreach ([['email'=>[]], ['description'=>str_repeat('x',2001)], ['privacyAcknowledged'=>'true'], ['cellphone'=>"+52\r\n2221234567"], ['to'=>'other@example.test']] as $override) {
    assert(buxdev_validate_payload(array_replace($payload, $override)) === null);
}
$_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
assert(!buxdev_request_source_is_allowed(['https://buxdev.com']));
$_SERVER['HTTP_ORIGIN'] = 'https://buxdev.com';
assert(buxdev_request_source_is_allowed(['https://buxdev.com']));
for ($i=0; $i<5; $i++) assert(buxdev_rate_limit('127.0.0.1', 10000) === 0);
assert(buxdev_rate_limit('127.0.0.1', 10000) === 900);
assert(buxdev_rate_limit('127.0.0.1', 10901) === 0);
buxdev_security_log('QA', 400);
assert(is_file(BUXDEV_SECURITY_DIR . '/events.log'));
echo 'PHP ' . PHP_VERSION . ": validation, Unicode, encoding, origin, limits, expiry, logs OK\n";

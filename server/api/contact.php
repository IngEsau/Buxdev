<?php

declare(strict_types=1);

const BUXDEV_CONTACT_CONFIG_PATH = '/home/buxdevco/private/brevo-config.php';
const BUXDEV_BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BUXDEV_MAX_REQUEST_BYTES = 16384;
const BUXDEV_MAX_DESCRIPTION_LENGTH = 2000;

/** @param array<string, mixed> $body */
function buxdev_json_response(int $status, array $body): never
{
    http_response_code($status);
    header_remove('X-Powered-By');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');

    try {
        echo json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (JsonException) {
        echo '{"success":false,"code":"INTERNAL_ERROR"}';
    }

    exit;
}

function buxdev_utf8_length(string $value): ?int
{
    if (!preg_match('//u', $value)) {
        return null;
    }

    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    $count = preg_match_all('/./us', $value, $matches);

    return $count === false ? null : $count;
}

function buxdev_honeypot_is_filled(mixed $payload): bool
{
    return is_array($payload)
        && isset($payload['website'])
        && is_string($payload['website'])
        && trim($payload['website']) !== '';
}

/**
 * @param mixed $payload
 * @return array{type: string, service_label: string, email: string, cellphone: string, description: string, privacyAcknowledged: true, whatsappConsent: bool, website: string}|null
 */
function buxdev_validate_payload(mixed $payload): ?array
{
    if (!is_array($payload)) {
        return null;
    }

    $type = $payload['type'] ?? null;
    $email = $payload['email'] ?? null;
    $cellphone = $payload['cellphone'] ?? null;
    $description = $payload['description'] ?? null;
    $privacyAcknowledged = $payload['privacyAcknowledged'] ?? null;
    $whatsappConsent = $payload['whatsappConsent'] ?? null;
    $website = $payload['website'] ?? '';

    if (
        !is_string($type)
        || !is_string($email)
        || !is_string($cellphone)
        || !is_string($description)
        || !is_bool($privacyAcknowledged)
        || !is_bool($whatsappConsent)
        || !is_string($website)
    ) {
        return null;
    }

    $services = [
        'cotizacion' => 'Cotización',
        'informacion' => 'Información',
        'duda' => 'Duda',
    ];

    $type = trim($type);
    $email = trim($email);
    $cellphone = trim($cellphone);
    $description = trim($description);
    $website = trim($website);

    if (!array_key_exists($type, $services)) {
        return null;
    }

    if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return null;
    }

    if (!preg_match('/^\+?[0-9\s().-]+$/', $cellphone)) {
        return null;
    }

    $phoneDigits = preg_replace('/\D/', '', $cellphone);
    if ($phoneDigits === null || strlen($phoneDigits) < 8 || strlen($phoneDigits) > 15) {
        return null;
    }

    $descriptionLength = buxdev_utf8_length($description);
    if ($descriptionLength === null || $descriptionLength < 1 || $descriptionLength > BUXDEV_MAX_DESCRIPTION_LENGTH) {
        return null;
    }

    if ($privacyAcknowledged !== true) {
        return null;
    }

    if (strlen($website) > 512) {
        return null;
    }

    return [
        'type' => $type,
        'service_label' => $services[$type],
        'email' => $email,
        'cellphone' => $cellphone,
        'description' => $description,
        'privacyAcknowledged' => true,
        'whatsappConsent' => $whatsappConsent,
        'website' => $website,
    ];
}

/** @return array{brevo_api_key: string, from_email: string, from_name: string, to_email: string, allowed_origins: list<string>}|null */
function buxdev_load_config(): ?array
{
    if (!is_file(BUXDEV_CONTACT_CONFIG_PATH) || !is_readable(BUXDEV_CONTACT_CONFIG_PATH)) {
        return null;
    }

    try {
        $config = require BUXDEV_CONTACT_CONFIG_PATH;
    } catch (Throwable) {
        error_log('BUXDEV contact: private configuration could not be loaded.');
        return null;
    }

    if (!is_array($config)) {
        return null;
    }

    $apiKey = $config['brevo_api_key'] ?? null;
    $fromEmail = $config['from_email'] ?? null;
    $fromName = $config['from_name'] ?? null;
    $toEmail = $config['to_email'] ?? null;
    $allowedOrigins = $config['allowed_origins'] ?? null;

    if (
        !is_string($apiKey)
        || !is_string($fromEmail)
        || !is_string($fromName)
        || !is_string($toEmail)
        || !is_array($allowedOrigins)
    ) {
        return null;
    }

    $apiKey = trim($apiKey);
    $fromEmail = trim($fromEmail);
    $fromName = trim($fromName);
    $toEmail = trim($toEmail);
    $normalizedOrigins = [];

    foreach ($allowedOrigins as $origin) {
        if (!is_string($origin)) {
            return null;
        }

        $normalizedOrigin = rtrim(trim($origin), '/');
        if ($normalizedOrigin === '' || !str_starts_with($normalizedOrigin, 'https://')) {
            return null;
        }

        $normalizedOrigins[] = $normalizedOrigin;
    }

    if (
        $apiKey === ''
        || filter_var($fromEmail, FILTER_VALIDATE_EMAIL) === false
        || $fromName === ''
        || str_contains($fromName, "\r")
        || str_contains($fromName, "\n")
        || filter_var($toEmail, FILTER_VALIDATE_EMAIL) === false
        || $normalizedOrigins === []
    ) {
        return null;
    }

    return [
        'brevo_api_key' => $apiKey,
        'from_email' => $fromEmail,
        'from_name' => $fromName,
        'to_email' => $toEmail,
        'allowed_origins' => array_values(array_unique($normalizedOrigins)),
    ];
}

/** @param list<string> $allowedOrigins */
function buxdev_origin_is_allowed(string $origin, array $allowedOrigins): bool
{
    if ($origin === '') {
        return true;
    }

    return in_array(rtrim($origin, '/'), $allowedOrigins, true);
}

function buxdev_html_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
}

/**
 * @param array{type: string, service_label: string, email: string, cellphone: string, description: string, privacyAcknowledged: true, whatsappConsent: bool, website: string} $submission
 * @param array{brevo_api_key: string, from_email: string, from_name: string, to_email: string, allowed_origins: list<string>} $config
 * @return array<string, mixed>
 */
function buxdev_build_brevo_payload(array $submission, array $config): array
{
    $service = $submission['service_label'];
    $email = $submission['email'];
    $cellphone = $submission['cellphone'];
    $description = $submission['description'];
    $whatsapp = $submission['whatsappConsent'] ? 'Autorizado' : 'No autorizado';
    $date = (new DateTimeImmutable('now', new DateTimeZone('America/Mexico_City')))->format('d/m/Y H:i T');

    $escapedService = buxdev_html_escape($service);
    $escapedEmail = buxdev_html_escape($email);
    $escapedCellphone = buxdev_html_escape($cellphone);
    $escapedDescription = nl2br(buxdev_html_escape($description), false);
    $escapedWhatsapp = buxdev_html_escape($whatsapp);
    $escapedDate = buxdev_html_escape($date);

    $htmlContent = <<<HTML
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Nueva solicitud desde BUXDEV</title></head>
<body style="margin:0;padding:24px;background:#f4f6f8;color:#231f20;font-family:Arial,sans-serif;">
  <main style="max-width:680px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #dfe3e8;border-radius:12px;">
    <p style="margin:0 0 8px;color:#2356a7;font-size:13px;font-weight:700;letter-spacing:.08em;">BUXDEV</p>
    <h1 style="margin:0 0 28px;font-size:26px;line-height:1.25;">Nueva solicitud desde buxdev.com</h1>
    <p><strong>Servicio:</strong><br>{$escapedService}</p>
    <p><strong>Correo:</strong><br>{$escapedEmail}</p>
    <p><strong>Teléfono:</strong><br>{$escapedCellphone}</p>
    <p><strong>Descripción:</strong><br>{$escapedDescription}</p>
    <p><strong>Aviso de Privacidad:</strong><br>Aceptado</p>
    <p><strong>Seguimiento mediante WhatsApp:</strong><br>{$escapedWhatsapp}</p>
    <p><strong>Fecha:</strong><br>{$escapedDate}</p>
  </main>
</body>
</html>
HTML;

    $textContent = implode("\n", [
        'BUXDEV',
        'Nueva solicitud desde buxdev.com',
        '',
        "Servicio: {$service}",
        "Correo: {$email}",
        "Teléfono: {$cellphone}",
        'Descripción:',
        $description,
        '',
        'Aviso de Privacidad: Aceptado',
        "Seguimiento mediante WhatsApp: {$whatsapp}",
        "Fecha: {$date}",
    ]);

    return [
        'sender' => [
            'name' => $config['from_name'],
            'email' => $config['from_email'],
        ],
        'to' => [
            ['email' => $config['to_email']],
        ],
        'replyTo' => [
            'email' => $email,
        ],
        'subject' => "Nueva solicitud desde BUXDEV — {$service}",
        'htmlContent' => $htmlContent,
        'textContent' => $textContent,
    ];
}

function buxdev_brevo_response_is_success(int $status, string $body): bool
{
    if ($status !== 201) {
        return false;
    }

    try {
        $decoded = json_decode($body, true, 8, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        return false;
    }

    return is_array($decoded) && isset($decoded['messageId']) && is_string($decoded['messageId']);
}

/**
 * @param array<string, mixed> $payload
 * @param array{brevo_api_key: string, from_email: string, from_name: string, to_email: string, allowed_origins: list<string>} $config
 */
function buxdev_send_to_brevo(array $payload, array $config): bool
{
    if (!function_exists('curl_init')) {
        error_log('BUXDEV contact: cURL extension is unavailable.');
        return false;
    }

    try {
        $encodedPayload = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (JsonException) {
        error_log('BUXDEV contact: email payload could not be encoded.');
        return false;
    }

    $handle = curl_init(BUXDEV_BREVO_API_URL);
    if ($handle === false) {
        error_log('BUXDEV contact: Brevo request could not be initialized.');
        return false;
    }

    curl_setopt_array($handle, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $encodedPayload,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'content-type: application/json',
            'api-key: ' . $config['brevo_api_key'],
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    ]);

    $response = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    $curlErrorNumber = curl_errno($handle);
    curl_close($handle);

    if ($response === false) {
        error_log(sprintf('BUXDEV contact: Brevo request failed (cURL %d).', $curlErrorNumber));
        return false;
    }

    if (!buxdev_brevo_response_is_success($status, $response)) {
        error_log(sprintf('BUXDEV contact: Brevo API returned HTTP %d.', $status));
        return false;
    }

    return true;
}

function buxdev_run_contact_endpoint(): never
{
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? ''));
    if ($method !== 'POST') {
        header('Allow: POST');
        buxdev_json_response(405, ['success' => false, 'code' => 'METHOD_NOT_ALLOWED']);
    }

    $contentType = strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
    if ($contentType !== 'application/json') {
        buxdev_json_response(415, ['success' => false, 'code' => 'UNSUPPORTED_MEDIA_TYPE']);
    }

    $contentLengthHeader = (string) ($_SERVER['CONTENT_LENGTH'] ?? '');
    if ($contentLengthHeader !== '' && (!ctype_digit($contentLengthHeader) || (int) $contentLengthHeader > BUXDEV_MAX_REQUEST_BYTES)) {
        buxdev_json_response(413, ['success' => false, 'code' => 'PAYLOAD_TOO_LARGE']);
    }

    $stream = fopen('php://input', 'rb');
    $rawBody = $stream === false ? false : stream_get_contents($stream, BUXDEV_MAX_REQUEST_BYTES + 1);
    if (is_resource($stream)) {
        fclose($stream);
    }

    if ($rawBody === false || strlen($rawBody) > BUXDEV_MAX_REQUEST_BYTES) {
        buxdev_json_response(413, ['success' => false, 'code' => 'PAYLOAD_TOO_LARGE']);
    }

    try {
        $decodedPayload = json_decode($rawBody, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        buxdev_json_response(400, ['success' => false, 'code' => 'INVALID_REQUEST']);
    }

    $config = buxdev_load_config();
    if ($config === null) {
        buxdev_json_response(503, ['success' => false, 'code' => 'SERVICE_UNAVAILABLE']);
    }

    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if (!buxdev_origin_is_allowed($origin, $config['allowed_origins'])) {
        buxdev_json_response(403, ['success' => false, 'code' => 'FORBIDDEN']);
    }

    if (buxdev_honeypot_is_filled($decodedPayload)) {
        buxdev_json_response(200, ['success' => true]);
    }

    $submission = buxdev_validate_payload($decodedPayload);
    if ($submission === null) {
        buxdev_json_response(400, ['success' => false, 'code' => 'INVALID_REQUEST']);
    }

    $brevoPayload = buxdev_build_brevo_payload($submission, $config);
    if (!buxdev_send_to_brevo($brevoPayload, $config)) {
        buxdev_json_response(502, ['success' => false, 'code' => 'DELIVERY_FAILED']);
    }

    buxdev_json_response(200, ['success' => true]);
}

if (!defined('BUXDEV_CONTACT_TEST_MODE')) {
    ini_set('display_errors', '0');
    set_exception_handler(static function (Throwable $error): never {
        error_log('BUXDEV contact: unexpected endpoint failure.');
        buxdev_json_response(500, ['success' => false, 'code' => 'INTERNAL_ERROR']);
    });
    buxdev_run_contact_endpoint();
}

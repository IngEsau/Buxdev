<?php

declare(strict_types=1);

// Fixed, private storage: never constructed from request headers or form data.
const BUXDEV_SECURITY_DIR = '/home/buxdevco/private/contact-security';
const BUXDEV_RATE_IP_LIMIT = 5;
const BUXDEV_RATE_IP_WINDOW = 900;
const BUXDEV_RATE_GLOBAL_LIMIT = 100;
const BUXDEV_RATE_GLOBAL_WINDOW = 3600;

function buxdev_private_storage(): string
{
    $directory = BUXDEV_SECURITY_DIR;
    if (is_link($directory)) {
        throw new RuntimeException('Private storage unavailable');
    }
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Private storage unavailable');
    }
    if (!@chmod($directory, 0700)) {
        throw new RuntimeException('Private storage unavailable');
    }
    $resolved = realpath($directory);
    $webroot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($resolved === false || ($webroot !== false && ($resolved === $webroot || str_starts_with($resolved, $webroot . '/')))) {
        throw new RuntimeException('Private storage unavailable');
    }
    return $resolved;
}

/** Local bounded log; fixed event labels only, no headers, IPs or payloads. */
function buxdev_security_log(string $event, int $status): void
{
    try {
        $path = buxdev_private_storage() . '/events.log';
        if (is_link($path)) return;
        $handle = @fopen($path, 'c+b');
        if ($handle === false) return;
        try {
            if (!@chmod($path, 0600) || !flock($handle, LOCK_EX | LOCK_NB)) return;
            $size = fstat($handle)['size'] ?? 0;
            // Single capped file, no unbounded archive accumulation under attack.
            if ($size >= 1048576) ftruncate($handle, 0);
            fseek($handle, 0, SEEK_END);
            fwrite($handle, json_encode([
                'time' => gmdate('c'),
                'event' => $event,
                'status' => $status,
            ], JSON_THROW_ON_ERROR) . "\n");
            fflush($handle);
        } finally {
            fclose($handle);
        }
    } catch (Throwable) {
        // Logging must not leak filesystem errors or mask the generic response.
    }
}

/**
 * Sliding windows, bounded state and nonblocking exclusive lock.
 * REMOTE_ADDR only: forwarding headers are not a trusted identity source.
 * Returns Retry-After seconds, or zero when the attempt was reserved.
 */
function buxdev_rate_limit(string $address, ?int $clock = null): int
{
    $packedAddress = @inet_pton($address);
    if ($packedAddress === false) throw new RuntimeException('Client identity unavailable');
    $now = $clock ?? time();
    $path = buxdev_private_storage() . '/rate.json';
    if (is_link($path)) throw new RuntimeException('Private storage unavailable');
    $handle = @fopen($path, 'c+b');
    if ($handle === false) throw new RuntimeException('Private storage unavailable');
    try {
        if (!@chmod($path, 0600) || !flock($handle, LOCK_EX | LOCK_NB)) {
            throw new RuntimeException('Private storage busy');
        }
        $size = fstat($handle)['size'] ?? 262145;
        if ($size > 262144) throw new RuntimeException('Invalid rate state');
        $raw = stream_get_contents($handle, 262145);
        if ($raw === false) throw new RuntimeException('Invalid rate state');
        $state = $raw === '' ? ['salt' => bin2hex(random_bytes(32)), 'global' => [], 'clients' => []]
            : json_decode($raw, true, 8, JSON_THROW_ON_ERROR);
        if (!is_array($state) || !is_string($state['salt'] ?? null) || strlen($state['salt']) !== 64
            || !is_array($state['global'] ?? null) || !is_array($state['clients'] ?? null)
            || count($state['global']) > BUXDEV_RATE_GLOBAL_LIMIT || count($state['clients']) > 100) {
            throw new RuntimeException('Invalid rate state');
        }
        $retain = static fn (array $timestamps, int $window): array => array_values(array_filter(
            $timestamps,
            static fn (mixed $timestamp): bool => is_int($timestamp) && $timestamp > $now - $window,
        ));
        $state['global'] = $retain($state['global'], BUXDEV_RATE_GLOBAL_WINDOW);
        foreach ($state['clients'] as $key => $timestamps) {
            if (!is_array($timestamps) || count($timestamps) > BUXDEV_RATE_IP_LIMIT) {
                throw new RuntimeException('Invalid rate state');
            }
            $state['clients'][$key] = $retain($timestamps, BUXDEV_RATE_IP_WINDOW);
            if ($state['clients'][$key] === []) unset($state['clients'][$key]);
        }
        $key = hash_hmac('sha256', $packedAddress, $state['salt']);
        $client = $state['clients'][$key] ?? [];
        $retry = 0;
        if (count($client) >= BUXDEV_RATE_IP_LIMIT) {
            $retry = max(1, min($client) + BUXDEV_RATE_IP_WINDOW - $now);
        }
        if (count($state['global']) >= BUXDEV_RATE_GLOBAL_LIMIT) {
            $retry = max($retry, min($state['global']) + BUXDEV_RATE_GLOBAL_WINDOW - $now);
        }
        if ($retry > 0) return $retry;
        $state['clients'][$key] = [...$client, $now];
        $state['global'][] = $now;
        $encoded = json_encode($state, JSON_THROW_ON_ERROR);
        rewind($handle);
        if (fwrite($handle, $encoded) !== strlen($encoded) || !ftruncate($handle, strlen($encoded)) || !fflush($handle)) {
            throw new RuntimeException('Private storage unavailable');
        }
        return 0;
    } finally {
        fclose($handle);
    }
}

/** @param list<string> $allowedOrigins */
function buxdev_request_source_is_allowed(array $allowedOrigins): bool
{
    $site = strtolower(trim((string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if ($site === 'cross-site') return false;
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') return in_array($origin, $allowedOrigins, true);
    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
    if ($referer !== '') {
        $parts = parse_url($referer);
        if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || !isset($parts['host'])
            || isset($parts['user']) || isset($parts['pass'])) return false;
        $source = 'https://' . $parts['host'] . (isset($parts['port']) && $parts['port'] !== 443 ? ':' . $parts['port'] : '');
        return in_array($source, $allowedOrigins, true);
    }
    return $site === 'same-origin';
}

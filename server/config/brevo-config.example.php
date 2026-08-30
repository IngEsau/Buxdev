<?php

declare(strict_types=1);

/**
 * Plantilla pública de configuración para el formulario BUXDEV.
 *
 * Este archivo NO contiene secretos y puede versionarse. En producción crea
 * manualmente /home/buxdevco/private/brevo-config.php a partir de esta
 * plantilla. Nunca coloques la API key real dentro del repositorio ni de
 * public_html.
 *
 * La integración REST requiere una BREVO API KEY, no una Brevo SMTP key.
 */
return [
    'brevo_api_key' => '',
    'from_email' => 'info@buxdev.com',
    'from_name' => 'BUXDEV',
    'to_email' => 'info@buxdev.com',
    'allowed_origins' => [
        'https://buxdev.com',
        'https://www.buxdev.com',
    ],
];

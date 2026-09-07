# Auditoría de seguridad BUXDEV

Fecha: 2026-09-05. Base: `25328c0` (`feat: analytics & GTM`). Cambios de hardening locales, **sin deploy, commit, push ni cambios en GTM/DNS**. Revisión proporcional inspirada en ASVS 5.0 y OWASP Top 10:2025; no es una certificación ASVS ni una prueba de penetración exhaustiva.

## Arquitectura y límites de confianza

Next.js 16.3.3 / React 19 / TypeScript, App Router con `output: "export"`. Producción sirve HTML, JS, CSS, fuentes e imágenes de `out/`. No hay servidor Node, API Routes, cuentas, sesiones, SQL ni uploads en producción. `server/api/contact.php` recibe JSON y llama por HTTPS a una URL fija de Brevo REST. cURL no sigue redirecciones y verifica TLS. La configuración está en `/home/buxdevco/private/brevo-config.php`, fuera de `public_html`.

El navegador envía únicamente a `/api/contact.php`. El éxito visual requiere HTTP exitoso y `success === true`. GTM `GTM-WJRPHPQN` se carga tras consentimiento analítico; `generate_lead` sólo envía `event` y el enum `lead_type`. La propiedad indicada por el usuario es `G-Y0DW2NV818`; su administración pertenece al contenedor externo, no al frontend.

Hosting: consultas HTTP de lectura mostraron `Server: nginx` y DNS Neubox, junto con las reglas Apache versionadas. Esto es compatible con un proxy delante de Apache, pero no demuestra la topología interna. No hay evidencia verificable de reglas ModSecurity, cuotas de solicitudes ni proxies confiables configurados. No se presume que estén desactivados: deben comprobarse en cPanel/proveedor. Se implementa un fallback PHP porque no había límite de aplicación ni garantía documentada de infraestructura.

## Superficie de ataque

La severidad de exposición no implica que exista una vulnerabilidad en cada fila.

| Entrada / superficie | Riesgo | Evidencia / estado |
| --- | --- | --- |
| JSON público de contacto | HIGH | `server/api/contact.php`: tipos, enum, teléfono, correo, consentimiento, texto y honeypot. Validación existente reforzada. |
| Automatización / cuota de correo | HIGH | No existía rate limiting en el endpoint. Ahora se reservan intentos antes de leer/procesar el body. |
| Origin, Referer, Fetch Metadata | MEDIUM | Antes se admitía Origin ausente. Ahora se comprueba origen exacto y fallback acotado. No son autenticación. |
| Dirección del cliente | MEDIUM | Sólo `REMOTE_ADDR`, nunca `X-Forwarded-For`/`CF-Connecting-IP`. Identificador HMAC privado. |
| Configuración Brevo / FTPS | HIGH | Rutas fijas privadas, API key vacía en ejemplo, `.env*` ignorado. No se detectó exposición de claves. |
| Contenido de email / Reply-To | MEDIUM | `htmlspecialchars` contextual + texto plano ya existían. Destinatario y sender fijos; se rechazan controles y campos extra. |
| GTM / GA externos | HIGH (confianza delegada) | Código remoto mutable autorizado tras consentimiento. CSP acota destinos; cambios futuros de GTM requieren revisión. |
| DOM / JSON-LD / Markdown legal | LOW | `app/layout.tsx` usa script constante; `structured-data.tsx` escapa `<`; legal se renderiza con nodos React desde archivos build-time allowlisted. Sin sink XSS controlado por visitante encontrado. |
| Componente chart con HTML/CSS dinámico | LOW | Configuración de desarrollador, componente reutilizable actualmente no usado por las páginas. No se elimina ni se afirma XSS real. |
| localStorage idioma/tema/consentimiento | LOW | Preferencias, no secretos. Lectura tipada y validada; no permisos de servidor. |
| Query strings / redirects | LOW | No se detectó uso de query strings para HTML, includes o URLs de destino. Redirección canónica a dominio fijo. |
| Export y shell de deploy | MEDIUM | Antes se transfería todo `out/`; ahora allowlist, rechazo de symlinks/maps/secretos, CSP vinculada al build. |
| Dependencias npm | MEDIUM (tooling) | Advisory de Browserslist contextualizado y corregido; no ejecutable Node expuesto en hosting. |

## Findings y correcciones

| ID | Prioridad | Evidencia inicial | Mitigación / estado |
| --- | --- | --- | --- |
| SEC-01 | P1 / HIGH | `buxdev_run_contact_endpoint()` no contenía contador, bloqueo ni respuesta 429. Un cliente automatizado podía repetir POST válidos y consumir Brevo. No se probó spam real. | Corregido localmente: límite por IP y global, locking no bloqueante, expiración, estado limitado y fallo cerrado. Infraestructura volumétrica sigue pendiente. |
| SEC-02 | P2 / MEDIUM | `buxdev_origin_is_allowed('')` devolvía true; no examinaba Fetch Metadata ni Referer. | Corregido localmente: rechaza cross-site y compara Origin exacto; fallback Referer HTTPS y finalmente `same-origin`. Ausencia de señales => 403. |
| SEC-03 | P2 / MEDIUM | `.htaccess` y HTTP live sólo tenían `CSP: upgrade-insecure-requests`; proxy emitía X-XSS-Protection:1, SAMEORIGIN y referrer legacy. | CSP por hashes probada en Apache/navegador; headers actualizados en `.htaccess`. Proxy de Neubox debe verificarse tras deploy, puede añadir/duplicar headers. |
| SEC-04 | P2 / MEDIUM (prevención) | Mirror inverso transfería cualquier archivo introducido en `out/`. `brand/buxdev/SOURCE.md` era público; no contiene secretos. | Allowlist fail-closed y detector de patrones; Source.md permanece en Git/public y se omite del output. Bloqueo HTTP adicional de dotfiles, backups/config, maps y PHP distinto del endpoint. No se afirma fuga actual. |
| SEC-05 | P2 / MEDIUM contextual | `npm audit`: Browserslist 4.28.1, GHSA-c83g-rgw3-j3cx y GHSA-73wf-gq98-2v4g, severidad upstream HIGH. Herramienta de build/lint sin consulta de visitante ni stats no confiables identificados. | Actualizado a 4.28.9 dentro del rango semver, lockfile conservado. Audit total y omit-dev: cero advisories en la ejecución. |
| SEC-06 | P3 / LOW | Teléfono aceptaba `\s`, normalización ocurría antes de rechazar controles y campos JSON adicionales se ignoraban. Destinatarios ya eran fijos y email ya se validaba. | Controles rechazados antes de trim, teléfono máximo 32 bytes, allowlist de campos, booleanos reales. No se atribuye inyección de headers demostrada al código anterior. |
| SEC-07 | P3 / LOW | Honeypot devolvía `success:true` sin enviar email, lo que podía contar un lead falso. | Honeypot responde 400/INVALID_REQUEST; no dispara éxito UI ni lead. Mensajes de éxito reales conservados. |
| SEC-08 | P3 / LOW | Errores usaban `error_log` con destino dependiente del hosting; secreto FTPS exportado a procesos npm por `set -a`. | Logging propio privado acotado y sin payloads; FTPS_PASS shell-local, xtrace apagado. Error log nativo PHP del hosting requiere configuración operacional. |

No se encontraron P0, API keys publicadas ni XSS explotable en las superficies revisadas. El scanner no garantiza ausencia absoluta de secretos y no sustituye la rotación solicitada previamente.

## Endpoint y límites

`server/api/contact-security.php` es un helper fijo requerido por el endpoint; el deploy lo sube antes de `contact.php`, y `.htaccess` impide invocarlo públicamente. No incluye claves. La configuración Brevo existente no requiere cambios de contrato.

- POST únicamente, `405` y `Allow: POST` para otros métodos; sin CORS wildcard ni OPTIONS habilitado.
- `application/json` normalizado, `LimitRequestBody 16384` en Apache para contact.php y máximo 16 KiB leído en PHP aun sin Content-Length. JSON inválido/estructura/campos inválidos => 400; tamaño => 413; formato => 415.
- Enum `cotizacion|informacion|duda`, email <=254 bytes, teléfono <=32 bytes y 8–15 dígitos; descripción UTF-8 de 1–2000 caracteres. Se permite HTML literal como texto, Unicode y saltos de línea; se escapa al generar HTML. No hay filtro de vocabulario.
- Consentimientos booleanos, privacidad obligatoriamente true. Rechazo de to/cc/bcc/sender/apiKey y cualquier campo fuera del contrato.
- 5 intentos por IP / ventana móvil de 15 minutos; 100 intentos totales / hora móvil. También consumen cuota los POST inválidos que llegan a esta fase, y los fallos Brevo. Bloqueo => 429 + Retry-After.
- Ventanas reservadas bajo `flock(LOCK_EX | LOCK_NB)`; archivo único `rate.json`, máximo 256 KiB, hasta 100 identidades y listas acotadas. Filas caducadas se purgan en acceso; no se crean archivos por IP. Salt aleatorio privado + HMAC, sin IP cruda almacenada. Estado corrupto, lock ocupado, IP no válida o almacenamiento inaccesible => 503 antes de Brevo.
- Directorio `/home/buxdevco/private/contact-security` 0700; archivos 0600. Se rechaza symlink directo y ubicación resuelta dentro del DocumentRoot. Es necesario que el usuario PHP pueda escribir en el directorio privado.
- `events.log` contiene hora UTC, código fijo y estado numérico, sin IP, email, teléfono, descripción, claves o respuestas Brevo. Un archivo acotado a aproximadamente 1 MiB, reiniciado al alcanzar el límite; no se acumulan rotaciones. Lock no bloqueante; logging fallido no expone detalles. No es un sistema de alertas.
- Fallos Brevo => 502/DELIVERY_FAILED; configuración/almacenamiento => 503; excepciones => JSON 500 genérico. `display_errors` deshabilitado.

El máximo global protege la cuota, pero puede permitir que un atacante agote el presupuesto y deniegue contacto a visitantes legítimos hasta expirar. Es una decisión explícita para un sitio pequeño, ajustable en constantes según tráfico observado. IPv6 / direcciones rotativas pueden eludir el límite individual, no el global. No hay defensa DDoS de red en PHP; requiere hosting. Si REMOTE_ADDR es la IP de un proxy, el límite se comparte: confirmar remapeo confiable en infraestructura antes del deploy; no habilitar confianza universal en XFF.

No se agrega CSRF token de sesión: no existen sesiones privilegiadas; JSON, origen/Fetch Metadata, rate limiting y honeypot cubren el riesgo del formulario público. No se agrega CAPTCHA ni un timestamp cliente falsificable: no aporta una garantía fuerte adicional; evaluar Turnstile sólo si el abuso residual observado lo requiere y tras revisar claves/CSP/privacidad. No se aplica normalización Unicode destructiva de descripciones libres.

## CSP y headers reales

`npm run build` ejecuta `postbuild` (`scripts/secure-export.mjs`). Examina 11 HTML, calcula los hashes SHA-256 de scripts inline (12 únicos en esta ejecución) e inserta CSP en `out/.htaccess`; no cambia las páginas ni usa nonces estáticos. `security:export` comprueba que hashes y configuración siguen correspondiendo al build. La plantilla `public/.htaccess` por sí sola es restrictiva: desplegar siempre el archivo generado.

| Directiva / origen | Justificación |
| --- | --- |
| default-src, fuentes: self | Assets, Montserrat optimizada por next/font, HTML/JS/CSS locales. |
| script-src: self + hashes + www.googletagmanager.com | Bootstrap Next, preferencias constantes y GTM/Google tag consentidos. Sin unsafe-inline ni unsafe-eval en scripts. |
| script-src-attr: none | No handlers inline necesarios. |
| style-src: self + unsafe-inline | Estilos React/Next Image/Radix observados; quitarlo rompería UI. No autoriza scripts inline. |
| img-src: self, data:, www.googletagmanager.com, *.google-analytics.com | Imágenes locales y fallback/beacons de medición de GA. |
| connect-src: self, www.googletagmanager.com, *.google-analytics.com, *.analytics.google.com | Formulario/prefetch local, Google tag y endpoints regionales de GA. No Brevo en navegador. |
| object-src none, frame-src none, frame-ancestors none | No embeds/iframes funcionales. Impide framing externo. |
| base-uri self, form-action self, upgrade-insecure-requests | Base/destino del formulario local y HTTPS. |

No se permiten dominios Ads/DoubleClick, Google Signals, URLs arbitrarias, ni Preview Mode de GTM automáticamente. La prueba cargó los JS públicos actuales de GTM y Google tag por intercepción; intentos de `/g/collect` se respondieron localmente sin transmisión a Google. Cero violaciones CSP ni excepciones con las etiquetas actuales. Futuras variables Custom JavaScript, HTML personalizado o funciones Ads pueden requerir cambios: revisar antes de publicar. SRI no es apropiado para estos scripts dinámicos; no se añadió un hash que se rompería al publicar GTM. Usar plantillas nativas/variables de capa de datos y proteger administradores GTM con MFA.

Headers Apache: HSTS max-age=31536000 sólo HTTPS (sin includeSubDomains/preload), nosniff, strict-origin-when-cross-origin, DENY, X-XSS-Protection:0, Permissions-Policy mínima, CORP same-origin y eliminación de X-Powered-By. No COEP/COOP por falta de necesidad de aislamiento y compatibilidad con herramientas externas. No Expect-CT/HPKP. Cache y routing previo preservados; HTTP directo al API se rechaza sin reenviar body. ACME sigue accesible.

## Supply chain, secretos y export

- `npm audit` original: 1 paquete HIGH, dos advisories. Tras update selectivo: 0. Actualización sin major; no `npm audit fix --force`.
- Se retiran cuatro declaraciones directas sin uso: autoprefixer (Tailwind v4/PostCSS ya cubre pipeline), tailwindcss-animate (se usa tw-animate-css), immer y use-sync-external-store. Algunos pueden permanecer como peers transitivos; los componentes UI reutilizables y sus dependencias se conservan.
- Un install hook marcado en lockfile: `unrs-resolver`, mediante `napi-postinstall`, prepara binarios nativos y puede recurrir a npm si faltan dependencias opcionales. El deploy usa `npm ci --ignore-scripts`; los binarios de plataforma vienen del lockfile y el build comprueba disponibilidad. No se afirma garantía de integridad de toda la cadena. ESLint 9.39.5 conserva aviso de deprecación upstream; no se hizo un cambio major de tooling por ese aviso.
- `security:secrets` revisó 153 archivos versionados y los 15 commits disponibles (282 blobs únicos), sin patrones de Brevo/GitHub/private keys. Config ejemplo sin clave; no `.env` versionado. Patrones no encuentran todos los formatos; no se imprimen valores coincidentes.
- `security:export` permite sólo rutas conocidas, artefactos Next (incluidos manifiestos y RSC .txt), recursos de imagen/fuente y verificación de dominio existente. Rechaza mapas, env, config, scripts internos, PHP, symlinks y rutas inesperadas. No se borran fuentes; se excluye únicamente SOURCE.md del output generado. 101 artefactos admitidos en esta ejecución.
- Deploy FTPS mantiene verificación TLS y secretos por stdin, no argv; instala/build/test antes de conectar y comprueba export. Sólo publica el export verificado y los dos PHP explícitos. Conserva directorios remotos api/ACME y configuración privada. No se ejecutó deploy ni preflight con credenciales reales.

## Pruebas y evidencia

- `npm run lint`, `npx tsc --noEmit`, `npm run build`, `git diff --check`.
- `php -l` endpoint/helper, `bash -n scripts/deploy-ftp.sh`.
- `npm run test:security`: 43 casos HTTP en servidor PHP local con transporte Brevo sustituido, sin correo real. GET/PUT/DELETE/PATCH/OPTIONS, JSON inválido/null/array, exceso, MIME, Origin/cross-site/Referer/ausencia de señales, tipos, longitudes, CRLF, Unicode, HTML escapado, permisos, logging, Brevo error/timeout, XFF no evade cuota y 429.
- Concurrencia: 16 procesos compiten por misma identidad, máximo 5 admitidos; global 100/h, expiración y estado corrupto que falla cerrado. Export: env, maps, archivos inesperados, symlink, secreto sintético y CSP desactualizada rechazados.
- PHP CLI local 8.5.9 para suite HTTP. Prueba adicional **PHP 8.2.33** en contenedor local sin red: validación, Unicode, escaping, origen, cuotas, expiración y logs. Docker se usa sólo para QA local, no deployment.
- `node tests/security/browser-check.mjs`: Apache TLS local con `.htaccess` generado sin alteraciones; 10 casos de headers/deny/ACME/404/sitemap/robots; 8 páginas × 375/1440 px con una H1, fuentes cargadas, cero imágenes rotas/overflow/violaciones. Contacto con respuestas interceptadas, consentimiento denegado/aceptado, lead único, errores y revocación. Script inline no autorizado bloqueado.
- Producción, sólo lecturas: apex HTTPS 200; HTTP y WWW 301 a apex; HEAD API 405 con Allow:POST/no-store; `.env` y `.git/config` 403, package.json 404. TLS verificó sin `-k`. Las mejoras locales aún no están en producción.
- DNS: SPF publicado (~all), selectores CNAME brevo1/brevo2 y TXT DKIM default presentes; DMARC p=none con reporte a Brevo. No se verificó alineación de un correo entregado ni se modificó DNS.

## NOT APPLICABLE

SQL injection/ORM, uploads/antivirus, autenticación/JWT/passwords/sesiones, XML/XXE, deserialización PHP, URLs SSRF controladas por visitante, includes/paths controlados por input, ejecución de shell del lado endpoint. La llamada Brevo es fija. Los scripts de desarrollo/build sí ejecutan procesos confiables locales y no forman parte del servidor público.

## Riesgos residuales y acciones manuales

1. Confirmar PHP 8.2 actualizado, cURL/ctype/JSON, permisos y escritura en carpeta privada; error_log nativo fuera de public_html, display_errors Off y límites PHP/proveedor razonables. Probar un único envío real autorizado después del deploy.
2. Neubox: verificar ModSecurity, límites/concurrencia del hosting y cadena de proxies; no asumir Cloudflare. Comprobar que `.htaccess`/mod_headers/Options estén permitidos y que nginx no duplique ni sustituya CSP/referrer/XFO/X-XSS. No ocultar Server a costa del servicio.
3. No eliminar rate.json en uso: reinicia las cuotas. Archivar logs privadamente si se requiere retención; el log actual es acotado sin retención histórica garantizada. Ajustar presupuestos con métricas reales, no por petición del cliente.
4. cPanel/Neubox/GitHub/Brevo/GTM/DNS/registrador: MFA, contraseñas únicas, menor privilegio, revisar miembros/tokens/sesiones, recovery codes fuera del repo. Mantener API key rotada y no dar FTP acceso a private.
5. SPF/DKIM/DMARC: revisar alineación con remitentes legítimos antes de endurecer p=none a quarantine/reject. No agregar includes de SPF a ciegas ni cambiar selectores sin Brevo. No habilitar HSTS para subdominios sin inventario TLS permanente.
6. FTPS mirror no es despliegue atómico: conservar snapshot local aprobado y backup privado del sitio antes de publicar; revalidar HTML y chunks tras el deploy. Helpers PHP y .htaccess deben acompañar el export. No copiar únicamente public/.htaccess.

## Referencias

- [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [OWASP Origin / Fetch Metadata](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Google: GTM y CSP](https://developers.google.com/tag-platform/security/guides/csp)
- [Browserslist GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g)

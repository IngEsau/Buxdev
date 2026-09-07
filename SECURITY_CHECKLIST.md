# Checklist verificable de seguridad antes de deploy

Mantener `output: "export"`. Esta checklist no autoriza por sí sola deploys, envíos reales, cambios DNS ni publicación de GTM.

## Repositorio y validaciones locales

- [ ] Revisar `git status -sb` y diff; no incluir archivos de entorno ni claves. API key exclusivamente en configuración privada.
- [ ] Ejecutar en este orden (tests de export requieren build):

```bash
npm ci --ignore-scripts
npm run lint
npx tsc --noEmit
php -l server/api/contact.php
php -l server/api/contact-security.php
bash -n scripts/deploy-ftp.sh
npm run build
npm run security:export
npm run test:security
npm run security:secrets
npm audit
npm audit --omit=dev
git diff --check
```

- [ ] Investigar advisories según alcanzabilidad. No `audit fix --force` sin estudio.
- [ ] Mantener `out/.htaccess` generado, no sustituirlo por la plantilla. Cambios en HTML requieren regenerar hashes.
- [ ] No .map, .env, config privada, PHP o README dentro del export. El checker rechaza artefactos inesperados; aprobar explícitamente nuevas rutas legítimas en `scripts/secure-export.mjs`.
- [ ] Revisar también credenciales con formatos no cubiertos por patrones. Los scanners no prueban ausencia absoluta de secretos.

## QA de CSP y formulario

- [ ] Ejecutar `node tests/security/browser-check.mjs` cuando cambien CSP, Next, GTM o UI. Requiere Brave (o BROWSER_BIN), Docker local, imagen `yiisoftware/yii2-php:8.2-apache`, openssl y curl. Usa puertos locales 19443/19225, carpeta temporal y certificado efímero. Nunca usar esas opciones de TLS para producción.
- [ ] Confirmar cero violaciones CSP y rutas/imágenes/fuentes intactas; prueba desktop/móvil. Scripts arbitrarios inline deben quedar bloqueados.
- [ ] Confirmar formulario success real simulado => UI correcta y lead único si analytics=true. Backend error/timeout/success=false => sin lead. Sin consentimiento => sin GTM; aceptar después no reenvía lead histórico.
- [ ] Revisar origin/Fetch Metadata y rate limits con `npm run test:security`, sin POST a producción.
- [ ] Para comprobar compatibilidad PHP 8.2 sin red ni correo:

```bash
docker run --rm --network none \
  -v "$PWD:/app:ro" --workdir /app --entrypoint php php:8.2-cli \
  -d zend.assertions=1 -d assert.exception=1 tests/security/php82-unit.php
```

## cPanel / proveedor (antes de publicar)

- [ ] Confirmar DocumentRoot y usuario PHP real. `/home/buxdevco/private/brevo-config.php` fuera del webroot, permisos 0600 y carpeta 0700 bajo usuario compatible.
- [ ] El proceso PHP puede crear/escribir `/home/buxdevco/private/contact-security` (0700). Estado/log 0600. No borrar rate.json para resolver errores sin diagnóstico: reinicia la cuota.
- [ ] Verificar `REMOTE_ADDR` con el proveedor. Si hay proxy, configurar remapeo sólo desde proxies conocidos en infraestructura; no confiar en cualquier X-Forwarded-For.
- [ ] ModSecurity y presupuestos del hosting conocidos. Límites actuales: 5 intentos/IP/15 min y 100 globales/h; el global protege cuota pero puede bloquear leads legítimos bajo ataque.
- [ ] PHP actualizado, display_errors=Off, error_log fuera del webroot. Errores públicos sin paths/config/cURL internals.
- [ ] Confirmar mod_headers/mod_rewrite/AllowOverride Options y deny rules; nginx no debe duplicar headers inseguros. No COEP ni HSTS includeSubDomains/preload automáticos.
- [ ] FTPS mantiene certificado verificado; `.env.deploy` 0600 y sólo variables shell confiables. No claves en NEXT_PUBLIC_* ni credenciales exportadas a npm.
- [ ] Backup privado y ruta de rollback preparados. Publicar juntos export generado, `api/contact-security.php` y `api/contact.php`; config privada nunca se transfiere.

## Verificación de lectura después de un deploy autorizado

```bash
curl -I https://buxdev.com/
curl -I http://buxdev.com/
curl -I https://www.buxdev.com/
curl -I https://buxdev.com/contact/
curl -I https://buxdev.com/robots.txt
curl -I https://buxdev.com/sitemap.xml
curl -I https://buxdev.com/api/contact.php
curl -I https://buxdev.com/.env
curl -I https://buxdev.com/.git/config
curl -I https://buxdev.com/api/contact-security.php
```

- [ ] HTTPS válido sin `-k`; HTTP/www a apex. API HEAD 405 + Allow:POST/no-store. Archivos internos 403/404, nunca contenidos.
- [ ] CSP completa con hashes, nosniff, strict-origin-when-cross-origin, DENY, X-XSS-Protection:0, HSTS sin includeSubDomains/preload. Revisar duplicados del proxy.
- [ ] HTML revalida, chunks fingerprinted immutable; 404 real y ACME accesible. Inspeccionar CSP en navegador, no sólo presencia de header.
- [ ] Un solo envío real autorizado para verificar entrega/alineación Brevo; no repetir masivamente ni fuzzear hosting.
- [ ] Probar Tag Assistant conforme a CSP: Preview puede requerir hosts extra sólo en QA. No habilitar unsafe-eval/Ads automáticamente. No PII ni valores monetarios inventados en dataLayer.

## Operación

- [ ] Revisar codes de `events.log` privado sin divulgarlo; rotación acotada pierde historial antiguo. Ajustar alertas del proveedor si hace falta, no publicar logs.
- [ ] MFA/mínimo privilegio/sesiones revisadas en GitHub, GTM, Brevo, cPanel, Neubox y registrador. Recovery codes seguros.
- [ ] SPF/DKIM/DMARC revisados con Brevo. p=none sólo monitoriza; endurecer después de validar todos los remitentes. Sin cambios DNS automáticos.

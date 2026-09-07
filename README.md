# BUXDEV

Sitio web corporativo de BUXDEV desarrollado con Next.js y TypeScript.

## Desarrollo local

```bash
npm install
npm run dev
```

## Formulario de contacto: PHP + Brevo REST

El frontend estático envía el formulario a `/api/contact.php`. El endpoint PHP utiliza cURL para llamar a la API transaccional REST de Brevo; ninguna credencial llega al navegador ni al repositorio.

Configuración de producción:

1. Crea `/home/buxdevco/private/` en cPanel.
2. Copia manualmente `server/config/brevo-config.example.php` como `/home/buxdevco/private/brevo-config.php`.
3. Genera una **Brevo API key** para la API REST; esta integración no utiliza una Brevo SMTP key.
4. Coloca la API key únicamente en el archivo privado y conserva el resto de valores según el entorno.
5. Verifica el remitente y autentica `buxdev.com` con los registros exactos indicados por Brevo.
6. Comprueba que `info@buxdev.com` recibe mensajes y prueba el formulario con un único envío controlado.

El archivo privado está fuera de `public_html`, no se despliega por FTPS y no debe copiarse al repositorio. El ejemplo versionado mantiene `brevo_api_key` vacío.

## Deploy por FTPS

El deploy compila la exportación estática de Next.js, verifica `out/` y publica los dos PHP explícitos `server/api/contact.php` y `server/api/contact-security.php` en `public_html/api/`. No sube el resto del código fuente, `node_modules`, configuraciones privadas ni archivos locales de entorno.

Requisitos locales: Node.js, npm, PHP CLI (ctype/JSON) y `lftp`. El deploy ejecuta las pruebas de seguridad con Brevo simulado.

IndexNow se notifica automáticamente **después de finalizar todas las transferencias FTP**, incluido `.htaccess`. Se envía un único POST HTTPS con las cuatro URLs del sitemap: `/`, `/about/`, `/services/` y `/contact/`. No se notifica durante `DRY_RUN=1` ni cuando falla el build, la validación o la transferencia.

La key de verificación pública `public/eb0d64a2c026422a948a7b49af9d1aa1.txt` se conserva en Git y se comprueba que esté intacta en `out/` antes de transferir; no es una contraseña FTP. Si falta o el sitemap cambia de alcance, se detiene el preflight para evitar publicar una exportación inconsistente.

La notificación tiene un timeout de 10 segundos, sin redirecciones ni reintentos automáticos. Un error de red/HTTP produce una advertencia y **no cambia el código de salida exitoso del deploy web**. HTTP 200 confirma recepción y HTTP 202 indica validación de key pendiente; ninguno garantiza indexación ([documentación IndexNow](https://www.indexnow.org/documentation)). Para validar sin enviar: `node scripts/notify-indexnow.mjs --check`. Tras un deploy ya confirmado se puede reintentar solo la notificación con `node scripts/notify-indexnow.mjs --submit`.

Crea `.env.deploy` en la raíz del proyecto y restringe sus permisos:

```bash
printf "FTP_PASS='contraseña-real'\n" > .env.deploy
chmod 600 .env.deploy
```

El archivo se carga automáticamente y está excluido de Git. Primero ejecuta el preflight seguro; valida build, TLS, credenciales y destino sin transferir ni borrar archivos:

```bash
DRY_RUN=1 npm run deploy:ftp
```

Para publicar:

```bash
CONFIRM_DEPLOY=y \
npm run deploy:ftp
```

La conexión utiliza FTPS explícito en `svgs297.serverneubox.com.mx:21` con el usuario `frontend@buxdev.com`. `ftp.buxdev.com` apunta al mismo servidor, pero no está incluido en su certificado TLS. El script detecta si la cuenta FTP ve `public_html` o si ya está enjaulada en el DocumentRoot. Nunca despliega directamente sobre `/home/buxdevco`; conserva `.well-known`, `cgi-bin`, `.htaccess`, `.ftpquota` y el directorio remoto `api` durante el mirror. Después actualiza el helper, el endpoint y el `.htaccess` generado.

Si la detección automática no coincide con la configuración real del usuario FTP, define `FTP_DIR=/public_html` o `FTP_DIR=/` después de verificar el DocumentRoot en cPanel.

## Seguridad del export y del formulario

`npm run build` genera la CSP por hashes en `out/.htaccess` y verifica la allowlist de artefactos. No desplegar la plantilla `public/.htaccess` directamente. El script actualiza el helper `api/contact-security.php` antes del endpoint y finalmente publica el `.htaccess` generado.

El usuario PHP debe poder escribir en `/home/buxdevco/private/contact-security`; estado y logs están fuera del webroot (0700/0600). Los límites son 5 intentos por IP cada 15 minutos y 100 globales por hora. Origin/Fetch Metadata y validación se comprueban en PHP. Configuración Brevo sigue siendo privada y manual.

Consultar [SECURITY_AUDIT.md](SECURITY_AUDIT.md) y [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) para evidencia, pruebas, requisitos del hosting y verificaciones previas al deploy. No se envían correos reales durante las pruebas locales.

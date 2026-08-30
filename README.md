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

El deploy compila la exportación estática de Next.js, sincroniza el contenido de `out/` y publica únicamente `server/api/contact.php` como `public_html/api/contact.php`. No sube el resto del código fuente, `node_modules`, configuraciones privadas ni archivos locales de entorno.

Requisitos locales: Node.js, npm y `lftp`.

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

La conexión utiliza FTPS explícito en `svgs297.serverneubox.com.mx:21` con el usuario `frontend@buxdev.com`. `ftp.buxdev.com` apunta al mismo servidor, pero no está incluido en su certificado TLS. El script detecta si la cuenta FTP ve `public_html` o si ya está enjaulada en el DocumentRoot. Nunca despliega directamente sobre `/home/buxdevco`; conserva `.well-known`, `cgi-bin`, `.htaccess`, `.ftpquota` y el directorio remoto `api` durante el mirror. Después actualiza exclusivamente `api/contact.php`.

Si la detección automática no coincide con la configuración real del usuario FTP, define `FTP_DIR=/public_html` o `FTP_DIR=/` después de verificar el DocumentRoot en cPanel.

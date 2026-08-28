# BUXDEV

Sitio web corporativo de BUXDEV desarrollado con Next.js y TypeScript.

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Configura las credenciales públicas de EmailJS en un archivo `.env.local`:

```dotenv
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=public_key
```

## Deploy por FTPS

El deploy compila la exportación estática de Next.js y sincroniza únicamente el contenido de `out/`. No sube el código fuente, `node_modules` ni archivos locales de entorno.

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
CONFIRM_DEPLOY=REEMPLAZAR_BUXDEV \
npm run deploy:ftp
```

La conexión utiliza FTPS explícito en `svgs297.serverneubox.com.mx:21` con el usuario `frontend@buxdev.com`. `ftp.buxdev.com` apunta al mismo servidor, pero no está incluido en su certificado TLS. El script detecta si la cuenta FTP ve `public_html` o si ya está enjaulada en el DocumentRoot. Nunca despliega directamente sobre `/home/buxdevco` y conserva `.well-known`, `cgi-bin`, `.htaccess` y `.ftpquota`.

Si la detección automática no coincide con la configuración real del usuario FTP, define `FTP_DIR=/public_html` o `FTP_DIR=/` después de verificar el DocumentRoot en cPanel.

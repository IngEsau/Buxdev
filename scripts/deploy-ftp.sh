#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
readonly BUILD_DIR="${PROJECT_ROOT}/out"

DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${PROJECT_ROOT}/.env.deploy}"

if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
  set +a
fi

FTP_HOST="${FTP_HOST:-svgs297.serverneubox.com.mx}"
FTP_PORT="${FTP_PORT:-21}"
FTP_USER="${FTP_USER:-frontend@buxdev.com}"
FTP_ACCOUNT_PATH="${FTP_ACCOUNT_PATH:-/home/buxdevco}"
FTP_DIR="${FTP_DIR:-auto}"
DRY_RUN="${DRY_RUN:-0}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Falta el comando requerido: $1"
}

lftp_quote() {
  local value="$1"

  if [[ "$value" == *$'\n'* || "$value" == *$'\r'* ]]; then
    fail "Las credenciales y rutas FTP no pueden contener saltos de línea."
  fi

  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}

run_lftp() {
  local commands="$1"

  lftp <<LFTP_COMMANDS
set cmd:fail-exit yes
set net:max-retries 2
set net:timeout 20
set net:reconnect-interval-base 5
set ftp:passive-mode yes
set ftp:ssl-allow yes
set ftp:ssl-force yes
set ftp:ssl-protect-data yes
set ssl:verify-certificate yes
open -p "${FTP_PORT}" -u "${FTP_USER_ESCAPED}","${FTP_PASS_ESCAPED}" "ftp://${FTP_HOST}"
${commands}
bye
LFTP_COMMANDS
}

detect_remote_dir() {
  local root_listing

  if [[ "$FTP_DIR" != "auto" ]]; then
    printf '%s' "$FTP_DIR"
    return
  fi

  log "Detectando la raíz visible para el usuario FTP..." >&2
  if ! root_listing="$(run_lftp 'cls -1a /')"; then
    fail "No se pudo inspeccionar la raíz FTP. Verifica credenciales, hostname y certificado TLS."
  fi

  if grep -Eq '(^|/)public_html/?$' <<<"$root_listing"; then
    printf '/public_html'
    return
  fi

  if grep -Eq '(^|/)index\.html$' <<<"$root_listing" && grep -Eq '(^|/)_next/?$' <<<"$root_listing"; then
    printf '/'
    return
  fi

  fail "No fue posible identificar public_html. Define FTP_DIR=/public_html o FTP_DIR=/ si la cuenta está enjaulada al DocumentRoot."
}

validate_remote_dir() {
  local target="$1"
  local target_escaped
  local listing

  [[ "$target" != *".."* ]] || fail "FTP_DIR no puede contener '..'."
  [[ "$target" != "$FTP_ACCOUNT_PATH" && "$target" != "${FTP_ACCOUNT_PATH}/" ]] ||
    fail "Se rechazó ${target}: nunca se debe reemplazar la raíz completa de la cuenta cPanel."

  case "$target" in
    / | /public_html | "${FTP_ACCOUNT_PATH}/public_html") ;;
    *)
      [[ "${ALLOW_CUSTOM_FTP_DIR:-0}" == "1" ]] ||
        fail "Directorio remoto no reconocido: ${target}. Usa ALLOW_CUSTOM_FTP_DIR=1 únicamente después de verificar el DocumentRoot."
      ;;
  esac

  target_escaped="$(lftp_quote "$target")"
  if ! listing="$(run_lftp "
cd \"${target_escaped}\"
cls -1a .
")"; then
    fail "No se pudo acceder al directorio FTP validado: ${target}."
  fi

  if [[ "$target" == "/" ]] && grep -Eq '(^|/)(\.cpanel|etc|mail|ssl|public_html)/?$' <<<"$listing"; then
    fail "La raíz FTP contiene directorios de la cuenta cPanel; el despliegue debe apuntar a /public_html."
  fi
}

confirm_deploy() {
  local confirmation="${CONFIRM_DEPLOY:-}"

  if [[ "$confirmation" != "REEMPLAZAR_BUXDEV" && -t 0 ]]; then
    printf 'Escribe REEMPLAZAR_BUXDEV para sustituir el contenido web remoto: '
    read -r confirmation
  fi

  [[ "$confirmation" == "REEMPLAZAR_BUXDEV" ]] ||
    fail "Confirmación ausente. Usa CONFIRM_DEPLOY=REEMPLAZAR_BUXDEV."
}

main() {
  local remote_dir
  local remote_dir_escaped
  local build_dir_escaped
  local build_file_count
  local build_size

  require_command npm
  require_command lftp

  [[ -n "${FTP_PASS:-}" && "$FTP_PASS" != "..." ]] ||
    fail "Define FTP_PASS con la contraseña real; nunca se lee desde un archivo versionado."
  [[ "$FTP_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail "FTP_HOST contiene caracteres no válidos."
  [[ "$FTP_PORT" =~ ^[0-9]+$ ]] || fail "FTP_PORT debe ser numérico."
  [[ "$DRY_RUN" == "0" || "$DRY_RUN" == "1" ]] || fail "DRY_RUN debe ser 0 o 1."

  FTP_USER_ESCAPED="$(lftp_quote "$FTP_USER")"
  FTP_PASS_ESCAPED="$(lftp_quote "$FTP_PASS")"

  cd "$PROJECT_ROOT"

  if [[ "$SKIP_INSTALL" != "1" ]]; then
    log "Instalando dependencias reproducibles con npm ci..."
    npm ci
  fi

  log "Validando el proyecto..."
  npm run lint
  npx tsc --noEmit

  log "Generando la exportación estática de Next.js..."
  npm run build

  [[ -f "${BUILD_DIR}/index.html" ]] || fail "El build no generó out/index.html."
  [[ -d "${BUILD_DIR}/_next" ]] || fail "El build no generó out/_next."

  remote_dir="$(detect_remote_dir)"
  validate_remote_dir "$remote_dir"

  remote_dir_escaped="$(lftp_quote "$remote_dir")"
  build_dir_escaped="$(lftp_quote "$BUILD_DIR")"

  log "Cuenta cPanel: ${FTP_ACCOUNT_PATH}"
  log "Destino FTP validado: ${remote_dir}"
  log "Origen local: ${BUILD_DIR}"

  if [[ "$DRY_RUN" == "1" ]]; then
    build_file_count="$(find "$BUILD_DIR" -type f | wc -l)"
    build_size="$(du -sh "$BUILD_DIR" | cut -f1)"
    log "Preflight seguro terminado: TLS, credenciales y destino son válidos."
    log "Build preparado: ${build_file_count} archivos, ${build_size}."
    log "No se ejecutaron comandos de transferencia ni borrado."
    return 0
  fi

  confirm_deploy

  run_lftp "
cd \"${remote_dir_escaped}\"
mirror --reverse --delete --no-perms --parallel=4 --verbose=0 \\
  --exclude-glob \".well-known\" \\
  --exclude-glob \".well-known/**\" \\
  --exclude-glob \"cgi-bin\" \\
  --exclude-glob \"cgi-bin/**\" \\
  --exclude-glob \".htaccess\" \\
  --exclude-glob \".ftpquota\" \\
  \"${build_dir_escaped}\" .
"

  log "Deploy terminado: únicamente el contenido de out/ fue sincronizado."
}

main "$@"

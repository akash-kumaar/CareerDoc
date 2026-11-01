#!/usr/bin/env bash
#
# JobTrack — Part 2 deployment script
#
# Run this ON the Ubuntu EC2 instance, as a sudo-capable user, from the
# directory that contains this repo's `backend/` and `frontend/` folders
# (e.g. after `git clone` or `scp` of the existing Part 1 project to
# /opt/jobtrack).
#
# This script does NOT redesign the app. It installs the required
# packages, creates a dedicated non-superuser Postgres role, runs the
# existing migration, builds the existing frontend, and wires up Nginx +
# systemd exactly per the target architecture.
#
# Usage:
#   sudo APP_DB_PASSWORD='choose-a-strong-password' ./deploy.sh
#
set -euo pipefail

APP_DIR="/opt/jobtrack"
APP_USER="jobtrack"
DB_NAME="jobtrack"
DB_USER="jobtrack_app"
WEB_ROOT="/var/www/jobtrack"

if [ -z "${APP_DB_PASSWORD:-}" ]; then
  echo "ERROR: set APP_DB_PASSWORD before running, e.g.:"
  echo "  sudo APP_DB_PASSWORD='...' ./deploy.sh"
  exit 1
fi

echo "==> Installing required packages (Node.js, PostgreSQL, Nginx)"
apt-get update -y
apt-get install -y curl ca-certificates gnupg postgresql nginx
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Creating dedicated OS user for the app (no login shell)"
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"
fi

echo "==> Copying project into $APP_DIR"
mkdir -p "$APP_DIR"
rsync -a --exclude 'node_modules' --exclude '.git' ./ "$APP_DIR"/
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> Configuring PostgreSQL: local-only, dedicated app role (not superuser)"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${APP_DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL
# Postgres listens on localhost only by default on Ubuntu (listen_addresses
# defaults to 'localhost' and pg_hba.conf only allows local/peer/md5 from
# 127.0.0.1/::1) — intentionally left unchanged so 5432 is never exposed.

echo "==> Running the existing migration as the app role"
PGPASSWORD="$APP_DB_PASSWORD" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 -f "$APP_DIR/backend/src/db/migration.sql"

echo "==> Writing backend .env (not committed to git)"
cat > "$APP_DIR/backend/.env" <<ENV
PORT=5000
HOST=127.0.0.1
DATABASE_URL=postgresql://${DB_USER}:${APP_DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}
ENV
chown "$APP_USER":"$APP_USER" "$APP_DIR/backend/.env"
chmod 600 "$APP_DIR/backend/.env"
# JWT_SECRET intentionally omitted: the existing app has no auth (Part 1
# explicitly excluded it), so there is nothing that requires it.

echo "==> Installing backend dependencies"
cd "$APP_DIR/backend"
sudo -u "$APP_USER" npm install --omit=dev

echo "==> Building the existing frontend (VITE_API_BASE_URL=/api via .env.production)"
cd "$APP_DIR/frontend"
sudo -u "$APP_USER" npm install
sudo -u "$APP_USER" npm run build

echo "==> Deploying frontend build to $WEB_ROOT"
mkdir -p "$WEB_ROOT"
rsync -a --delete "$APP_DIR/frontend/dist/" "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"

echo "==> Configuring Nginx"
cp "$APP_DIR/deploy/nginx-jobtrack.conf" /etc/nginx/sites-available/jobtrack
ln -sf /etc/nginx/sites-available/jobtrack /etc/nginx/sites-enabled/jobtrack
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "==> Configuring backend as a systemd service"
cp "$APP_DIR/deploy/jobtrack-backend.service" /etc/systemd/system/jobtrack-backend.service
systemctl daemon-reload
systemctl enable jobtrack-backend
systemctl restart jobtrack-backend

echo "==> Done. Quick local checks:"
sleep 2
systemctl --no-pager status jobtrack-backend | head -5
curl -sf http://127.0.0.1:5000/api/health && echo " <- backend OK (local only)"
curl -sf http://127.0.0.1/api/health && echo " <- via Nginx proxy OK"

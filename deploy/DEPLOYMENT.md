# JobTrack — Part 2: AWS Deployment Guide

I can't provision AWS resources or SSH into an EC2 instance from this
sandbox (no AWS credentials or network access to AWS from here), so these
are the exact steps for you to run. Everything below matches the spec:
one Ubuntu EC2 instance running Nginx + the existing React build + the
existing Node/Express backend + PostgreSQL, no Docker/Terraform/RDS/etc.

## 1. Launch the EC2 instance (AWS Console or CLI)

- AMI: Ubuntu Server 22.04 LTS (or 24.04 LTS)
- Instance type: t3.micro / t3.small is plenty for this app
- Storage: default (8–20 GB gp3) is fine
- Key pair: create/select one for SSH

## 2. Security group

Create/attach a security group with exactly:

| Type | Protocol | Port | Source        |
|------|----------|------|---------------|
| SSH  | TCP      | 22   | My IP         |
| HTTP | TCP      | 80   | 0.0.0.0/0     |

Do **not** add a rule for 5432 or 5000 — they must stay unreachable from
the internet. The app listens on 127.0.0.1 for both, so even if you
accidentally opened those ports, nothing would be listening on the
public interface — but don't open them anyway (defense in depth).

## 3. Copy the existing project to the instance

From your machine, with the `jobtrack/` folder from Part 1 (including the
new `deploy/` folder and the `frontend/.env.production` file):

```bash
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./jobtrack/ ubuntu@<EC2_PUBLIC_IP>:/home/ubuntu/jobtrack/
```

(or `git clone` your repo directly on the instance if it's in version
control — either way, `deploy.sh` expects to be run from inside that
`jobtrack/` directory.)

## 4. SSH in and run the deploy script

```bash
ssh ubuntu@<EC2_PUBLIC_IP>
cd ~/jobtrack
sudo APP_DB_PASSWORD='pick-a-strong-password-here' bash deploy/deploy.sh
```

The script is idempotent-ish (safe to re-run) and does everything in one
pass: installs Node/Postgres/Nginx, creates a dedicated non-superuser
Postgres role (`jobtrack_app`) and the `jobtrack` database, runs the
existing `migration.sql`, writes `backend/.env` (never committed to git,
mode 600, owned by the app's dedicated OS user), installs backend deps,
builds the frontend with `VITE_API_BASE_URL=/api`, deploys the build to
`/var/www/jobtrack`, configures Nginx from `deploy/nginx-jobtrack.conf`,
and installs/starts `deploy/jobtrack-backend.service` via systemd.

It ends with two local curl checks so you'll immediately see if the
backend and the Nginx proxy are both responding.

## 5. Verification checklist — run these yourself and confirm

```bash
# 1. SSH works — you're already in if you got this far.

# 2. PostgreSQL is running
systemctl status postgresql --no-pager

# 3. Database exists
sudo -u postgres psql -c "\l" | grep jobtrack

# 4. Backend is running (as the dedicated jobtrack_app role, not superuser)
systemctl status jobtrack-backend --no-pager

# 5. Nginx is running
systemctl status nginx --no-pager

# 6. Health check through the backend directly (still local-only)
curl http://127.0.0.1:5000/api/health

# 7. Browser can load the app
#    Open http://<EC2_PUBLIC_IP>/ in a browser

# 8-15. Full CRUD through the public URL (mirrors what we tested locally
#    in Part 1, now against the real deployment):
curl -X POST http://<EC2_PUBLIC_IP>/api/opportunities \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Co","role_title":"QA Check","type":"job","status":"saved"}'
curl http://<EC2_PUBLIC_IP>/api/opportunities
curl -X PUT http://<EC2_PUBLIC_IP>/api/opportunities/<id> \
  -H "Content-Type: application/json" -d '{"status":"applied"}'
curl -X PATCH http://<EC2_PUBLIC_IP>/api/opportunities/<id>/status \
  -H "Content-Type: application/json" -d '{"status":"interview"}'
curl "http://<EC2_PUBLIC_IP>/api/opportunities?search=Test"
curl "http://<EC2_PUBLIC_IP>/api/opportunities?type=job&status=interview"
curl -X DELETE http://<EC2_PUBLIC_IP>/api/opportunities/<id>
curl http://<EC2_PUBLIC_IP>/api/opportunities/<id>   # expect 404

# 16-17. Backend survives SSH logout and restarts on crash
exit                          # close your SSH session
ssh ubuntu@<EC2_PUBLIC_IP>    # reconnect
systemctl status jobtrack-backend --no-pager   # still active
sudo systemctl kill -s SIGKILL jobtrack-backend
sleep 3
systemctl status jobtrack-backend --no-pager   # should show it restarted (Restart=on-failure)

# 18. Confirm ports are actually closed to the outside world
#     (run this from YOUR machine, not the instance):
nc -zv -w3 <EC2_PUBLIC_IP> 5432   # should fail/timeout
nc -zv -w3 <EC2_PUBLIC_IP> 5000   # should fail/timeout
nc -zv -w3 <EC2_PUBLIC_IP> 80     # should succeed
```

Paste any of this output back to me if you want a second pair of eyes on
whether it looks right.

## Files in this deploy package

- `deploy/deploy.sh` — the install/build/configure script described above
- `deploy/nginx-jobtrack.conf` — Nginx site config (static files + `/api` proxy + SPA fallback)
- `deploy/jobtrack-backend.service` — systemd unit (auto-restart, starts on boot, runs as the `jobtrack` OS user)
- `frontend/.env.production` — sets `VITE_API_BASE_URL=/api` so the production build never calls `localhost:5000`
- `backend/src/server.js` — small change from Part 1: now binds explicitly to `127.0.0.1` (was previously implicit `0.0.0.0`), so the backend is not reachable except through Nginx

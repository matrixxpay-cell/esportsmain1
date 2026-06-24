# IndiaEsports — VPS Deployment Guide

> Stack: Ubuntu 22.04 · Node.js 20 · MongoDB 7.0 · PM2 · Nginx

---

## Overview

```
Internet → Nginx :80
              ├── /api/*        → Express backend  :5000
              ├── /socket.io/*  → Express backend  :5000
              └── /*            → Next.js frontend :3000
```

---

## Step 1 — One-time VPS Bootstrap

SSH into your VPS as root or a sudo user, then run:

```bash
curl -fsSL https://raw.githubusercontent.com/matrixxpay-cell/esportsmain1/main/deploy/vps-bootstrap.sh | sudo bash
```

Or copy the file manually and run:

```bash
sudo bash deploy/vps-bootstrap.sh
```

**What it installs:**
- Node.js 20 LTS
- PM2 (process manager)
- MongoDB 7.0 (local)
- Nginx (reverse proxy)
- UFW firewall (port 22 + 80 + 443 open)
- SSH deploy key for GitHub Actions
- Skeleton `.env` files

---

## Step 2 — Fill in Environment Variables

```bash
# Backend secrets
nano ~/esports/backend/.env

# Frontend public config
nano ~/esports/frontend/.env.local
```

See `.env.example` files in each directory for all required values.

> **Minimum required to boot:** `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`

---

## Step 3 — Configure GitHub Actions Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret Name   | Value                              |
|---------------|------------------------------------|
| `VPS_HOST`    | Your VPS IP address (e.g. `123.45.67.89`) |
| `VPS_USER`    | Your SSH username (e.g. `ubuntu`)  |
| `VPS_SSH_KEY` | Private key from `~/.ssh/deploy_rsa` on VPS |
| `VPS_PORT`    | SSH port (usually `22`)            |

**Get the private key from VPS:**
```bash
cat ~/.ssh/deploy_rsa
```

**Get the public key (add to repo Deploy Keys):**
```bash
cat ~/.ssh/deploy_rsa.pub
```

Go to GitHub repo → **Settings → Deploy keys → Add deploy key**  
Paste the public key, name it `VPS Deploy Key`, check **Allow write access**.

---

## Step 4 — First Manual Deploy

After filling in `.env` files, do the first deploy manually on the VPS:

```bash
cd ~/esports

# Clone repo (first time)
git clone https://github.com/matrixxpay-cell/esportsmain1.git .

# Install deps
cd backend && npm ci --omit=dev && cd ..
cd frontend && npm ci && npm run build && cd ..

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # follow the output instructions to enable on reboot
```

---

## Step 5 — Verify Everything Is Running

```bash
# Check PM2 processes
pm2 status

# Backend health check
curl http://localhost:5000/health

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod

# Check public access
curl http://YOUR_VPS_IP/health
```

Expected backend health response:
```json
{"status":"ok","uptime":42.5,"env":"production"}
```

---

## Ongoing Deploys

After setup, every push to `main` branch automatically:
1. Runs tests
2. SSHs into VPS
3. Git pulls latest code
4. Builds frontend
5. Reloads PM2 (zero-downtime)

**Or deploy manually:**
```bash
./deploy/manual-deploy.sh YOUR_VPS_IP ubuntu
```

---

## Adding a Domain + SSL (Optional Later)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update environment variables
nano ~/esports/backend/.env
# FRONTEND_URL=https://yourdomain.com

nano ~/esports/frontend/.env.local
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com

# Rebuild frontend with new URLs
cd ~/esports/frontend && npm run build
pm2 reload ecosystem.config.js --env production
```

---

## PM2 Cheat Sheet

```bash
pm2 status                          # View running processes
pm2 logs                            # Live logs (all processes)
pm2 logs esports-backend            # Backend logs only
pm2 logs esports-frontend           # Frontend logs only
pm2 reload esports-backend          # Reload backend (zero-downtime)
pm2 reload esports-frontend         # Reload frontend
pm2 restart all                     # Restart everything
pm2 monit                           # Real-time monitoring dashboard
```

---

## MongoDB Cheat Sheet

```bash
sudo systemctl status mongod         # Check status
sudo systemctl start mongod          # Start
sudo systemctl restart mongod        # Restart

mongosh indiaesports                 # Connect to DB shell
```

---

## Troubleshooting

| Problem | Command |
|---------|---------|
| Site not loading | `pm2 logs` and `sudo nginx -t` |
| Backend crashed | `pm2 logs esports-backend --lines 50` |
| MongoDB disconnected | `sudo systemctl restart mongod` |
| Nginx 502 Bad Gateway | PM2 processes not running: `pm2 start ecosystem.config.js --env production` |
| Port already in use | `lsof -i :5000` or `lsof -i :3000` |
| Build fails | Check `~/esports/frontend/.env.local` exists with correct values |

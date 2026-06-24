#!/bin/bash
# =============================================================
# Manual deploy script — run FROM YOUR LOCAL MACHINE
# Usage: ./deploy/manual-deploy.sh <VPS_IP> <VPS_USER>
# Example: ./deploy/manual-deploy.sh 123.45.67.89 ubuntu
# =============================================================

set -e
VPS_IP="${1:?Usage: $0 <VPS_IP> <VPS_USER>}"
VPS_USER="${2:-ubuntu}"
APP_DIR="/home/$VPS_USER/esports"

echo "Deploying to $VPS_USER@$VPS_IP:$APP_DIR"

ssh "$VPS_USER@$VPS_IP" bash <<REMOTE
  set -e
  cd "$APP_DIR"

  echo "── Pulling latest code ──"
  git pull origin main

  echo "── Installing backend deps ──"
  cd "$APP_DIR/backend" && npm ci --omit=dev

  echo "── Installing & building frontend ──"
  cd "$APP_DIR/frontend" && npm ci && npm run build

  echo "── Reloading PM2 ──"
  cd "$APP_DIR" && pm2 reload ecosystem.config.js --env production
  pm2 save

  echo "── Health check ──"
  sleep 3
  curl -sf http://localhost:5000/health && echo " Backend OK" || echo " Backend FAILED"
  curl -sf -o /dev/null http://localhost:3000 && echo " Frontend OK" || echo " Frontend FAILED"

  pm2 status
REMOTE

echo "Deploy complete → http://$VPS_IP"

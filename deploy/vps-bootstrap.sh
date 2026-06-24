#!/bin/bash
# =============================================================
# IndiaEsports VPS Bootstrap Script
# Run this ONCE on a fresh Ubuntu 20.04/22.04 VPS as root or sudo user
# =============================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── 1. System packages ──────────────────────────────────────
info "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git build-essential nginx ufw fail2ban

success "System packages installed"

# ── 2. Node.js 20 LTS ───────────────────────────────────────
if ! command -v node &>/dev/null; then
  info "Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
success "Node.js $(node -v) ready"

# ── 3. PM2 ──────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  info "Installing PM2..."
  npm install -g pm2
  pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
fi
success "PM2 $(pm2 -v) ready"

# ── 4. MongoDB 7.0 ──────────────────────────────────────────
if ! command -v mongod &>/dev/null; then
  info "Installing MongoDB 7.0..."
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
    https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
  systemctl enable mongod
  systemctl start mongod
fi
success "MongoDB $(mongod --version | head -1) ready"

# ── 5. Firewall ──────────────────────────────────────────────
info "Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
success "Firewall configured (SSH + HTTP/HTTPS allowed)"

# ── 6. App directory & SSH deploy key ───────────────────────
APP_USER=${SUDO_USER:-ubuntu}
APP_DIR="/home/$APP_USER/esports"

info "Creating app directory at $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Generate deploy key if not exists
if [ ! -f /home/$APP_USER/.ssh/deploy_rsa ]; then
  info "Generating SSH deploy key for GitHub Actions..."
  sudo -u "$APP_USER" ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" \
    -f /home/$APP_USER/.ssh/deploy_rsa -N ""
  cat /home/$APP_USER/.ssh/deploy_rsa.pub >> /home/$APP_USER/.ssh/authorized_keys
  chmod 600 /home/$APP_USER/.ssh/authorized_keys
  echo ""
  warn "==========================================================="
  warn "  Add this PUBLIC key to GitHub repo → Settings → Deploy Keys:"
  warn "==========================================================="
  cat /home/$APP_USER/.ssh/deploy_rsa.pub
  echo ""
  warn "  Add this PRIVATE key to GitHub repo → Settings → Secrets:"
  warn "  Secret name: VPS_SSH_KEY"
  warn "  Value: (content below)"
  warn "==========================================================="
  cat /home/$APP_USER/.ssh/deploy_rsa
  echo ""
fi

success "Deploy key setup complete"

# ── 7. Nginx configuration ───────────────────────────────────
info "Setting up Nginx..."
VPS_IP=$(curl -s https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

cat > /etc/nginx/sites-available/esports <<NGINXEOF
# IndiaEsports — Nginx Reverse Proxy
# Frontend (Next.js) on port 3000, Backend (Express) on port 5000

upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream express_upstream {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name $VPS_IP _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # API routes → Express backend
    location /api/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90s;
    }

    # Socket.io → Express backend
    location /socket.io/ {
        proxy_pass http://express_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://express_upstream;
        proxy_set_header Host \$host;
    }

    # Static assets — cache aggressively
    location /_next/static/ {
        proxy_pass http://nextjs_upstream;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # All other routes → Next.js frontend
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # File upload limit
    client_max_body_size 10M;
}
NGINXEOF

ln -sf /etc/nginx/sites-available/esports /etc/nginx/sites-enabled/esports
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
success "Nginx configured → http://$VPS_IP"

# ── 8. Environment file skeleton ────────────────────────────
ENV_FILE="$APP_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  warn "Creating backend .env skeleton at $ENV_FILE — FILL IN VALUES!"
  cat > "$ENV_FILE" <<ENVEOF
NODE_ENV=production
PORT=5000

# MongoDB (local)
MONGODB_URI=mongodb://127.0.0.1:27017/indiaesports

# JWT
JWT_SECRET=CHANGE_ME_VERY_LONG_RANDOM_STRING_$(openssl rand -hex 32)
JWT_REFRESH_SECRET=CHANGE_ME_REFRESH_$(openssl rand -hex 32)
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL (use your VPS IP or domain)
FRONTEND_URL=http://$VPS_IP

# Email (use Gmail App Password or SMTP relay)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=IndiaEsports <noreply@indiaesports.gg>

# Razorpay
RAZORPAY_KEY_ID=rzp_live_XXXX
RAZORPAY_KEY_SECRET=XXXX
RAZORPAY_WEBHOOK_SECRET=XXXX

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI features)
OPENAI_API_KEY=sk-XXXX

# Admin
ADMIN_EMAIL=admin@indiaesports.gg
ADMIN_PASSWORD=CHANGE_ME_STRONG_PASSWORD
ENVEOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

FRONTEND_ENV_FILE="$APP_DIR/frontend/.env.local"
if [ ! -f "$FRONTEND_ENV_FILE" ]; then
  cat > "$FRONTEND_ENV_FILE" <<FRONTENVEOF
NEXT_PUBLIC_API_URL=http://$VPS_IP/api
NEXT_PUBLIC_SOCKET_URL=http://$VPS_IP
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXX
FRONTENVEOF
  chown "$APP_USER:$APP_USER" "$FRONTEND_ENV_FILE"
fi

# ── 9. Summary ──────────────────────────────────────────────
echo ""
success "============================================"
success "  VPS Bootstrap Complete!"
success "============================================"
echo ""
info "Next steps:"
echo "  1. Edit backend env:  nano $APP_DIR/backend/.env"
echo "  2. Edit frontend env: nano $APP_DIR/frontend/.env.local"
echo "  3. Add VPS_SSH_KEY secret to GitHub repo"
echo "  4. Add GitHub repo Deploy Key (printed above)"
echo "  5. Push to main branch — GitHub Actions will deploy automatically"
echo ""
info "VPS IP: $VPS_IP"
info "Nginx config: /etc/nginx/sites-available/esports"
info "PM2 logs: pm2 logs"
info "MongoDB status: systemctl status mongod"
echo ""
warn "IMPORTANT: Fill in all XXXX values in the .env files before first deploy!"

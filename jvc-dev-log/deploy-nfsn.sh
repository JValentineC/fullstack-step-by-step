#!/bin/bash
# Deploy script for NearlyFreeSpeech.NET
# Usage: bash deploy-nfsn.sh
#
# Prerequisites:
#   - SSH access to your NFSN site
#   - Node.js installed on NFSN (check with: ssh user@ssh.nyc1.nearlyfreespeech.net "node -v")
#   - Your site name set below

# ── Configuration ─────────────────────────────────────
NFSN_USER="jvc_icstarslog"
NFSN_SSH_HOST="ssh.nyc1.nearlyfreespeech.net"
NFSN_SITE_DIR="/home/public"
NFSN_PRIVATE_DIR="/home/private"

# ── Build locally ─────────────────────────────────────
# Override VITE_BASE so assets are served from / (not /fullstack-step-by-step/)
# Set VITE_API_URL so the frontend calls the real backend (not demo mode)
# MSYS_NO_PATHCONV prevents Git Bash from converting "/" to "C:\Program Files\Git\"
echo "1/4  Building frontend..."
MSYS_NO_PATHCONV=1 VITE_BASE=/ VITE_API_URL=https://icstarslog.nfshost.com npm run build

echo "2/4  Building server..."
npm run build:server

# ── Upload to NFSN ────────────────────────────────────
echo "3/4  Uploading files to NFSN..."

# Upload the built server code
scp -r dist-server "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/"

# Upload the built frontend
scp -r dist "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/"

# Upload package.json + lock file (for npm install on server)
scp package.json package-lock.json "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/"

# ── Install production deps on NFSN ──────────────────
echo "4/4  Installing production dependencies on NFSN..."
ssh "$NFSN_USER@$NFSN_SSH_HOST" << 'EOF'
  cd /home/public
  npm install --omit=dev
EOF

echo ""
echo "Deploy complete!"
echo "  - Restart the daemon in the NFSN site panel"
echo "  - Test: curl https://icstarslog.nfshost.com/api/health"

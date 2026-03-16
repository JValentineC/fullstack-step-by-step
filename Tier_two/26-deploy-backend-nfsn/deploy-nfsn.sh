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
echo "1/5  Building frontend..."
npm run build

echo "2/5  Building server..."
npm run build:server

echo "3/5  Generating Prisma client..."
npx prisma generate

# ── Upload to NFSN ────────────────────────────────────
echo "4/5  Uploading files to NFSN..."

# Sync the built server code
rsync -avz --delete dist-server/ "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/dist-server/"

# Sync the built frontend
rsync -avz --delete dist/ "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/dist/"

# Sync package.json + lock file (for npm install on server)
rsync -avz package.json package-lock.json "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/"

# Sync Prisma schema (needed for prisma generate on server)
rsync -avz prisma/ "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/prisma/"

# Sync the daemon startup script
rsync -avz run.sh "$NFSN_USER@$NFSN_SSH_HOST:$NFSN_SITE_DIR/run.sh"

# ── Install production deps on NFSN ──────────────────
echo "5/5  Installing production dependencies on NFSN..."
ssh "$NFSN_USER@$NFSN_SSH_HOST" << 'EOF'
  cd /home/public
  npm install --omit=dev
  npx prisma generate
  chmod +x run.sh
EOF

echo ""
echo "Deploy complete!"
echo "  - Set env vars in $NFSN_PRIVATE_DIR/.env on the server"
echo "  - Enable the daemon in your NFSN site panel"
echo "  - Test: curl https://your-site.nfshost.com/api/health"

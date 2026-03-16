#!/bin/sh
# NearlyFreeSpeech.NET daemon startup script
# Place at /home/protected/run.sh on the server (create via SSH, not upload).
#
# Hardcode env vars here — the daemon process cannot reliably access
# /home/private/.env due to user permission restrictions.
#
# Docs: https://members.nearlyfreespeech.net/faq?q=Daemon

export NODE_ENV=production
export PORT=8080
export CORS_ORIGIN=https://your-site.nfshost.com
export DATABASE_URL="mysql://your_user:your_password@your-dsn.db:3306/your_database"
export JWT_SECRET="replace-with-a-long-random-string"

cd /home/public
exec /usr/local/bin/node dist-server/index.js

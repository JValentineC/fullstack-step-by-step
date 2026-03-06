#!/bin/sh
# NearlyFreeSpeech.NET daemon startup script
# NFSN runs this to start your Node.js app as a persistent daemon.
# Place this file at the root of your NFSN site directory.
#
# Docs: https://members.nearlyfreespeech.net/faq?q=Daemon

export NODE_ENV=production
export PORT=8080

# Load environment variables from .env if present
if [ -f /home/protected/.env ]; then
  set -a
  . /home/protected/.env
  set +a
fi

cd /home/public
exec /usr/local/bin/node dist-server/index.js

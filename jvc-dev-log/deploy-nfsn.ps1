# Deploy script for NearlyFreeSpeech.NET (PowerShell version)
# Usage: .\deploy-nfsn.ps1
#
# Prerequisites:
#   - SSH access to your NFSN site (ssh.exe + scp.exe from Windows OpenSSH)
#   - Node.js installed on NFSN

# ── Configuration ─────────────────────────────────────
$NFSN_USER = "jvc_icstarslog"
$NFSN_SSH_HOST = "ssh.nyc1.nearlyfreespeech.net"
$NFSN_SITE_DIR = "/home/public"
$NFSN_PRIVATE_DIR = "/home/private"
$REMOTE = "${NFSN_USER}@${NFSN_SSH_HOST}"

# ── Ensure run.sh has Unix (LF) line endings ──────────
# Windows editors/git may save with CRLF which breaks /bin/sh on FreeBSD
$runSh = "run.sh"
if (Test-Path $runSh) {
  $raw = [System.IO.File]::ReadAllText((Resolve-Path $runSh))
  if ($raw -match "`r") {
    Write-Host "Converting $runSh to Unix line endings (LF)..." -ForegroundColor Yellow
    $raw = $raw.Replace("`r`n", "`n")
    [System.IO.File]::WriteAllBytes((Resolve-Path $runSh), [System.Text.Encoding]::UTF8.GetBytes($raw))
  }
}

# ── Build locally ─────────────────────────────────────
# Override VITE_BASE so the frontend uses "/" (not the GitHub Pages subpath)
$env:VITE_BASE = "/"

Write-Host "`n1/4  Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n2/4  Building server..." -ForegroundColor Cyan
npm run build:server
if ($LASTEXITCODE -ne 0) { Write-Host "Server build failed!" -ForegroundColor Red; exit 1 }

# ── Upload to NFSN ────────────────────────────────────
Write-Host "`n3/4  Uploading files to NFSN..." -ForegroundColor Cyan

# Clear remote dirs first, then upload fresh copies
Write-Host "  Cleaning remote dist-server/ and dist/ ..."
ssh $REMOTE "rm -rf ${NFSN_SITE_DIR}/dist-server ${NFSN_SITE_DIR}/dist"

Write-Host "  Uploading dist-server/ ..."
scp -r dist-server "${REMOTE}:${NFSN_SITE_DIR}/dist-server"

Write-Host "  Uploading dist/ ..."
scp -r dist "${REMOTE}:${NFSN_SITE_DIR}/dist"

Write-Host "  Uploading package.json + lock ..."
scp package.json package-lock.json "${REMOTE}:${NFSN_SITE_DIR}/"

Write-Host "  Uploading run.sh ..."
scp run.sh "${REMOTE}:${NFSN_SITE_DIR}/run.sh"
scp run.sh "${REMOTE}:/home/protected/run.sh"

# ── Install production deps on NFSN ──────────────────
Write-Host "`n4/4  Installing production dependencies on NFSN..." -ForegroundColor Cyan
ssh $REMOTE "cd /home/public && npm install --omit=dev && chmod -R 755 dist dist-server && chmod +x run.sh && chmod +x /home/protected/run.sh && if command -v sed >/dev/null 2>&1; then sed -i '' 's/\r$//' /home/protected/.env /home/public/run.sh /home/protected/run.sh 2>/dev/null; fi"

Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "  - Set env vars in /home/protected/.env on the server"
Write-Host "  - Enable/restart the daemon in your NFSN site panel"
Write-Host "  - Test: curl https://icstarslog.nfshost.com/api/health"

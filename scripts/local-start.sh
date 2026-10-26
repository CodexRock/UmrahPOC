#!/usr/bin/env bash
set -euo pipefail
cd /workspace/UmrahPOC
mkdir -p runtime
chmod 700 runtime
# Local sandbox only. Use secure cookies and a TLS origin on an actual host.
if [ ! -e runtime/local.env ]; then
  node --input-type=module - <<'JS'
import {randomBytes} from 'node:crypto';import {writeFileSync} from 'node:fs';
writeFileSync('runtime/local.env',`SITE_PASSWORD=${randomBytes(24).toString('hex')}\nSESSION_SECRET=${randomBytes(32).toString('hex')}\nAPP_ORIGIN=http://127.0.0.1:3000\nCOOKIE_SECURE=false\nHOST=127.0.0.1\n`,{mode:0o600,flag:'wx'});
JS
fi
set -a
source runtime/local.env
set +a
npm run worker >runtime/worker.log 2>&1 &
worker=$!
trap 'kill "$worker" 2>/dev/null || true' EXIT
npm start

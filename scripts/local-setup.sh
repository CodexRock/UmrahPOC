#!/usr/bin/env bash
set -euo pipefail
cd /workspace/UmrahPOC
npm ci --ignore-scripts --cache /workspace/.npm-cache
npm run check
npm test

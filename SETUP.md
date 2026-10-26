# Development setup

Requirements: Node 24.19.0 (tested), npm 11.9.0, Codex CLI 0.163.0 for diagnosis only. Use this isolated checkout; do not create a Git worktree unless explicitly requested.

From `/workspace/UmrahPOC`:

```sh
bash scripts/local-setup.sh
npm run doctor
bash scripts/local-start.sh
```

The start command generates a private ignored `runtime/local.env` once. Read its SITE_PASSWORD locally to sign in; never share this file or copy its values to logs. The browser form uses the same local origin as APP_ORIGIN. The local HTTP setting is solely for loopback development. No public preview is provided by onboarding. Stop with Ctrl-C; restart with the same start command. The job database persists. Cancel jobs in the UI. Each login creates a new ownership scope; retain the existing cookie for access to prior jobs.

`npm test` runs isolated HTTP/worker integration and core tests. `npm run check` validates types. Doctor uses supported `codex --version`, `codex login status`, `codex plugin list --json --available`, and `codex mcp list`, saving private diagnostic output. Catalog commands can exit zero despite a failed remote request: inspect the warning, not just the exit code.

## Persistent host (not tested here)

Supply an authorized Linux host, DNS hostname, Docker/Compose, persistent local disk and permitted TLS certificate egress. No host or deployment account has been provided. The Caddy/Compose files are deployment examples and have not been built or deployed. Generate SITE_PASSWORD and SESSION_SECRET securely in `.env`, set APP_ORIGIN to the exact HTTPS origin, HOST=0.0.0.0, COOKIE_SECURE=true and SITE_DOMAIN to the DNS hostname. Run `docker compose up --build -d` only on that authorized host. No owner authentication is mounted in the containers, and no Codex runtime is included: this package runs the blocked workflow only.

For backup, stop API and worker, back up the complete persistent volume (or SQLite's supported backup API), then restart. Never copy an active SQLite main file alone without its WAL. For uninstall, stop processes and remove containers; remove volumes only after explicit confirmation that retained private jobs can be deleted. These deployment/backup instructions are unverified examples.

## Unlocking the provider gate

Use an owner-authorized supported Codex installation on the persistent host. First inspect `codex login --help` and use supported sign-in there if needed. Current sandbox login reports ChatGPT authentication; do not copy its credentials. In the supported CLI, `/plugins` is the documented browser. Retry catalog discovery and inspect each provider's actual schema/terms. Do not guess package identifiers. Do not use `codex exec` for live jobs until discovery/authentication succeeds and search-only execution and evidence can be enforced. No new travel API keys are requested.

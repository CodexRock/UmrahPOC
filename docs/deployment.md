# Deployment package and remaining prerequisites

The current Fastify/SQLite implementation targets one persistent Linux host. Vercel functions do not provide a durable local SQLite volume or a permanent CLI worker. Supabase PostgreSQL/Auth migration has not been implemented; no existing account project was changed.

The owner needs to designate an existing authorized host (or approve a specific priced resource separately) with Docker Compose, local persistent disk, a DNS hostname and secure administrative access. Initial owner authentication must use official Codex mechanisms on that host. Never paste credentials into chat or commit them. No deployment can be completed on the basis of the Vercel/Supabase account names alone.

## Prepared package

- `compose.yaml`: API, worker, Caddy, app/jobs volume and Caddy state; no host Docker socket in app containers; dropped capabilities, no-new-privileges, unprivileged node user.
- `.env.example`: site password, session secret, APP_ORIGIN and site domain placeholders. Generate/store real values on the authorized host using secure facilities; set permissions 0600. `APP_ORIGIN` must exactly match the HTTPS origin.
- `Dockerfile`: pinned Node and lockfile, TLS verification, optional BuildKit proxy CA secret. App and safe probes included. **Codex is not installed in this image**. Missing runtime is explicitly reported.
- `Caddyfile`: HTTPS reverse proxy for the supplied hostname. Public DNS/ports/certificate issuance remain untested here.
- Durable SQLite is local to the host volume; backup through SQLite online backup (or stop both app processes before volume snapshot). Copying only a live WAL main file is unsafe.

## Host acceptance sequence (not executed on a permanent host)

1. Securely provision `.env` and SITE_DOMAIN; verify DNS and supported host access.
2. On that host, choose a pinned official CLI runtime and protected authentication storage through official owner sign-in. Run `npm run probe` in the **same intended worker context**. The app-only default container will correctly fail to find Codex.
3. Resolve the catalog error and action/tool restrictions; verify the required unattended provider probes. Do not enable arbitrary model commands or expose App Server to the Internet.
4. Build and run `docker compose up -d --build` for the app package; host proxy/CA setup, when needed, must follow that host's documentation. Do not embed this session's network configuration.
5. Verify HTTPS login, submit/cancel, storage across API/worker restart, ownership, then a genuine provider run once a verified adapter exists. Check the result explicitly; a stored blocked response is not travel success.
6. Backup protected storage, define restart/retention monitoring, and test restore before relying on availability.

`docker compose down` stops services without removing volumes. Do not use `down -v` to uninstall until the owner explicitly authorizes deletion of job and certificate state.

The existing package can be deployed for diagnostic infrastructure, but autonomous inventory acceptance remains blocked. A permanent URL should only be reported after a real host deployment and independent HTTPS verification.

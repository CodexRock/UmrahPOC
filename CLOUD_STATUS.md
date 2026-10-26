# Managed Codex Cloud — 2026-10-26

The application has been exercised inside the managed cloud development machine; no local Windows installation is required for these tests.

Verified:
- Frozen install, TypeScript check and all seven tests pass.
- npm audit reports zero known vulnerabilities for the installed dependency tree.
- Docker image builds with strict TLS and the session CA mounted only during installation.
- Real unprivileged API and worker containers use a shared temporary local Docker volume.
- Authenticated HTTP submission, idempotency, honest blocked output and persistence across worker restart pass (`python3 scripts/container-smoke.py`). Test containers/volume and generated test credentials are removed afterward.
- Source is pushed to GitHub, not dependent on a local-only commit.

The first container launch failed because sandbox file permissions made copied source unreadable to the non-root user. COPY ownership is now explicit and the affected container test passes. The build context explicitly excludes runtime credentials, databases and unrelated files.

Build in this managed environment (from `/workspace/UmrahPOC`):

```sh
BUILDX_CONFIG=/workspace/UmrahPOC/runtime/buildx docker --host=unix:///var/run/docker.sock build --secret "id=proxy_ca,src=$CODEX_PROXY_CERT" -t umrah-proof:cloud-test .
python3 scripts/container-smoke.py
```

These commands use the session's configured Docker proxy and trusted CA; no verification is disabled. On a normal authorized host without the session proxy, the optional secret is unnecessary. Caddy/HTTPS/Compose deployment remains untested.

## Still blocked

`codex plugin list --available --json` on codex-cli 0.163.0 still returns a remote-catalog HTTP 451 `no_biscuit_no_service` despite ChatGPT login being reported. No plugins or MCP servers are discovered; no travel searches are run. No supported plugin path has been demonstrated here. The worker deliberately does not invoke Codex. The error is an observation in this cloud machine only, not a result for the user's local machine.

Publishing this development environment is a product action, distinct from deploying a permanently reachable web service. The available tools save the draft but cannot invoke publication or inspect its internal failure. Previous UI attempts failed with a generic error. Do not claim publication, future-task restoration, persistent hosting, or live travel compatibility until each is verified.

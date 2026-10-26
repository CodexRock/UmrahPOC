# UmrahPOC

Private English-language Omra planning proof. No reservations or payments. Node >=24.

**Current priority: plugin-only conversational planner.** An owner-approved Paris-Orly session now has real eDreams flights, both Booking.com stays, XE conversion and a validated **EUR 1,500.77 quoted subtotal for two adults**; final payable extras remain unknown. See [the session and workflow](docs/CONVERSATIONAL_PLANNER.md).

Unattended access to those same plugins is still unproven: CLI catalog HTTP 451 (`no_biscuit_no_service`). [Documented execution paths](docs/PLUGIN_EXECUTION.md) were investigated without supplier APIs or separately configured supplier MCPs. **Hosting and UI work are paused** until a same-plugin worker invocation is demonstrated. There is no permanent deployment URL.

Implemented:
- Fastify password/session API, strict inputs, origin/ownership checks and durable SQLite queue.
- Separate worker runs a bounded real CLI capability probe for each claimed job; readable provider diagnostics and cancellation, no fixed historical error.
- Deterministic evidence/date/occupancy/price validation and assembly with integer currency conversion, group/average totals, deduplication and honest partial inventory. This library awaits a supported live provider boundary; it is **not** wired to supplier ingestion.
- Process-array runner with deadlines, output limits and process-group cancellation. No unrestricted Codex search executor.
- Unprivileged Docker/Compose/Caddy package. Default image contains no Codex/auth.

Verified cloud commands:

```sh
npm ci
npm run check
npm test
npm audit
npm run probe
```

Probe/doctor exits 2 on blocked access and saves only safe diagnostic categories in ignored `runtime/capabilities.json`. Tests use synthetic provider fixtures and a simulated failing CLI where specified; fixtures never count as live travel proof. `npm run dev` is an optional development-only entrypoint, not a permanent deployment.

Read [CAPABILITIES.md](CAPABILITIES.md), [FEASIBILITY_REPORT.md](FEASIBILITY_REPORT.md), [TEST_REPORT.md](TEST_REPORT.md), [CLOUD_STATUS.md](CLOUD_STATUS.md), [docs/deployment.md](docs/deployment.md), and [docs/provider-instructions.md](docs/provider-instructions.md). Older SETUP.md / TESTER.md describe historical/local workflows; the current reports govern capability and deployment claims.

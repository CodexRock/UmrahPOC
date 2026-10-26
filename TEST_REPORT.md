# Verification — 26 October 2026

## Automated checks

- `npm ci`: installed from lockfile in cloud Node 24.19.0.
- `npm run check`: TypeScript passes.
- `npm test`: **22 passed, 0 failed, 0 skipped**. Deterministic tests cover strict malicious/unknown inputs; Saudi overnight arrival and exclusive nights; integer rounding and currency precision; ordinary/member/unknown price rejection; rooms/airports/date mismatches; evidence freshness and binding; missing XE retains originals; no inventory; deduplication; three distinct combinations; idempotency/conflict/ownership; queue limits; expired leases, late-result protection, cancellation and terminal states; process deadlines/output caps/descendant cancellation; exit-zero catalog failures; HTTP submission/worker/restart persistence.
- HTTP tests use an explicitly simulated failing CLI executable in a temporary directory. Price/inventory tests use synthetic fixtures. Neither counts as live provider proof.
- `npm audit --json`: zero reported vulnerabilities at verification.

## Genuine observations, separately classified

- `npm run doctor` / `npm run probe`: host CLI 0.163.0, ChatGPT login, catalog **HTTP 451 / no_biscuit_no_service**, exit 0 despite failure, no installed/available plugins. Correct blocked classification; safe ignored JSON report, exit 2.
- `npm run test:browser`: real system Chromium, real API, real durable worker and host CLI catalog request. Login → form submission → readable blocked diagnostic. Reload restores signed session and stored job. Desktop 1280×900 and mobile 390×844 checked; no horizontal overflow or JavaScript page errors. Screenshots in ignored `runtime/browser/`. This is infrastructure-to-diagnostic evidence, not a supplier search. Browser executable defaults `/usr/bin/chromium`; override `CHROMIUM_PATH` where needed. No browser or machine work required from the owner.
- Conversation probes: Booking.com (10 hotels in each city), Trip.com flights (9 options), eDreams (10 itineraries), Tripadvisor enrichment, XE live timestamped conversion. Skyscanner not called due final-widget rule. Trip.com hotels not called due occupancy restriction. Initial Booking uppercase country validation failed; corrected once to lowercase, no duplicate successful search repeated.
- No complete trip total, three real journey cards or unattended supplier call was established. Supplier searches in chat were not copied into website jobs.

## Container and deployment boundary

The image is built in the managed cloud using BuildKit CA secret with TLS verification enabled. `BUILDX_CONFIG` uses a writable scratch directory while preserving Docker auth/config. `.dockerignore` explicitly permits only app sources/public assets, package files, Dockerfile and two safe probe scripts. No runtime/auth files enter build context.

The Docker smoke uses separate unprivileged API/worker processes sharing a named SQLite volume; idempotent authenticated submission and result persistence across worker restart are checked. The default image has **no Codex CLI**, so its real observed gate is missing-runtime `spawn_failed`, not the host CLI's 451. These are distinct observations. No host Docker socket is mounted into app containers.

Public Compose/Caddy HTTPS deployment, permanent service availability, recovery on a designated host, provider action allowlisting, provider billing/call budgets, and full browser → Codex → supplier flow remain unverified.

## Latest conversational validation

`npm run validate:conversation` ran against snapshots exported directly from actual conversation plugin responses. It confirmed ORY/JED dates and airports, four + three hotel nights/occupancy, EUR 1,002 ordinary group fare (= 501 × 2), SAR 2,091.43 whole-stay hotel totals, XE SAR/EUR 0.2384830521 at 2026-10-26T19:55:00Z, EUR 498.77 hotel conversion, EUR 1,500.77 quoted subtotal and EUR 750.39 average. Final payable total remains null; missing baggage, possible extras/rate conditions, early arrival, last-night transit and transfers are disclosed. Two new tests use synthetic fixtures to reject mismatched airports, dates, occupancy, public/group fare and FX amounts/freshness; no fixtures count as real provider evidence. No additional browser, UI or hosting work was performed for this update.

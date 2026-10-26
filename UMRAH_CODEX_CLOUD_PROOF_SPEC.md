# Autonomous Umrah Planner — Cloud Codex Technical Proof

Version 1.0 · 26 October 2026 · Implementation handoff to Codex

## 1. Mission and non-negotiable outcome

Build and test a small private application that accepts an Umrah trip request from a webpage, automatically sends it to Codex running on a persistent cloud server, uses supported installed travel plugins to obtain real search results, and returns structured results to the webpage. No person may initiate an individual Codex job, copy a prompt, approve ordinary search calls, transfer results, or edit an itinerary in the successful end-to-end path.

The traveler enters preferences and later books directly with suppliers through returned links. This proof performs no reservations or payments.

The central hypothesis is NOT yet verified: the exact travel plugins available in the owner's ChatGPT conversation may or may not be available and usable in unattended Codex CLI jobs. Prove this before substantial UI development. General Codex plugin support is not proof of any particular plugin's compatibility.

Do not substitute separate travel partner API onboarding, scraping, browser automation of ChatGPT, mocked inventory, or manual operation for the requested mechanism. If the mechanism is unavailable, deliver an evidence-backed blocked/partial result and the runnable independent components. Do not claim success by changing the hypothesis.

## 2. Product context and proof boundary

The future product is a multilingual Umrah journey planner offering 3–5 self-booked combinations of flights, Makkah accommodation, Madinah accommodation, and optional ground transport. It will support Ramadan/Hajj planning guidance, Arabic/French/English/Spanish, currencies, and conversation-based refinement.

This proof establishes the autonomous execution loop, provider access, data fidelity, and honest failure handling. It is not the full travel agency product.

### Included

- Private, password-protected, responsive one-page search/results application.
- One persistent Linux cloud host running a supported Codex installation and a durable job worker.
- Owner-authorized plugin installation and supported initial authentication.
- A browser request that triggers a job without owner intervention.
- Genuine tool invocations, structured results, validation, and booking links.
- Flight search, two hotel searches, and one live currency conversion where tool access allows.
- Three materially different complete journey options if sufficient compatible inventory exists.
- Live progress, independent provider status, cancellation, timeout, and worker recovery.
- Redacted evidence, reproducible setup, tests, and a final feasibility report.

### Excluded

- Payments, reservations, airline ticketing, visa issuance, Nusuk permit issuance.
- Automatic purchase or use of paid subscriptions, new commercial provider contracts, or paid hosting without existing authorization.
- Production public launch, multi-tenant account sharing, production legal clearance, or scale guarantees.
- Voice, comprehensive chat, maps, itinerary PDF export, full multilingual UI, and ground-transport pricing.
- Automatic religious eligibility determinations or projected Hajj restrictions presented as confirmed rules.

## 3. What is known and what must be tested

Official documentation describes Codex non-interactive execution, structured output, plugins on supported CLI surfaces, remote authentication, and an App Server for embedding Codex. These are useful building blocks. They do not establish identical tool availability across ChatGPT Work, Codex cloud tasks, CLI, API authentication, or a self-hosted worker.

Do not confuse a self-hosted cloud VM running Codex CLI with an OpenAI-managed cloud coding task. The proposed primary route is the former. Do not assume this current conversation's execution environment is a durable server or can accept future website requests.

Use the current official documentation and installed CLI help. Pin the tested Codex version and record the authentication method, surface, OS, available tool schemas, and limits. Do not invent flags or internal endpoints.

## 4. Phase A — Capability gate, before the website

### A1. Inspect the real environment

Read repository instructions. Identify existing deployment resources, runtimes, cloud permissions, and secret facilities without printing credentials. Check whether Codex CLI and Docker are installed. Use a new isolated repository/directory; preserve unrelated work.

If a persistent cloud host is unavailable, prepare the deployable project locally and report live deployment as unverified. Do not describe a local container or temporary coding sandbox as an always-running cloud service.

### A2. Install and authenticate through supported paths

Install a current supported Codex CLI release and pin the tested release. Use the supported plugin catalog/marketplace workflow and supported account sign-in. One-time owner authentication or consent is allowed; ongoing per-search approval is not.

Never extract hidden ChatGPT backend tokens, reverse engineer private app proxies, reuse browser cookies, expose authentication files, or copy service credentials from this chat's runtime. Do not assume ChatGPT sign-in automatically authorizes public third-party customer usage. Record applicable authentication and usage restrictions as a separate launch review item.

If sign-in is required, finish independent setup first and give exact instructions for the supported login. Mark the live gate pending until completed; never fabricate an authenticated test.

### A3. Inspect all six requested providers

| Provider | Target role | Required investigation |
| --- | --- | --- |
| Booking.com | Both hotel stays | CLI availability, unattended access, dates, guests/rooms, prices, links |
| Trip.com | Flights | CLI availability, traveler totals, baggage, routes, output rules |
| eDreams | Flight alternative | CLI availability, ordinary vs membership fares, booking links |
| Skyscanner | Flight/date alternative | CLI availability, widget and final-action restrictions |
| Tripadvisor | Hotel enrichment | CLI availability, ratings, content reuse and display requirements |
| XE Currency Converter | Currency conversion | CLI availability, actual rate, timestamp, supported output |

Resolve canonical identifiers through supported discovery. Do not assume the ChatGPT app IDs provided in conversation are installable CLI package names. Inspect the actual tool descriptions and provider instructions before invoking them. Tool metadata must be redacted if it includes secrets.

Write a capability matrix with these distinct statuses: not_discovered, installable, installed, authentication_required, callable_interactively, callable_unattended, output_incompatible, restricted_for_use_case, unavailable, and tested_failed. Installation alone is not success.

### A4. Run bounded real probes

Use future dates outside known restricted periods, a simple route such as Paris–Jeddah return, two adults, one room, and separate Makkah/Madinah hotel stays. Derive exact dates at execution time, display them in the report, and verify official seasonal rules for the chosen dates before labeling them suitable for Umrah. If restrictions are unknown, test inventory only and label religious/entry eligibility unverified.

Each probe must produce a recorded real tool invocation and response in an unattended process. Require at least one flight source, one hotel source that works in both cities, and XE for the full requested proof. Tripadvisor and additional flight sources are optional enrichment; record their actual state.

Some current ChatGPT tools impose UI/turn constraints. For example, Skyscanner live search currently requires a final-action widget response. Do not bypass or silently discard such constraints to force JSON aggregation. Recheck current rules; if incompatible, mark this tool output_incompatible and use a compatible installed flight plugin if available. Trip.com hotel search currently has restrictions that may make it unsuitable for guest/room/price-constrained searches. Respect discovered rules; do not omit constraints to force a call.

### A5. Gate decision

- PASS: required categories return genuine usable data unattended with supported authentication and presentation behavior.
- PARTIAL: at least one real plugin works but one or more required categories fail, lack necessary price semantics, or cannot be rendered as required.
- BLOCKED: no usable unattended plugin path, required authentication cannot be completed, or the supported interface cannot expose required tools.

Continue independent application work after a partial/blocked gate, but disable unsupported live features and retain the gate outcome. Do not initiate alternative commercial API onboarding without a scope decision. No repeated speculative attempts to access unavailable internal infrastructure.

## 5. Primary implementation architecture

Use a small TypeScript monorepo, a simple web frontend/API, SQLite for durable jobs/results, and one background worker. Run on a persistent Linux host using Docker Compose with a reverse proxy for HTTPS. React/Vite plus Fastify is a suitable default; avoid unnecessary Redis, Kubernetes, and microservices. Pin dependencies and commit a lockfile.

The API and worker share SQLite on a local persistent host volume, not a network filesystem. Use WAL, transactional job claims, bounded busy handling, and explicit migrations. One worker with concurrency one is enough for this proof.

### Sequence

1. Authenticated browser submits validated preferences and an idempotency key.
2. API commits a queued job and returns HTTP 202 with an opaque job ID.
3. Worker atomically claims the job and starts an isolated Codex process.
4. Codex invokes only allowed travel-search/conversion tools and returns candidate data with provenance.
5. Deterministic code validates and assembles the result, calculates totals, and saves it transactionally.
6. Browser polls the job endpoint and renders progress/results; reopening the page recovers the job.

Use Codex SDK or non-interactive CLI after confirming actual plugin support in that route. Prefer non-interactive CLI for the smallest proof if compatible. App Server is an alternative only if testing demonstrates it solves a specific plugin-access or control requirement. Never mix access claims across runtimes.

The persistent service waits for jobs; it does not keep generating tokens while idle. Create a fresh Codex conversation and isolated workspace for each job. Never mix traveler histories or allow one request to read another request's files. Platform-managed owner authentication remains in a protected service context, outside job-readable files whenever supported.

## 6. Request contract

Validate with a strict schema; reject unknown fields and excessive sizes. Use ISO dates, IATA codes where applicable, ISO 4217 currencies, and a validated locale.

```json
{
  "originAirport": "CDG",
  "arrivalAirport": "JED",
  "departureAirport": "JED",
  "outboundDate": "<YYYY-MM-DD>",
  "returnDate": "<YYYY-MM-DD>",
  "cityOrder": ["makkah", "madinah"],
  "makkahNights": 4,
  "madinahNights": 3,
  "adults": 2,
  "rooms": 1,
  "displayCurrency": "EUR",
  "locale": "en",
  "preferences": {"checkedBaggagePreferred": true}
}
```

The sample is a shape, not executable dates. Provide a runnable dated fixture generated during setup.

For the first live test, use same-airport returns. Support different Saudi arrival/departure airports only if the chosen flight tool supports the itinerary or explicit separate-ticket searches; flag separate tickets and do not imply a protected through booking. Country-only origins, children, flexible dates, and complex room splits can remain future work.

The selected flight's arrival date determines the first hotel check-in. Hotel checkout is exclusive; sum nights and derive both stays deterministically. Account for overnight flights and Saudi time (Asia/Riyadh). Validate last checkout against the return flight and disclose transfer feasibility as unverified where no transport schedule is available. Never shift a hotel stay without showing the final dates to the traveler.

No passport scans, payment details, or sensitive documents are needed.

## 7. Result contract and price integrity

Implement versioned JSON schemas shared by worker, API, and frontend. Each component must include a source, tool name, observed timestamp, evidence ID, actual query dates, occupancy, and a supplier-returned booking URL when present.

Suggested top-level fields:

```json
{
  "schemaVersion": "1.0",
  "jobId": "<opaque-id>",
  "status": "succeeded|partial|failed|blocked|cancelled",
  "generatedAt": "<ISO-8601>",
  "request": {},
  "providers": [],
  "journeys": [],
  "warnings": [],
  "missingComponents": [],
  "evidenceIds": []
}
```

Document complete typed schemas in the repository; the abbreviated shape above does not replace implementation schemas.

For every flight/hotel offer preserve: supplier name, offer/property identifier if returned, original amount/currency, price basis, traveler/room counts, stay length, taxes/fees information, membership requirements, cancellation/baggage information when returned, price observation time, and link scope (exact offer, property, or search page).

Do not guess whether a price means per-night, per-person, or group total. Unknown semantics make an offer unsuitable for a complete journey price. Never multiply hotel stay totals by nights again. Never show eDreams Prime pricing as generally available. Children or unequal costs must not be silently treated as adult equal shares.

Each journey must expose original component amounts, converted amounts, group total, average per adult, included components, exclusions, and unresolved costs. Use decimal-safe arithmetic and currency-specific minor units; never sum different currencies before conversion. Store XE rate pair, timestamp, and source. A failed conversion leaves original prices available but cannot yield a fabricated converted total.

No transfer, visa, insurance, meal, or other cost is assumed included. For this proof label the price scope explicitly as flights + two hotel stays, with ground transport/visa/other costs excluded. Do not advertise a complete all-in Umrah package.

Use actual returned URLs unchanged, including attribution parameters. Validate HTTPS and expected supplier domains without removing parameters. Render a general property/search link with the right label; do not claim it reserves or reproduces the exact offer. No synthetic offer IDs or booking links.

## 8. Candidate selection and three options

Collect a bounded pool, deduplicate by provider/offer and property/stay identity, and reject dates/occupancy mismatches. Assemble feasible combinations using deterministic code. The AI may explain trade-offs but must not create prices or availability.

Return Essential, Balanced, and Comfort when real candidates support meaningful differences. Essential favors lowest comparable cost; Balanced weighs price, stops/duration and available hotel-location evidence; Comfort favors easier flights and verified convenience. If data does not support a criterion, omit it and explain that limitation.

Do not relabel the same combination three times. One or two valid options are acceptable partial results; never invent extras. A hotel coordinate distance is not a verified walking route. No claimed mosque walking time unless supported by a permitted source.

## 9. Minimal webpage

One private page with a compact form, Generate options button, progress area, provider status, three result cards where available, an expandable breakdown, and retry/cancel controls. Use clear English for the proof; structure labels for later localization.

Show real states: queued, searching flights, searching hotels, converting, validating, ready, partial, blocked, failed, and cancelled. Only report provider activity observed in real events; do not fabricate progress percentages. Never render raw tool text as HTML.

Each card shows total scope, group/average price, flight schedule, both hotel dates, room assumptions, provider links, observation time, and exclusions. An explicit message states that suppliers confirm price/availability at booking and each component is booked separately.

No fake results on initial load. Fixtures belong in a clearly separated development/test mode and must never appear as live results. The page survives refresh and restores its current job.

## 10. Job lifecycle and failure semantics

Durable states: queued → running → succeeded/partial/blocked/failed/cancelled. Keep finer progress events separately. Use leases, heartbeat, attempt count, and transactional claims. A second worker must not process the same active lease.

Default policy: one concurrent job, maximum five queued jobs, ten-minute whole-job deadline, at most twelve provider-search/conversion calls per attempt, and one explicit operator-configured retry for transient failures. Implement bounds at the orchestration/host layer where observable. Do not pretend a prompt alone enforces a hard tool or spending cap. If a runtime cannot provide hard tool-count enforcement, enforce run/time budgets and disclose that limitation.

Retry transient provider errors only where allowed, using retry-after/bounded backoff. Do not replay identical calls when a provider forbids it. Reauthentication, unsupported plugins, and permission failures are terminal blocked states, not infinite retry loops. Partial provider success remains visible.

Cancellation terminates the job process tree and prevents late results from overwriting cancelled state. Crash recovery marks interrupted attempts and records whether a new search was required. Do not claim exactly-once remote searches across crashes; achieve idempotent job submission and result persistence and disclose possible repeated read calls.

## 11. Execution and security requirements

- Invoke Codex using process argument arrays and stdin, never shell interpolation or eval. Treat all traveler fields and provider content as untrusted data.
- Use a fixed instruction template and structured inputs; permit no user-supplied commands, model flags, tool names, callback URLs, filesystem paths, or arbitrary prompts in the proof.
- Discover and allowlist only needed search/conversion actions. Do not grant booking, sending, wishlist mutation, or payment tools. If fine-grained limits cannot be enforced, record the limitation and keep the proof isolated/private.
- Preserve runtime and provider approval rules. Do not disable safeguards to make an unsupported plugin usable. A tool that requires unavoidable per-search approval fails the unattended criterion.
- Use least-privilege execution and an unprivileged container. Mount only job workspaces and needed persistent state. No host Docker socket, broad host filesystem, or unrelated environment secrets inside jobs.
- Protect the private site with server-side authentication, HTTPS, CSRF/origin checks, session expiry, and request throttling. Never expose Codex App Server directly to the internet.
- Keep owner authentication and plugin secrets out of frontend bundles, logs, test fixtures, repository, results, and downloadable evidence. Use platform-supported authentication storage and strict permissions.
- Keep booking-link parameters intact, but do not render authentication tokens or private callback data. Redact logs before persistent storage.
- Protect result endpoints with ownership/session checks. Use opaque job IDs; knowing an ID alone is not authorization.
- Default to 24-hour retention for private job data; purge transient workspaces and redacted provider evidence on a configurable schedule. Store no raw reasoning traces. Retain minimal event/provenance records needed for this proof.

Owner sign-in on a cloud machine is a technical option, not a promise of unlimited or permitted public service use. Record plan limits and any documented deployment/usage constraints. Expired authentication must produce a clear blocked state; do not claim permanent zero-maintenance operation.

## 12. Evidence and observability

Record job/attempt IDs, timestamps, Codex version, auth mode without tokens, discovered plugin/tool names, actual tool-call events, normalized responses, provider errors, validation decisions, elapsed time, and available usage metrics. Do not infer an exact monetary cost from token counts unless the applicable pricing is verified; subscription usage and API billing are different.

Provider identity must come from actual runtime events or a trusted invocation boundary, not solely from the model saying it used Booking.com. A schema-conforming JSON response is not proof of a live search. Where tool payloads are unavailable, identify the precise evidence limit and reduce the verdict accordingly.

Capture redacted snapshots/fixtures only where provider rules permit. Never persist owner credentials or full sensitive traces to obtain evidence. Use screenshots of the private UI only with non-sensitive test inputs, if the environment supports browser QA.

## 13. Required tests

| Test | Acceptance |
| --- | --- |
| Capability probe | At least one real unattended invocation per required category, with evidence |
| Full browser loop | Submit on webpage; results return with no operator step |
| Flight + hotels + FX | Real flight, both city stays, actual XE conversion; valid price semantics |
| Three options | Distinct, evidence-backed combinations, or an honest partial inventory outcome |
| Arithmetic | Correct per-stay/group conversion and per-person average; unknown bases rejected |
| Overnight flight | Hotel check-in follows Saudi arrival date; nights stay consistent |
| No inventory | Clear empty/partial result with no invented offer |
| Plugin unavailable | Explicit blocked provider state; other results remain usable |
| Authentication expires | No loop or secret leak; actionable blocked status |
| Timeout/cancel | Process terminates; terminal state cannot be overwritten |
| Duplicate submit | Same idempotency key returns same job; no second active run |
| Worker restart | Durable request survives; interrupted attempt handled transparently |
| Two jobs | No workspace/result cross-contamination |
| Malicious input | No command execution, arbitrary tool access, HTML injection, or cross-user access |
| Rate/queue limit | Excess jobs rejected cleanly, without launching extra Codex processes |
| Persistence | Host service restart retains jobs/results and protected authentication as configured |

Use unit tests for meaningful validation/arithmetic/state logic, mocked providers for negative scenarios, and separately identified genuine live integration tests. Mocks never count toward live acceptance. Reuse completed verification; avoid repeated paid/live searches without a reason.

## 14. Repository and delivery requirements

Provide a clean repository with: frontend/API, worker and Codex adapter, shared schemas and price calculator, SQLite migrations, Dockerfiles/Compose, secure reverse-proxy example, secret-free environment template, setup/doctor scripts, plugin capability probe, test suite, and a generated capability report.

Suggested documentation files: README.md, SETUP.md, CAPABILITIES.md, TEST_REPORT.md, FEASIBILITY_REPORT.md, and docs/provider-instructions.md. Provide redacted live evidence under an ignored/private runtime directory and an exportable non-sensitive summary. Commit source and documentation; never commit authentication or live personal data.

Document exact verified commands for installation, supported sign-in, plugin setup, doctor, capability probe, app start, tests, live smoke test, backup, shutdown, restart, and uninstall. Pin versions but do not embed this specification's example commands as if they were already tested.

Configuration must include host/port, database path, job workspace root, runtime adapter, configurable supported model, queue/concurrency/time limits, session secret, retention, and fixture mode (off by default). Codex/plugin credentials must use their supported storage, not an invented travel key requirement.

Deploy only to an available authorized persistent host. If no host/account is provided, finish build/package/local verification and give the exact missing deployment prerequisites. Do not purchase cloud resources or present a fake live URL.

## 15. Final acceptance and honest verdict

Report three independent verdicts:

1. **Infrastructure:** website → durable queue → unattended cloud Codex → stored results → webpage works.
2. **Provider compatibility:** which exact plugins work unattended, with which authentication, constraints, and evidence.
3. **Trip proof:** flight + both hotel stays + XE + accurate breakdown/links was demonstrated, partially demonstrated, or blocked.

Full technical PASS requires a real persistent-cloud run across all required categories, no operational human steps after initial setup, and evidence-backed displayed results. Three cards are required only when returned inventory supports them; otherwise classify the trip demonstration partial while preserving any proven infrastructure/provider success.

Public commercial eligibility is a separate review, not automatically established by technical PASS. A working private proof must not be described as unlimited, free, publicly licensed, or production-ready.

If blocked, state the exact stage, runtime error, affected providers, what was verified independently, and the smallest next action. Keep the implementation usable. Do not rewrite the result as success using a different provider access model.

## 16. Execution order for the implementing Codex

1. Read this document and local repository instructions; inspect prerequisites.
2. Verify current official runtime/plugin documentation; choose and pin the execution surface.
3. Build the doctor/probe and establish the capability gate first.
4. Complete independent API, queue, schemas, worker, and negative-path tests.
5. Integrate genuinely supported plugins and enforce provider rules.
6. Build the minimal one-page form/results UI.
7. Run live browser-to-worker-to-provider proof and retain redacted evidence.
8. Verify failure, restart, isolation, and price cases.
9. Deploy to the authorized persistent host if available.
10. Deliver source, commands, capability matrix, test report, URL if real, and the three verdicts.

Proceed autonomously on reversible implementation choices. Ask only for genuinely missing initial authentication, infrastructure access, or authorization for a new paid resource. Never ask the owner to search travel inventory or manually move results.

## 17. Official reference starting points

Checked during specification preparation on 26 October 2026. Recheck before implementation because surfaces, flags, authentication, and plugin behavior can change.

- Codex non-interactive jobs and structured output: https://learn.chatgpt.com/docs/non-interactive-mode
- Codex App Server: https://learn.chatgpt.com/docs/app-server
- Supported plugin surfaces and CLI plugin browser: https://learn.chatgpt.com/docs/plugins
- Supported authentication/headless sign-in: https://learn.chatgpt.com/docs/auth
- API agent plugin packaging (alternative surface; does not inherit this chat's access): https://developers.openai.com/api/docs/guides/agents-api/tools/plugins
- MCP connections/authentication (alternative surface): https://developers.openai.com/api/docs/guides/agents-api/tools/mcp
- Booking.com official MCP implementation (separate partner-access fallback, not the requested primary route): https://developers.booking.com/mcp-server/docs/implementation-guide

## 18. Copy-and-paste implementation instruction

> Implement the attached Autonomous Umrah Planner cloud Codex technical proof. The primary hypothesis is a private website triggering unattended Codex jobs on a persistent cloud host and reusing supported installed travel plugins without separate provider API onboarding. Establish actual CLI/plugin compatibility before substantial UI work. Build the durable request/worker/result loop, strict schemas, deterministic pricing/date validation, minimal protected webpage, deployment package, and evidence-backed tests. Follow the gates and provider tool instructions. No scraping, browser-session automation, hidden-token extraction, mocked live results, manual search steps, or silent switch to commercial APIs. Initial supported sign-in is allowed; per-search human intervention fails acceptance. If plugin access or deployment is blocked, finish independent work and report precise separate infrastructure/provider/trip verdicts. Do not claim live success without actual tool-call evidence and a verified cloud run.

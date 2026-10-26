# Feasibility — 26 October 2026

**Latest owner direction: plugin-only; hosting/UI work paused.** The approved ORY conversational variant now has a validated quoted subtotal of EUR 1,500.77 (EUR 750.39 average per adult), from ordinary eDreams group fare + both Booking stays + actual XE conversion. Final payable fees/conditions and transfers remain unresolved. See [the current session](docs/CONVERSATIONAL_PLANNER.md) and [documented execution findings](docs/PLUGIN_EXECUTION.md). The CDG investigation and deployment sequence below are historical context, not authorization to change the integration model or resume hosting work.

## Infrastructure: PARTIAL

Authenticated webpage → durable SQLite job → worker capability process → stored blocked diagnostic → webpage is implemented and HTTP-tested, including restart. No full unattended Codex travel job has run. The current cloud execution workspace is temporary; no permanent HTTPS application URL or persistent host has been established. Docker verification is recorded in TEST_REPORT.md separately.

## Provider compatibility: BLOCKED on the worker

All six plugins are discoverable in this conversation. Five returned data in real conversation calls. The **new environment's** CLI plugin catalog returned HTTP 451 / `no_biscuit_no_service`, with no installed/available plugins, despite ChatGPT sign-in. The CLI exits 0 on that failure, now correctly detected. No per-provider unattended call has been established. See CAPABILITIES.md for presentation and price constraints.

The worker now executes bounded discovery rather than returning a static untested diagnosis. It never accepts model-only JSON as evidence and does not bypass missing tool restrictions. Its live inventory path remains disabled. `src/pricing.ts` is deterministic, tested assembly code awaiting a supported trusted provider boundary; it is not connected to live supplier ingestion.

## Trip proof: PARTIAL in chat, BLOCKED end-to-end

Technical inventory test: CDG–JED, 7–15 December 2026, two adults, one room; hotels 7–11 December in Makkah and 11–14 December in Madinah, derived from a Trip.com same-day arrival. Overnight candidates require other stays and were not combined with these hotels. Religious/entry eligibility is **unverified**; these are inventory dates only.

Trip.com returned nine options, Booking.com ten accommodations per city, eDreams ten itineraries, Tripadvisor enrichment, XE a real dated rate. No complete priced itinerary is asserted: price bases, taxes, membership links, airport mismatches and transfer feasibility must pass validation. The checkout on 14 December before return on 15 December leaves a gap; it is disclosed, not silently presented as a covered hotel night. Chat data was not injected into website jobs.

## Concrete continuation

1. Provide an authorized persistent Linux host with local durable volume, HTTPS hostname and secure owner setup channel. The existing Compose package is suitable for app/queue diagnostics on such a host. No paid resource was provisioned.
2. Restore supported catalog access there; run the safe probe. Re-authentication is only relevant if official diagnostics require it; current CLI already reports ChatGPT login. The unexplained 451 is not proven to be a missing-password problem.
3. Discover exact canonical plugins and search/conversion actions via supported mechanisms. Prove unattended calls for flights, both hotel stays, XE. Resolve provider display rules and price semantics. Installation alone does not open the gate.
4. Add the verified execution adapter with search-only enforced tools, isolated job workspaces, structured input/output, trusted tool events, cancellation/deadline. No current API/CLI/chat access bridge is assumed.
5. Feed normalized evidence into the deterministic calculator, add shared end-to-end result validation and result cards, run browser-to-provider proof, then deploy on the authorized host.

Vercel/Supabase connectors were read-only checked. Vercel returned no project matching “umrah” in the default accessible scope. Supabase returned two existing healthy projects; neither has been designated for UmrahPOC, so neither was modified. Connected tools are available now, unlike the historical session. A Vercel frontend / Supabase auth-and-queue migration remains a separate unimplemented architecture; neither supplies a persistent Codex worker. No SQLite-on-Vercel deployment was attempted.

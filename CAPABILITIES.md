# Capability gate — 26 October 2026

Latest conversational session and same-plugin execution investigation: [CONVERSATIONAL_PLANNER.md](docs/CONVERSATIONAL_PLANNER.md) and [PLUGIN_EXECUTION.md](docs/PLUGIN_EXECUTION.md). The owner accepted ORY as a distinct alternative; its public flight total and whole-stay hotel prices produce a validated quoted subtotal, not a final payable price.

Remote main inspected through GitHub and fetched through Git: `a799972545e41563a964338f21b280c42375aa85`.

## Separate surfaces

1. Conversation plugin discovery: all six requested providers expose tools.
2. Conversation invocations: Booking.com (both cities), Trip.com flights, eDreams, Tripadvisor and XE returned real data. These are interactive/chat invocations, **not worker evidence**.
3. Managed-cloud CLI: Node 24.19.0, Codex CLI 0.163.0, `codex login status` reports ChatGPT. `codex plugin list --available --json` exits **0** but stderr reports **HTTP 451, no_biscuit_no_service**; JSON has `installed: []`, `available: []`. `codex mcp list` reports no configured servers. This is a fresh observation on this environment, not a copied historical error.
4. Unattended provider use: **not established for any provider**. Catalog discovery failed before supplier invocation. No installed identifier, endpoint, authorization or tool allowlist is inferred from the chat.

| Provider | Conversation status | Necessary parameters / constraints | Worker status |
| --- | --- | --- | --- |
| Booking.com | callable_interactively, two successful searches | Exact stays, 2 adults, 1 room, EUR; country must be lowercase `fr` (uppercase failed validation). `price.book` includes legally required displayed charges, but other charges may apply. The parent price schema explicitly describes the total cost for the query, so the latest session treats it as the displayed whole-stay total; other charges/eligibility remain unresolved. Earlier interpretation was overly restrictive. Preserve URLs/attribution. | not_discovered; catalog tested_failed |
| Trip.com flights | callable_interactively, 9 options | Exact round trip, CDG/JED, two adults, checked-baggage filter. Response USD despite French locale; preserved as returned. `perTraveler` label conflicts with generic schema “total price”; no assumed group multiplier. Some outbound flights arrive next day; hotels must follow the actual flight. | not_discovered; catalog tested_failed |
| eDreams | callable_interactively, 10 itineraries | Explicit ordinary per-person and booking totals; Prime is membership-only. Returned sample flights depart ORY despite CDG query: reject mismatches. Baggage not verified. Returned clickout has Prime-related parameters; never rewrite it to pretend it is an ordinary-fare link. | not_discovered; catalog tested_failed |
| Skyscanner | discovered; output_incompatible for proposed aggregation | Live search must be final assistant action; widget only; at most one per prompt. Not invoked: continuing implementation after the call would break that requirement. | not_discovered; catalog tested_failed |
| Tripadvisor | callable_interactively, enrichment probe | Interactive map display; bubble ratings, not hotel stars. Full-stay base/taxes semantics returned. Localized query resolved to Makkah Province: verify location before selecting. No export/display permission beyond documented widget inferred. | not_discovered; catalog tested_failed |
| XE Currency Converter | callable_interactively | 1 SAR → EUR; mid-market rate `0.2384830521`, timestamp `2026-10-26T19:55:00Z`. Not an executable exchange quote. | not_discovered; catalog tested_failed |

The Trip.com **hotel** tool is restricted_for_use_case: it forbids guest/room constraints and other non-location filters. It was not called; the requested occupancy was not discarded to force a search.

## Gate implementation

`npm run probe` (also `npm run doctor`) invokes the installed CLI with fixed arrays, bounded time/output and no shell. It recognizes an exit-zero discovery warning as failure. Reports contain safe categories and exact known failure codes rather than arbitrary CLI bodies, catalog contents or authentication files. `runtime/capabilities.json` is private and ignored. Exit 2 means blocked, not a successful travel search.

Every claimed worker request performs this gate. Cancellation stops the probe process group. The gate intentionally cannot become PASS just because a catalog contains a plugin. Exact action allowlisting, independent invocation evidence, supported authentication and presentation compatibility must be implemented and tested first. No unrestricted Codex executor is enabled. A prompt is not an enforceable search-only tool policy or hard call limit.

The default container contains the app and probe, **not Codex or owner authentication**; it reports spawn_failed. The host CLI probe above is separate. Do not mount the conversation's auth into a container to change this result.

## Official references rechecked

HTTP 200 from the following official pages on 26 October 2026:
- https://learn.chatgpt.com/docs/plugins
- https://learn.chatgpt.com/docs/non-interactive-mode
- https://learn.chatgpt.com/docs/auth

Installed `codex plugin --help`, `codex plugin list --help`, and `codex exec --help` were inspected. CLI help supports JSON events, stdin, ephemeral sessions and output schemas; none proves travel tool access. Auth documentation describes `codex login --device-auth` for headless owner login. It has not been invoked on a deployment host. No alternate commercial travel API onboarding was attempted.

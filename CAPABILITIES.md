# Capability gate — 2026-10-26

Surface: managed cloud development sandbox, Linux, codex-cli 0.163.0. Authentication status: ChatGPT login reported; no credentials copied. This is not proof of persistent-host authentication or service eligibility.

| Provider | Status | Evidence / next requirement |
|---|---|---|
| Booking.com | not_discovered | CLI remote catalog failed HTTP 451 |
| Trip.com | not_discovered | Same discovery failure |
| eDreams | not_discovered | Same discovery failure |
| Skyscanner | not_discovered | Same discovery failure |
| Tripadvisor | not_discovered | Same discovery failure |
| XE Currency Converter | not_discovered | Same discovery failure |

`codex plugin list` and `codex plugin list --json --available` reported remote installed-catalog failure: HTTP 451, message `no_biscuit_no_service`. `codex mcp list` reported no configured MCP servers. This does not prove the providers are globally unavailable. No tool descriptions, canonical IDs, installability, unattended access, supplier terms, price semantics or display compatibility have been established. No live search was attempted; no rate or inventory is fabricated.

Official documentation retrieved successfully on this date:
- https://learn.chatgpt.com/docs/plugins — CLI plugin browser and ChatGPT authentication support; individual availability remains unproven.
- https://learn.chatgpt.com/docs/non-interactive-mode — supported `codex exec` surface; not proof of provider access.

Private fresh probe output: ignored `runtime/doctor.json`. No raw reasoning traces are collected. Inspect diagnostic output before sharing; it is not an export certified free of all sensitive content.

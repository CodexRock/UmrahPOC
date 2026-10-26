# UmrahPOC — current project boundary

The owner requires a **plugin-only** planner. Use the travel plugins available in the conversation or those exact plugins through a documented, supported execution surface. Do not introduce direct supplier APIs, independently configured supplier MCP integrations, scraping, browser automation of ChatGPT, hidden-token extraction, or another provider access model.

Demonstrate the conversational flight + both hotel stays + XE flow first, with deterministic quoted totals, genuine unmodified supplier links, original currencies and clearly stated missing data. Chat tool calls are not worker calls. A JSON file or model assertion is not independent evidence of a provider invocation.

Investigate only supported routes for the same plugins from the existing worker. Do not spend effort on hosting or UI polish until that route is demonstrated. If it remains unavailable, deliver the conversational planner and state the exact worker limitation. Do not disguise a subtotal with unresolved charges/conditions as a final payable or all-inclusive price.

No bookings, purchases, paid-resource provisioning or external messages. Keep raw supplier clickouts, private snapshots and authentication out of Git. Initial official sign-in is permitted; never transfer this conversation's internal identifiers or credentials to a server.

See docs/CONVERSATIONAL_PLANNER.md and docs/PLUGIN_EXECUTION.md for the latest evidence and scope. Historical deployment plans and the original specification do not override this boundary.

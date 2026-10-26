# CLI investigation — 26 October 2026

The owner asked to try repairing the CLI while updating the cloud environment. These are fresh tests, not a claim that CLI plugins cannot work elsewhere.

## Actions and observations

| Check | Managed CLI 0.163.0 | Official npm CLI 0.164.0 |
| --- | --- | --- |
| Version command | succeeds | succeeds |
| `login status` | Logged in using ChatGPT | Logged in using ChatGPT |
| Remote plugin discovery | HTTP 451, `no_biscuit_no_service`; empty installed/available arrays | Same HTTP 451 and error, empty arrays |
| Minimal `codex exec` (no tools, fixed `CLI_OK` response requested) | exits 1 before model response | exits 1 before model response |
| Execution startup error | `failed to initialize in-process app-server client: Read-only file system (os error 30)` | same |

Stable `0.164.0` was confirmed using the npm registry and [official release](https://github.com/openai/codex/releases/tag/rust-v0.164.0), and installed separately under a scratch directory. The managed executable was not replaced. Existing managed authentication, proxy, CA and guard variables were preserved. No auth file was read, copied, modified or exported. No new supplier API/MCP integration was configured.

Network policy is currently enforced/unrestricted; npm install and official documentation/release reads work. The selected Codex plugin features are enabled. `plugin marketplace list` reports no marketplace in scope; the cloud system config has one bundled marketplace declaration. This difference is recorded, not treated as proof of a missing travel marketplace or repaired by adding an arbitrary repository.

The official [configuration reference](https://learn.chatgpt.com/codex/config-reference) describes `sqlite_home` and `log_dir`. Supplying writable scratch directories for those settings did **not** fix the startup failure on either tested version. Filesystem-metadata tracing did not identify the precise failing operation; the exact path/root cause remains unestablished. No permissions, endpoint or authentication checks were bypassed.

The catalog returned 451 with the **same** server message on both versions. The HTTP status label alone is not evidence of a geographic/legal restriction. `login status` does not prove that a remote catalog request is authorized. No assumption is made about what credential or entitlement is missing, and no private endpoint was called manually.

## Concrete next checks after the environment update

1. Verify that the updated runtime, rather than only a saved draft, is active.
2. Run `npm run doctor:cli`: this bounds a minimal non-interactive invocation to 40 seconds and 200 KB, requests no tools, reports only safe fixed diagnostics and writes ignored `runtime/cli-smoke.json`. It may consume ordinary existing model allowance if it reaches the model. Exit 2 means blocked; do not make this a mandatory successful setup/install command while the runtime is being repaired.
3. The operator can choose an installed executable using `UMRAH_CODEX_BINARY`; it is never website request input. The latest stable CLI was tested using this selector.
4. Once execution returns `CLI_OK`, run the existing plugin capability probe in the **same intended worker context**. Initialization and remote catalog are separate gates: repairing one does not establish the other.
5. Once the catalog is accessible, resolve the exact travel plugins through official discovery/installation and test a real search. Do not infer installable identifiers from conversation tool names.

The environment needs a supported CLI runtime that can initialize its required writable state while keeping owner authentication protected, plus supported authorization for remote plugins. No new login was initiated merely because the protected mounted credentials were not readable. If a supported one-time login is needed after runtime recovery, it must use the official flow on the cloud host, without asking the owner to paste tokens or run commands on their own computer.

Current result: **not repaired**. A stable-version upgrade alone was insufficient. These observations provide concrete acceptance checks for the environment update; they do not rule out making the CLI work on a supported runtime.

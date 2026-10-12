# Current state

Verified here: contract logic via 43 offline tests against a stand-in for the SDK (scoring, parsing, strict types, injection attempt, fees, withdrawals, owner functions, paging, failure paths).

Not verified here (no network access in the build environment):
- Deployment and live behaviour on Studio Next, including how `gl.nondet.web.render` returns the GitHub API page and whether `gl.message_raw["datetime"]` is available. If the clock is unavailable the contract falls back to a neutral, deterministic "recency_unknown" signal instead of failing.
- Whether raw.githubusercontent.com and the GitHub advisories and users endpoints render cleanly through `gl.nondet.web.render`, and whether `prompt_comparative` behaves like the offline stand-in. Unreadable pieces degrade to neutral signals, never to Safe.
- `npm install`, type-check and build of `web/`, and the genlayer-js write/read calls on the rc.1 SDK.
- Studio Next fee handling for writes.

# RepoTrust

A dependency risk judge on GenLayer. Validators fetch a GitHub repository's public record (metadata, owner profile, published security advisories, package.json and setup.py, README), each one computes the same bucketed risk score, an AI scan adds one bounded flag, and the contract stores a verdict (SAFE, CAUTION, AVOID, or INSUFFICIENT_DATA) with the signals behind it. The web app lets anyone connect a wallet, request a review, manage credit, and browse a dashboard of verdicts.

## Layout
- `contracts/repo_trust.py`: the Intelligent Contract
- `tests/`: 43 offline tests (`python3 -m unittest discover -s tests`)
- `demo_cases/` and `scripts/simulate.py`: sample GitHub payloads and a runner
- `deploy/`: step-by-step deployment guides
- `deployments/`: deployed address record
- `web/`: React + TypeScript dashboard

## What it checks
Repo health (archived, license, activity, adoption, issues), owner trust (account age, followers, repos), published security advisories, install scripts that download or run code, risky or unpinned dependencies, risky setup.py calls, and an AI scan of the README and install scripts for malicious intent.

It does not audit every line of code. A Safe verdict lowers risk, it is not a guarantee.

## How the judgment stays trustworthy
- The stored verdict and score come from typed fields only, never from model text. A string like "false" is not accepted as a boolean.
- Fetched text is never placed in a prompt, so there is nothing to inject into.
- Every validator recomputes the whole result and must match exactly (strict equality), so the leader cannot store a number the validators did not derive.
- Missing, malformed or rate-limited data gives INSUFFICIENT_DATA. It never produces SAFE, and it never overwrites an earlier verdict.

## Contract behaviour
User mistakes never revert. The call returns `ERR:<CODE>` and `get_last_result` shows it. Money sent with any call is credited to the sender and can always be taken back with `withdraw`.

See `CURRENT_STATE.md` for what has and hasn't been verified.

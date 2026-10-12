# Deploy the contract on Studio Next (no coding needed)

1. Open GenLayer Studio and switch the network to **Studio Next** (RPC https://studio-next.genlayer.com/api, chain ID 61997).
2. Create a new contract file named `repo_trust.py` and paste the full contents of `contracts/repo_trust.py`. Keep the first two comment lines exactly as they are.
3. In the deploy panel, set the constructor value `review_fee` to `100000000000000000` (that is 0.1 GEN, written in the smallest unit, wei). Count the zeros carefully: 1 followed by 17 zeros.
4. Click **Deploy** and wait until the transaction shows as accepted.
5. Copy the contract address (it starts with `0x`). Also confirm it on https://explorer-studio-dev.genlayer.com/.
6. Run `get_config` in Studio. It should show `version` 2.0.0 and `review_fee` 100000000000000000.
7. Test in Studio: run `review` with `vercel/next.js` and attach a value of `100000000000000000` (0.1 GEN), then `get_review` with the same text. Try `review` with `not a repo`; it should succeed and `get_last_result` should say `ERR:INVALID_REPO`.
8. After deploying, update `VITE_CONTRACT_ADDRESS` in Vercel to the NEW address and redeploy the site.
9. Paste the address into `deployments/studio-next.json`.

# Put the website on Vercel

You need: a free GitHub account, a free Vercel account (sign in with GitHub), and your deployed contract address.

1. **Create a GitHub repository.** On github.com click **New repository**, name it `repotrust`, keep it Public, click **Create repository**.
2. **Upload the project.** On the empty repo page click **uploading an existing file**. Unzip `repotrust.zip` on your computer, drag everything inside the unzipped `repotrust` folder into the page (keep the `web`, `contracts`, `tests` folders), then click **Commit changes**.
3. **Import into Vercel.** Go to vercel.com/new, pick your `repotrust` repository, click **Import**.
4. **Set the root folder.** Next to **Root Directory** click **Edit**, choose `web`, click **Continue**. Vercel detects Vite by itself.
5. **Add settings.** Open **Environment Variables** and add two:
   - `VITE_CONTRACT_ADDRESS` = your contract address (starts with 0x)
   - `VITE_RPC_URL` = `https://studio-next.genlayer.com/api`
6. Click **Deploy** and wait about a minute. Click the preview image to open your live site.
7. **Test it:** click **Connect wallet**, approve the network switch to GenLayer Studio Next, paste `vercel/next.js` and click **Review repository**.

## If something goes wrong
- Site shows "Demo data": the contract address variable is missing or has a typo. Fix it under Project > Settings > Environment Variables, then **Deployments > Redeploy**.
- Build fails: open the failed deployment, copy the red error text and send it to me.
- Wallet transaction fails with a fee error: copy the exact message and send it to me.

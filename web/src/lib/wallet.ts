import { CHAIN_ID, RPC, EXPLORER } from "./chain";

const eth = () => (window as any).ethereum;
export const hasWallet = () => !!eth();

export async function connectWallet(): Promise<string> {
  if (!eth()) throw new Error("No wallet found. Install MetaMask, then reload this page.");
  const accounts: string[] = await eth().request({ method: "eth_requestAccounts" });
  const chainId = "0x" + CHAIN_ID.toString(16);
  try {
    await eth().request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
  } catch {
    await eth().request({
      method: "wallet_addEthereumChain",
      params: [{ chainId, chainName: "GenLayer Studio Next",
        nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
        rpcUrls: [RPC], blockExplorerUrls: [EXPLORER] }],
    });
  }
  return accounts[0];
}
export function onAccountChange(cb: (a: string | null) => void) {
  eth()?.on?.("accountsChanged", (a: string[]) => cb(a[0] ?? null));
}

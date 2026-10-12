import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT = (import.meta.env.VITE_CONTRACT_ADDRESS || "") as string;
export const RPC = (import.meta.env.VITE_RPC_URL || "https://studio-next.genlayer.com/api") as string;
export const CHAIN_ID = 61997;
export const EXPLORER = "https://explorer-studio-dev.genlayer.com/";
export const LIVE = CONTRACT.startsWith("0x");

const chain: any = {
  ...studionet, id: CHAIN_ID, name: "GenLayer Studio Next",
  rpcUrls: { default: { http: [RPC] } },
};

export function toObj(v: any): any {
  if (v instanceof Map) return Object.fromEntries([...v.entries()].map(([k, x]) => [k, toObj(x)]));
  if (Array.isArray(v)) return v.map(toObj);
  if (typeof v === "bigint") return v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v;
  return v;
}

const reader = () => createClient({ chain, endpoint: RPC } as any);
export async function read(fn: string, args: any[] = []) {
  const r = await reader().readContract({ address: CONTRACT as any, functionName: fn, args } as any);
  return toObj(r);
}

const NO_MESSAGES = ["withdraw", "withdraw_fees"];

// Studio Next charges fees: every write must carry a fee preset (FeeValueMustBeNonZero otherwise).
export async function write(account: string, fn: string, args: any[] = [], value = 0n) {
  const client: any = createClient({
    chain, endpoint: RPC, account: account as any, provider: (window as any).ethereum,
  } as any);
  const base: any = { address: CONTRACT as any, functionName: fn, args, value };
  let fees: any;
  try {
    const est = await client.estimateTransactionFeesForWrite({ account, ...base });
    fees = { distribution: est.distribution, feeValue: est.feeValue };
    // Withdrawals send funds out through an emitted message; keep their fee preset free of message allocations.
    if (!NO_MESSAGES.includes(fn) && est.messageAllocations) fees.messageAllocations = est.messageAllocations;
  } catch {
    const est = await client.estimateTransactionFees({
      leaderTimeunitsAllocation: 100n, validatorTimeunitsAllocation: 200n, rotations: [0n],
    });
    fees = { distribution: est.distribution, feeValue: est.feeValue };
  }
  const hash = await client.writeContract({ ...base, fees });
  await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED, retries: 80, interval: 4000 });
  return hash as string;
}

export const toWei = (s: string): bigint => {
  const [w, f = ""] = s.trim().split(".");
  if (!/^\d*$/.test(w) || !/^\d*$/.test(f)) throw new Error("Enter a number like 0.5");
  return BigInt((w || "0") + (f + "0".repeat(18)).slice(0, 18));
};
export const fromWei = (n: number | bigint): string => {
  const s = BigInt(n).toString().padStart(19, "0");
  return (s.slice(0, -18) + "." + s.slice(-18)).replace(/0+$/, "").replace(/\.$/, "") || "0";
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { LIVE, CONTRACT, EXPLORER, read, write, toWei, fromWei } from "./lib/chain";
import { connectWallet, hasWallet, onAccountChange } from "./lib/wallet";
import { DEMO, Review, SIGNAL_TEXT, RESULT_TEXT } from "./lib/demo";

const short = (a: string) => a.slice(0, 6) + "…" + a.slice(-4);
const VERDICTS = ["SAFE", "CAUTION", "AVOID", "INSUFFICIENT_DATA"] as const;
const LABEL: Record<string, string> = { SAFE: "Safe", CAUTION: "Caution", AVOID: "Avoid", INSUFFICIENT_DATA: "Needs refresh" };

export default function App() {
  const [repos, setRepos] = useState<Review[]>(LIVE ? [] : DEMO);
  const [account, setAccount] = useState<string | null>(null);
  const [credit, setCredit] = useState(0n);
  const [fee, setFee] = useState(0n);
  const [owner, setOwner] = useState("");
  const [fees, setFees] = useState(0n);
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const refresh = useCallback(async () => {
    if (!LIVE) return;
    try {
      setRepos(await read("get_repos", [0, 50]));
      const cfg = await read("get_config");
      setFee(BigInt(cfg.review_fee)); setOwner((cfg.owner || "").toLowerCase()); setFees(BigInt(cfg.fees_collected));
      if (account) setCredit(BigInt(await read("get_balance_of", [account])));
    } catch (e: any) { setNote({ ok: false, text: "Could not read the contract: " + (e?.message || e) }); }
  }, [account]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { onAccountChange(setAccount); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { SAFE: 0, CAUTION: 0, AVOID: 0, INSUFFICIENT_DATA: 0 };
    repos.forEach((r) => (c[r.verdict] += 1));
    return c;
  }, [repos]);
  const safePct = repos.length ? Math.round((counts.SAFE / repos.length) * 1000) / 10 : 0;
  const shown = filter === "ALL" ? repos : repos.filter((r) => r.verdict === filter);

  async function run(label: string, fn: string, args: any[], value = 0n) {
    if (!account) return setNote({ ok: false, text: "Connect your wallet first." });
    if (!LIVE) return setNote({ ok: false, text: "Demo mode: set VITE_CONTRACT_ADDRESS to send real transactions." });
    setBusy(label); setNote(null);
    try {
      const hash = await write(account, fn, args, value);
      const res: string = await read("get_last_result", [account]);
      setNote({ ok: res.startsWith("OK"), text: RESULT_TEXT[res] || (res.startsWith("OK") ? "Done." : res) + " " + hash.slice(0, 10) });
      await refresh();
    } catch (e: any) { setNote({ ok: false, text: e?.shortMessage || e?.message || "Transaction failed." }); }
    setBusy("");
  }

  async function connect() {
    try { setAccount(await connectWallet()); } catch (e: any) { setNote({ ok: false, text: e.message }); }
  }
  const money = (fn: () => bigint) => { try { return fn(); } catch (e: any) { setNote({ ok: false, text: e.message }); return null; } };

  const floaters = repos.slice(0, 4);
  return (
    <>
      <header className="nav">
        <span className="logo" aria-label="RepoTrust">◇</span>
        <nav className="pill">
          <a href="#top" className="on">Start</a><a href="#console">Review</a><a href="#dashboard">Dashboard</a>
          {LIVE && <a href={EXPLORER} target="_blank" rel="noreferrer">Explorer</a>}
        </nav>
        {account ? <span className="btn ghost">{short(account)}</span>
          : <button className="btn ghost" onClick={connect}>{hasWallet() ? "Connect wallet" : "Install wallet"}</button>}
      </header>

      <main id="top">
        <section className="hero">
          <div className="planet" /><div className="beam" /><div className="grain" />
          {floaters.map((r, i) => (
            <button key={r.repo} className={"floater f" + i} onClick={() => { setInput(r.repo); location.hash = "console"; }}>
              <span className={"dot " + r.verdict} /><b>{r.repo.split("/")[1]}</b><small>{r.score}</small>
            </button>
          ))}
          <div className="heroText">
            <span className="badge">{LIVE ? "Live on Studio Next" : "Demo data · connect a contract to go live"}</span>
            <h1>Know what you depend on<br />before it ships</h1>
            <p>Validators on GenLayer check a repository's health, install scripts, dependencies, security advisories and owner history, plus an AI scan for malicious intent. They agree on one verdict that anyone can read.</p>
            <a className="btn light" href="#console">Review a repository</a>
          </div>
          <div className="panels">
            <div className="glass side"><h4>Score bands</h4>
              <p><i className="dot SAFE" /> 70–100 Safe</p><p><i className="dot CAUTION" /> 40–60 Caution</p>
              <p><i className="dot AVOID" /> 0–30 Avoid, or archived</p><p><i className="dot INSUFFICIENT_DATA" /> No data, retry</p></div>
            <div className="glass mid">
              <div><div className="big">{safePct}<span>%</span></div>
                <div className="cap">of {repos.length} reviewed repositories are <em>safe</em></div>
                <p className="small">Every number is recomputed by each validator and must match exactly before it is stored.</p></div>
              <svg viewBox="0 0 200 160" className="globe" aria-hidden>
                <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0" stopColor="#3a4258" /><stop offset="1" stopColor="#0b0d14" /></radialGradient></defs>
                <circle cx="100" cy="80" r="62" fill="url(#g)" />
                {Array.from({ length: 90 }).map((_, i) => { const a = i * 2.4, rr = 8 + ((i * 37) % 52);
                  return <circle key={i} cx={100 + rr * Math.cos(a)} cy={80 + rr * 0.9 * Math.sin(a)} r="1.1" fill="#9aa7c7" opacity=".7" />; })}
                <ellipse cx="100" cy="86" rx="92" ry="30" fill="none" stroke="#c9d6ff" strokeOpacity=".5" transform="rotate(-18 100 80)" />
              </svg>
            </div>
            <div className="glass side chips">{VERDICTS.map((v) => <div key={v} className="chip"><i className={"dot " + v} /><b>{counts[v]}</b><small>{LABEL[v]}</small></div>)}</div>
          </div>
        </section>

        <section id="console" className="block">
          <h2>Review a repository</h2>
          <p className="lead">Paste a GitHub link. Your wallet signs one transaction, validators fetch the data, and the verdict is saved on-chain.</p>
          <div className="grid2">
            <div className="glass pad">
              <label htmlFor="repo">Repository</label>
              <input id="repo" value={input} onChange={(e) => setInput(e.target.value)} placeholder="vercel/next.js or https://github.com/vercel/next.js" />
              <div className="row">
                <button className="btn light" disabled={!!busy || !input.trim()} onClick={() => run("review", "review", [input], fee > credit ? fee - credit : 0n)}>
                  {busy === "review" ? "Validators are reviewing…" : "Review repository"}</button>
                <span className="muted">{fee > 0n ? `Fee: ${fromWei(fee)} GEN per review. Your wallet pays any amount not covered by credit.` : "No review fee"}</span>
              </div>
            </div>
            <div className="glass pad">
              <label>Your wallet</label>
              {!account ? <button className="btn light" onClick={connect}>{hasWallet() ? "Connect wallet" : "Install a wallet"}</button> : <>
                <p className="mono">{account}</p>
                <p className="muted">Credit balance: <b>{fromWei(credit)} GEN</b></p>
                <div className="row">
                  <input className="sm" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in GEN" />
                  <button className="btn ghost" disabled={!!busy} onClick={() => { const v = money(() => toWei(amount)); if (v) run("deposit", "deposit", [], v); }}>Add credit</button>
                  <button className="btn ghost" disabled={!!busy} onClick={() => { const v = amount.trim() ? money(() => toWei(amount)) : 0n; if (v !== null) run("withdraw", "withdraw", [v]); }}>
                    {amount.trim() ? "Withdraw amount" : "Withdraw all"}</button>
                </div>
                {owner && account.toLowerCase() === owner && <div className="row">
                  <span className="muted">Collected fees: {fromWei(fees)} GEN</span>
                  <button className="btn ghost" disabled={!!busy} onClick={() => run("fees", "withdraw_fees", [])}>Withdraw fees</button></div>}
              </>}
            </div>
          </div>
          {note && <div role="status" className={"note " + (note.ok ? "ok" : "bad")}>{note.text}</div>}
        </section>

        <section id="dashboard" className="block">
          <h2>Dashboard</h2>
          <div className="stats">
            <div className="glass pad"><small>Repositories</small><div className="num">{repos.length}</div></div>
            <div className="glass pad"><small>Safe</small><div className="num">{counts.SAFE}</div></div>
            <div className="glass pad"><small>Caution</small><div className="num">{counts.CAUTION}</div></div>
            <div className="glass pad"><small>Avoid</small><div className="num">{counts.AVOID}</div></div>
          </div>
          <div className="glass pad">
            <div className="bars" aria-label="Verdict split">
              {VERDICTS.map((v) => <div key={v} className={"bar " + v} style={{ flex: Math.max(counts[v], 0.001) }} title={LABEL[v]} />)}
            </div>
            <div className="filters">{["ALL", ...VERDICTS].map((v) =>
              <button key={v} className={"tab" + (filter === v ? " on" : "")} onClick={() => setFilter(v)}>{v === "ALL" ? "All" : LABEL[v]}</button>)}</div>
            {shown.length === 0 ? <p className="muted empty">No repositories here yet. Review one above to fill this board.</p> :
              <table><thead><tr><th>Repository</th><th>Verdict</th><th>Score</th><th>Revision</th><th /></tr></thead><tbody>
                {shown.map((r) => <>
                  <tr key={r.repo}><td>{r.repo}</td><td><span className={"tag " + r.verdict}>{LABEL[r.verdict]}</span></td>
                    <td>{r.verdict === "INSUFFICIENT_DATA" ? "–" : r.score}</td><td>{r.revision}</td>
                    <td><button className="link" onClick={() => setOpen(open === r.repo ? null : r.repo)}>{open === r.repo ? "Hide" : "Why"}</button></td></tr>
                  {open === r.repo && <tr key={r.repo + "x"}><td colSpan={5} className="why">
                    {r.signals.length ? r.signals.map((s) => <span key={s} className="sig">{SIGNAL_TEXT[s] || s}</span>) : <span className="sig">No risk signals found</span>}
                    <small>Checked {r.as_of || "n/a"} by {short(r.reviewer)}</small></td></tr>}
                </>)}
              </tbody></table>}
          </div>
          <p className="muted foot">A Safe verdict lowers risk, it is not a guarantee. It does not audit every line of code. {LIVE ? <>Contract <a href={EXPLORER} target="_blank" rel="noreferrer">{short(CONTRACT)}</a> on Studio Next</> : "Showing sample data."}</p>
        </section>
      </main>
    </>
  );
}

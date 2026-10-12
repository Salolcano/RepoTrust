export type Review = {
  repo: string; revision: number; verdict: "SAFE" | "CAUTION" | "AVOID" | "INSUFFICIENT_DATA";
  score: number; signals: string[]; status: string; reviewer: string; as_of: string; llm?: string;
};
const r = (repo: string, verdict: Review["verdict"], score: number, signals: string[]): Review =>
  ({ repo, revision: 1, verdict, score, signals, status: verdict === "INSUFFICIENT_DATA" ? signals[0] : "OK", reviewer: "0xdemo", as_of: "2026-10-12" });
export const DEMO: Review[] = [
  r("vercel/next.js", "SAFE", 100, []),
  r("facebook/react", "SAFE", 100, []),
  r("acme/left-pad-ng", "CAUTION", 60, ["quiet_6m", "no_license", "modest_adoption"]),
  r("old-labs/crypto-utils", "AVOID", 30, ["abandoned_2y", "no_license", "issue_backlog_high"]),
  r("someone/archived-sdk", "AVOID", 40, ["archived", "stale_1y"]),
  r("ghost/missing-repo", "INSUFFICIENT_DATA", 0, ["not_found"]),
];
export const SIGNAL_TEXT: Record<string, string> = {
  archived: "Archived by its owner", disabled: "Disabled on GitHub", fork: "Is a fork",
  no_license: "No license", recency_unknown: "Activity date unknown",
  abandoned_2y: "No pushes for 2+ years", stale_1y: "No pushes for 1+ year",
  quiet_6m: "No pushes for 6+ months", quiet_3m: "No pushes for 3+ months",
  brand_new: "Created under 30 days ago", young: "Created under 90 days ago",
  low_adoption: "Under 10 stars", modest_adoption: "Under 100 stars",
  issue_backlog_high: "500+ open issues", issue_backlog: "100+ open issues",
  new_owner: "Owner account is under 30 days old", young_owner: "Owner account is under 6 months old",
  thin_profile: "Owner has no followers and almost no repos", owner_unknown: "Owner details unavailable",
  critical_advisory: "Published critical security advisory", high_advisory: "Published high-severity advisory",
  install_script: "Runs a script when installed", risky_install_script: "Install script downloads or runs code",
  huge_dependency_tree: "200+ dependencies", large_dependency_tree: "50+ dependencies",
  unpinned_or_remote_deps: "Dependencies from unpinned or remote sources", manifest_unreadable: "package.json could not be read",
  risky_setup_py: "setup.py runs commands or network calls", ai_flagged_suspicious: "AI scan found suspicious text or scripts",
  not_found: "Repository not found", rate_limited: "GitHub rate limit hit, try again",
  malformed: "GitHub returned unexpected data", fetch_failed: "Could not reach GitHub",
};
export const RESULT_TEXT: Record<string, string> = {
  "ERR:INVALID_REPO": "That doesn't look like a GitHub repository. Use owner/name or a github.com link.",
  "ERR:INSUFFICIENT_CREDIT": "Not enough credit for the review fee. Add credit below.",
  "ERR:NOTHING_TO_WITHDRAW": "Your credit balance is empty.",
  "ERR:AMOUNT_EXCEEDS_BALANCE": "That is more than your credit balance.",
  "ERR:ZERO_DEPOSIT": "Enter an amount above zero.",
  "ERR:NOT_OWNER": "Only the contract owner can do that.",
  "ERR:NO_FEES": "No fees to withdraw yet.",
  "OK:EVIDENCE_UNAVAILABLE_KEPT_PREVIOUS": "GitHub data was unavailable, so the previous verdict was kept and you were not charged.",
};

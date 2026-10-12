"""Run every file in demo_cases/ through the contract's scoring logic offline.
Usage:  python3 scripts/simulate.py"""
import importlib.util, json, os, sys
root = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, os.path.join(root, "tests"))
import genlayer_stub as stub
stub.install()
spec = importlib.util.spec_from_file_location("repo_trust", os.path.join(root, "contracts", "repo_trust.py"))
rt = importlib.util.module_from_spec(spec); spec.loader.exec_module(rt)
for name in sorted(os.listdir(os.path.join(root, "demo_cases"))):
    data = json.load(open(os.path.join(root, "demo_cases", name)))
    r = rt.score_repo(data, "2026-10-12")
    print(f"{name[:-5]:28} {r['verdict']:18} score={r['score']:<4} {', '.join(r['signals'])}")

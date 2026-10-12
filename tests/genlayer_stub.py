"""Tiny local stand-in for the genlayer SDK so contract logic can be unit-tested
with plain Python (no Studio needed). It is NOT the real SDK."""
import sys, types


class Address:
    def __init__(self, v):
        if isinstance(v, Address):
            v = v.as_hex
        if not isinstance(v, str) or not v.startswith("0x") or len(v) != 42:
            raise ValueError("bad address")
        self.as_hex = v.lower()
    def __eq__(self, o): return isinstance(o, Address) and o.as_hex == self.as_hex
    def __hash__(self): return hash(self.as_hex)


class TreeMap(dict):
    def __class_getitem__(cls, item): return cls


class Contract:
    pass


def _deco(fn): return fn
class _Pub:
    view = staticmethod(_deco)
    write = staticmethod(_deco)
_Pub.write.payable = staticmethod(_deco)

TRANSFERS = []
STATE = {}


def install():
    gl = types.ModuleType("genlayer")
    gl.contract = types.SimpleNamespace(Contract=Contract)
    gl.public = _Pub
    gl.storage = types.SimpleNamespace(TreeMap=TreeMap)
    gl.message = types.SimpleNamespace(sender_address=None, value=0)
    gl.message_raw = {"datetime": "2026-10-12T08:00:00Z"}

    def render(url, mode="text"):
        if url.endswith("/security-advisories"): key = "advisories"
        elif "/users/" in url: key = "owner"
        elif url.endswith("package.json"): key = "package"
        elif url.endswith("setup.py"): key = "setup"
        elif url.endswith("README.md"): key = "readme"
        else: key = "web"
        r = STATE.get(key)
        if r is None:
            return "404: Not Found"
        if isinstance(r, Exception):
            raise r
        return r
    gl.nondet = types.SimpleNamespace(web=types.SimpleNamespace(render=render))
    def exec_prompt(prompt):
        STATE["last_prompt"] = prompt
        r = STATE.get("llm", "clean")
        if isinstance(r, Exception):
            raise r
        return r
    gl.nondet.exec_prompt = exec_prompt
    gl.eq_principle = types.SimpleNamespace(strict_eq=lambda fn: fn(), prompt_comparative=lambda fn, p: fn())

    def contract_interface(cls):
        class W:
            def __init__(self, addr): self.addr = addr
            def emit_transfer(self, value): TRANSFERS.append((self.addr.as_hex, value))
        return W
    gl.evm = types.SimpleNamespace(contract_interface=contract_interface)
    t = types.ModuleType("genlayer.types")
    t.Address = Address
    t.u256 = int
    gl.types = t
    sys.modules["genlayer"] = gl
    sys.modules["genlayer.types"] = t
    return gl

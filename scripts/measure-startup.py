#!/usr/bin/env python3
"""Build 92 11.1: cold / warm start phases on a simulator Release build.

Needs a bundle built with EXPO_PUBLIC_STARTUP_TRACE=1 (lib/startup-trace.ts).
  cold: shut the simulator down and boot it (nothing cached), settle, launch.
  warm: terminate the app (process gone, OS caches warm), launch.
Times are wall clock from just before `simctl launch`.

  python3 scripts/measure-startup.py <udid> cold|warm <runs> [out.json]
"""
import glob
import hashlib
import json
import os
import statistics
import subprocess
import sys
import time

BUNDLE = "app.griit.challenge-tracker"
KEY = "griit.startupTrace.v1"


def sh(*args, check=True):
    return subprocess.run(args, check=check, capture_output=True, text=True).stdout.strip()


def read_trace(udid):
    data = sh("xcrun", "simctl", "get_app_container", udid, BUNDLE, "data")
    for d in glob.glob(os.path.join(data, "Library/Application Support/**/RCTAsyncLocalStorage_V1"), recursive=True) + glob.glob(
        os.path.join(data, "Documents/**/RCTAsyncLocalStorage_V1"), recursive=True
    ):
        big = os.path.join(d, hashlib.md5(KEY.encode()).hexdigest())
        if os.path.exists(big):
            return json.load(open(big))
        man = os.path.join(d, "manifest.json")
        if os.path.exists(man):
            v = json.load(open(man)).get(KEY)
            if v:
                return json.loads(v)
    return None


def phases(t0, tr):
    m, n = tr["marks"], tr.get("native") or {}

    def at(k):
        return n.get(k) if k in n else m.get(k)

    def d(a, b):
        va, vb = (t0 if a == "launch" else at(a)), at(b)
        return None if va is None or vb is None else vb - va

    return {
        "native_launch": d("launch", "bundle_start"),
        "bundle_load": d("bundle_start", "js_start"),
        "fonts": d("js_start", "fonts_loaded"),
        "session_restore": d("js_start", "session_restored"),
        "profile_check": d("session_restored", "profile_checked"),
        "bootstrap": d("bootstrap_start", "bootstrap_done"),
        "home_cache": d("js_start", "home_cache"),
        "first_render": d("js_start", "home_mount"),
        "home_data": d("js_start", "home_data"),
        "splash_hidden": d("js_start", "splash_hidden"),
        "overlay_gone": d("js_start", "overlay_gone"),
        "js_start": d("launch", "js_start"),
        "interactive": None if tr.get("interactive") is None else tr["interactive"] - t0,
    }


def run(udid, mode):
    if mode == "cold":
        sh("xcrun", "simctl", "shutdown", udid, check=False)
        sh("xcrun", "simctl", "boot", udid)
        sh("xcrun", "simctl", "bootstatus", udid)
        time.sleep(20)
    else:
        sh("xcrun", "simctl", "terminate", udid, BUNDLE, check=False)
        time.sleep(3)
    t0 = int(time.time() * 1000)
    sh("xcrun", "simctl", "launch", udid, BUNDLE)
    deadline = time.time() + 40
    while time.time() < deadline:
        tr = read_trace(udid)
        if tr and tr.get("writtenAt", 0) > t0:
            return t0, tr
        time.sleep(0.5)
    return t0, None


def main():
    udid, mode, runs = sys.argv[1], sys.argv[2], int(sys.argv[3])
    out = sys.argv[4] if len(sys.argv) > 4 else None
    rows = []
    for i in range(runs):
        t0, tr = run(udid, mode)
        p = phases(t0, tr) if tr else {"interactive": None}
        rows.append({"run": i + 1, "t0": t0, "phases": p, "trace": tr})
        print(f"{mode} run {i + 1}: " + ", ".join(f"{k}={v}" for k, v in p.items()), flush=True)
    keys = rows[0]["phases"].keys()
    med = {}
    for k in keys:
        vals = [r["phases"].get(k) for r in rows if r["phases"].get(k) is not None]
        med[k] = statistics.median(vals) if vals else None
    print(f"{mode} median: " + ", ".join(f"{k}={v}" for k, v in med.items()))
    if out:
        json.dump({"mode": mode, "runs": rows, "median": med}, open(out, "w"), indent=1)


if __name__ == "__main__":
    main()

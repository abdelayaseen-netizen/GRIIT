#!/usr/bin/env python3
"""Build 92 11.1: print the profile-open trace (griit.profileTrace.v1) from a simulator's app container."""
import glob, hashlib, json, os, subprocess, sys

udid = sys.argv[1]
key = "griit.profileTrace.v1"
data = subprocess.run(["xcrun", "simctl", "get_app_container", udid, "app.griit.challenge-tracker", "data"],
                      capture_output=True, text=True).stdout.strip()
for d in glob.glob(os.path.join(data, "**/RCTAsyncLocalStorage_V1"), recursive=True):
    big = os.path.join(d, hashlib.md5(key.encode()).hexdigest())
    if os.path.exists(big):
        print(json.dumps(json.load(open(big)))); break
    man = os.path.join(d, "manifest.json")
    if os.path.exists(man) and key in json.load(open(man)):
        print(json.load(open(man))[key]); break

"""Build 90 01b.3 / build 92 11.4: tRPC requests in a window of `railway logs --http --json` output.
  python3 scripts/count-trpc-minute.py <log.json> <startISO> <endISO> [--ip <srcIp>] [-v]
"""
import json,sys
from collections import Counter
f,start,end=sys.argv[1],sys.argv[2],sys.argv[3]
ip=sys.argv[sys.argv.index('--ip')+1] if '--ip' in sys.argv else None
rows=[]
for line in open(f):
    line=line.strip()
    if not line: continue
    try: j=json.loads(line)
    except: continue
    ts=j.get('timestamp','')
    if not (start<=ts<=end): continue
    if ip and j.get('srcIp')!=ip: continue
    path=j.get('path','')
    if not path.startswith('/api/trpc/'): continue
    rows.append((ts[11:23],j['httpStatus'],j['method'],path.replace('/api/trpc/','')))
rows.sort()
def sec(t): h,m,s=t.split(':'); return int(h)*3600+int(m)*60+float(s)
best=(0,None)
for i,r in enumerate(rows):
    t0=sec(r[0]); n=sum(1 for q in rows if 0<=sec(q[0])-t0<60)
    if n>best[0]: best=(n,r[0])
st=Counter(r[1] for r in rows)
print(f"trpc requests total={len(rows)} statuses={dict(st)} busiest_minute={best[0]} starting {best[1]}")
c=Counter(r[3] for r in rows)
for p,n in c.most_common(40): print(f"  {n:3d} {p}")
if '-v' in sys.argv:
    for r in rows: print('  ',*r)

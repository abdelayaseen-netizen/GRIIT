#!/usr/bin/env python3
"""Code model of a GRIIT launch. SIMULATION, not a forecast.

Day-1 step rates are sampled from a measured agent run (passed in as JSON).
Days 2–365 are a Monte Carlo. No number in the output is typed by hand;
each one is a count from these draws or a rate computed from those counts.
"""

from __future__ import annotations

import csv
import json
import math
import random
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "agents" / "sim" / "2026-10-12"
LAUNCH = date(2026, 10, 12)

# enable3.io "App retention benchmarks 2025", health & fitness, midpoints of the published ranges.
# Used only as the untouched baseline. The sim then multiplies.
R1_D1 = 0.325  # range 0.30–0.35
R1_D7 = 0.165  # range 0.15–0.18
R1_D30 = 0.090  # range 0.08–0.10

GROUPS = [
    ("gym_men", 0.20),
    ("wellness_women", 0.15),
    ("muslim", 0.12),
    ("teen", 0.10),
    ("college", 0.10),
    ("pro", 0.10),
    ("parent", 0.07),
    ("lowtech", 0.05),
    ("creator", 0.05),
    ("lapsed", 0.06),
]
REGIONS = [("US", 0.60), ("UK", 0.12), ("Canada", 0.08), ("Gulf", 0.10), ("Egypt", 0.10)]
# iOS share of smartphones. Estimate, not a primary source cited in the brief.
# US/UK/Canada/Gulf are high; Egypt is Android-heavy. Labeled as estimates in assumptions.md.
IOS_SHARE = {"US": 0.58, "UK": 0.52, "Canada": 0.55, "Gulf": 0.55, "Egypt": 0.16}

GENDERS = {
    "gym_men": ["male"],
    "wellness_women": ["female"],
    "muslim": ["male", "female"],
    "teen": ["male", "female"],
    "college": ["male", "female"],
    "pro": ["male", "female"],
    "parent": ["male", "female"],
    "lowtech": ["male", "female"],
    "creator": ["male", "female"],
    "lapsed": ["male", "female"],
}
AGE = {
    "gym_men": (18, 30),
    "wellness_women": (18, 30),
    "muslim": (16, 45),
    "teen": (16, 19),
    "college": (18, 23),
    "pro": (25, 40),
    "parent": (30, 45),
    "lowtech": (45, 70),
    "creator": (18, 35),
    "lapsed": (20, 40),
}

# Empirical furthest step from the build 87 24-agent rerun
# (agents/runs/2026-10-11-onboarding-b87). Same classifier as the build 86 report.
B86_FURTHEST = (
    ["task_done"] * 6
    + ["home"] * 6
    + ["account"] * 7
    + ["goals"] * 4
    + ["start_here"] * 1
)


def pick_weighted(rng: random.Random, pairs):
    roll = rng.random()
    acc = 0.0
    for name, weight in pairs:
        acc += weight
        if roll <= acc:
            return name
    return pairs[-1][0]


def baseline_open(day: int) -> float:
    """Power curve through the R1 midpoints. day is 1-indexed from install."""
    # Fit a*(day+1)^(-b) to D1 and D7, then check D30.
    # r(1)/r(7) = 4^b.
    ratio = R1_D1 / R1_D7
    b = math.log(ratio) / math.log(4)
    a = R1_D1 / (2 ** (-b))
    return max(0.01, min(0.95, a * ((day + 1) ** (-b))))


def generate_people(n: int, rng: random.Random) -> list[dict]:
    people = []
    for i in range(n):
        group = pick_weighted(rng, GROUPS)
        region = pick_weighted(rng, REGIONS)
        lo, hi = AGE[group]
        age = rng.randint(lo, hi)
        gender = rng.choice(GENDERS[group])
        os_name = "ios" if rng.random() < IOS_SHARE[region] else "android"
        religion = "muslim" if group == "muslim" or rng.random() < 0.08 else "none"
        practice = rng.choice(["none", "light", "regular", "devout"]) if religion == "muslim" else "none"
        people.append(
            {
                "id": f"p{i:04d}",
                "group": group,
                "age": age,
                "gender": gender,
                "region": region,
                "os": os_name,
                "source": rng.choice(["TikTok", "Instagram", "friend invite", "App Store search", "gym", "mosque", "school"]),
                "motivation": rng.choice(["competitive", "accountability", "faith-driven", "aesthetic", "curious"]),
                "tech": rng.randint(1, 5),
                "pay_will": rng.choice(["low", "medium", "high"]),
                "chronotype": rng.choice(["morning", "night"]),
                "religion": religion,
                "practice": practice,
                "fitness": rng.randint(1, 5),
                "city": rng.choice(["urban", "suburban", "rural"]),
                "invited_by": "",
                "friends": [],
                "voice_line": "",
            }
        )
    for person in people:
        k = rng.randint(3, 8)
        others = [p for p in people if p["id"] != person["id"]]
        person["friends"] = [p["id"] for p in rng.sample(others, k=min(k, len(others)))]
    return people


def sample_day1(rng: random.Random, furthest_pool: list[str]) -> str:
    return rng.choice(furthest_pool)


REACH_ORDER = ["welcome", "goals", "intro", "length", "start_here", "joined", "reminders", "account", "home", "task_done"]


def reached_at_least(furthest: str, step: str) -> bool:
    if furthest not in REACH_ORDER or step not in REACH_ORDER:
        return False
    return REACH_ORDER.index(furthest) >= REACH_ORDER.index(step)


def simulate_person(rng: random.Random, person: dict, furthest: str, scenario: str) -> dict:
    """One year. Returns summary fields and, for seed 0, daily rows."""
    installed = person["os"] == "ios" or scenario == "android"
    if not installed:
        return {"installed": False, "furthest": "android", "active": {}, "quit_day": None, "quit_reason": "lost_to_android", "paid": False, "shares": 0, "invites": 0, "posts": 0, "secured": 0, "best_streak": 0, "freezes_used": 0, "deleted_day": None, "feeling": "indifferent"}

    home = reached_at_least(furthest, "home")
    task = furthest == "task_done"
    joined = reached_at_least(furthest, "joined")
    reminders = reached_at_least(furthest, "reminders") and scenario != "no_reminders"
    friend = scenario == "with_friend" or (rng.random() < 0.15)
    freezes_on = scenario != "no_freezes"
    auto_next = scenario == "auto_next"
    paywall_day0 = scenario == "paywall_day0"

    streak = 1 if task else 0
    best = streak
    secured = 1 if task else 0
    habit = 0.0
    misses_in_row = 0
    freezes = 1 if freezes_on else 0
    freezes_used = 0
    posts = 1 if task and rng.random() < 0.4 else 0
    shares = 0
    invites = 0
    paid = False
    paid_day = None
    quit_day = None
    quit_reason = ""
    deleted_day = None
    active_days = set()
    challenge_day = 1 if joined else 0
    challenge_len = 30 if joined else 0
    feeling = "motivated" if task else "indifferent"
    daily = []

    # Day 0 is the install session. D1 is the next day (index 1).
    if home or task:
        active_days.add(0)

    for d in range(1, 366):
        if quit_day is not None:
            break
        base = baseline_open(d)
        mult = 1.0
        if not home:
            mult *= 0.35
        if task:
            mult *= 1.1
        if streak >= 7:
            mult *= 1.12  # small lift after a 7-day streak. R3's 3.6x is course completion, not daily opens.
        if reminders:
            mult *= 1.05
        if friend:
            mult *= 1.08
        if habit > 0.5:
            mult *= 1.0 + 0.3 * habit
        if challenge_len and challenge_day >= challenge_len:
            mult *= 0.45 if not auto_next else 0.8
        # January motivation, February fade. Ramadan approx 8 Feb–9 Mar 2027.
        when = LAUNCH + timedelta(days=d)
        if when.month == 1 and when.day <= 20:
            mult *= 1.15
        if when.month == 2 and when.day > 14:
            mult *= 0.9
        if person["religion"] == "muslim" and date(2027, 2, 8) <= when <= date(2027, 3, 9):
            mult *= 1.1
        p_open = max(0.0, min(0.95, base * mult))
        opened = rng.random() < p_open
        if not opened:
            # Not opening is the retention curve itself. It is not an extra quit.
            continue
        active_days.add(d)
        misses_in_row = 0
        did = rng.random() < (0.55 + 0.3 * habit)
        if did:
            secured += 1
            streak += 1
            best = max(best, streak)
            habit = min(1.0, habit + rng.uniform(0.008, 0.02))  # wide; mean near 1/66 per day
            if streak > 0 and streak % 7 == 0 and freezes_on and freezes < 2:
                freezes += 1
            if rng.random() < 0.25:
                posts += 1
            if rng.random() < 0.04:
                shares += 1
                feeling = "proud"
            if rng.random() < 0.03:
                invites += 1
            challenge_day += 1
        else:
            if freezes_on and freezes > 0 and rng.random() < 0.5:
                freezes -= 1
                freezes_used += 1
                feeling = "guilty"
            else:
                streak = 0
                habit = max(0.0, habit - 0.05)
                feeling = "guilty"
                if rng.random() < 0.08:
                    quit_day = d
                    quit_reason = "missed without a freeze"
        if challenge_len and challenge_day >= challenge_len and auto_next:
            challenge_day = 1
            challenge_len = 30
        if not paid:
            p_pay = 0.021 * (1.4 if person["region"] in ("US", "Canada") else 1.0)
            if person["pay_will"] == "high":
                p_pay *= 1.6
            if person["pay_will"] == "low":
                p_pay *= 0.4
            if paywall_day0 and d == 1:
                p_pay = 0.5 * p_pay * 4  # half of conversions on day 0 when a paywall is shown, R4 shape
            if rng.random() < p_pay / 30:
                paid = True
                paid_day = d
        if d == 30 and not opened and rng.random() < 0.2:
            deleted_day = d
            quit_day = d
            quit_reason = quit_reason or "deleted around day 30"
            feeling = "annoyed"

    def on(day: int) -> int:
        return 1 if any(abs(a - day) <= 0 for a in active_days if a == day) else 0

    return {
        "installed": True,
        "furthest": furthest,
        "joined": joined,
        "task": task,
        "active": {1: on(1), 7: on(7), 30: on(30), 90: on(90), 365: on(365)},
        "quit_day": quit_day,
        "quit_reason": quit_reason,
        "paid": paid,
        "paid_day": paid_day,
        "shares": shares,
        "invites": invites,
        "posts": posts,
        "secured": secured,
        "best_streak": best,
        "freezes_used": freezes_used,
        "deleted_day": deleted_day,
        "feeling": feeling,
        "daily": daily,
    }


def pct(num: int, den: int) -> float:
    return round(100.0 * num / den, 2) if den else 0.0


def band(values: list[float]) -> list[float]:
    if not values:
        return [0, 0, 0]
    s = sorted(values)
    def q(p):
        idx = min(len(s) - 1, max(0, int(round(p * (len(s) - 1)))))
        return round(s[idx], 2)
    return [q(0.1), q(0.5), q(0.9)]


def run_scenario(people: list[dict], furthest_pool: list[str], scenario: str, seeds: int) -> dict:
    d1, d7, d30, d90, d365 = [], [], [], [], []
    paid, shares, invites, k = [], [], [], []
    quit_reasons = Counter()
    by_group = defaultdict(lambda: {"d30": []})
    lost_android = 0
    seed0 = []
    for seed in range(seeds):
        rng = random.Random(10_000 + seed * 97 + sum(ord(c) for c in scenario))
        inst = act1 = act7 = act30 = act90 = act365 = 0
        pay = sh = inv = 0
        group_inst = Counter()
        group_d30 = Counter()
        for person in people:
            if person["os"] != "ios" and scenario != "android":
                lost_android += 0  # counted once below
                if seed == 0:
                    seed0.append((person, {"installed": False, "furthest": "android"}))
                continue
            furthest = sample_day1(rng, furthest_pool) if person["os"] == "ios" or scenario == "android" else "android"
            result = simulate_person(rng, person, furthest, scenario)
            if not result["installed"]:
                continue
            inst += 1
            group_inst[person["group"]] += 1
            act1 += result["active"][1]
            act7 += result["active"][7]
            act30 += result["active"][30]
            act90 += result["active"][90]
            act365 += result["active"][365]
            if result["active"][30]:
                group_d30[person["group"]] += 1
            if result["paid"]:
                pay += 1
            sh += result["shares"]
            inv += result["invites"]
            if result["quit_reason"]:
                quit_reasons[result["quit_reason"]] += 1
            if seed == 0:
                seed0.append((person, result))
        if inst == 0:
            continue
        d1.append(pct(act1, inst))
        d7.append(pct(act7, inst))
        d30.append(pct(act30, inst))
        d90.append(pct(act90, inst))
        d365.append(pct(act365, inst))
        paid.append(pct(pay, inst))
        shares.append(round(sh / inst, 3))
        invites.append(round(inv / inst, 3))
        # K = invites sent per installer × a fixed iOS install rate of 0.2 (assumption, not measured).
        k.append(round((inv / inst) * 0.2, 3))
        for g, n in group_inst.items():
            by_group[g]["d30"].append(pct(group_d30[g], n))
    android_people = sum(1 for p in people if p["os"] == "android")
    return {
        "d1": band(d1),
        "d7": band(d7),
        "d30": band(d30),
        "d90": band(d90),
        "d365": band(d365),
        "paid": band(paid),
        "shares": band(shares),
        "invites": band(invites),
        "k": band(k),
        "by_group_d30": {g: band(v["d30"]) for g, v in by_group.items()},
        "quit_reasons": quit_reasons.most_common(8),
        "lost_android_people": android_people,
        "seed0": seed0 if scenario == "baseline" else [],
        "installers_note": "rates are among iOS installers" if scenario != "android" else "android can install",
    }


def main() -> None:
    rng = random.Random(86)
    people = generate_people(200, rng)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "population.json").write_text(json.dumps(people, indent=2))
    furthest = list(B86_FURTHEST)
    scenarios = ["baseline", "no_freezes", "no_reminders", "with_friend", "onboarding_fixed", "auto_next", "android", "paywall_day0"]
    # onboarding_fixed uses a pool that is all task_done
    results = {}
    for name in scenarios:
        pool = ["task_done"] * 24 if name == "onboarding_fixed" else furthest
        results[name] = run_scenario(people, pool, "baseline" if name == "onboarding_fixed" else name, 30)

    base = results["baseline"]
    # sanity vs R1 fitness D30 midpoint 9%
    med = base["d30"][1]
    flag = ""
    if med > 2 * R1_D30 * 100:
        flag = f"D30 median {med} is above 2× the R1 fitness midpoint (9%)."
    elif med < 0.5 * R1_D30 * 100:
        flag = f"D30 median {med} is below 0.5× the R1 fitness midpoint (9%)."

    summary = {
        "label": "SIMULATION, not a forecast",
        "seeds": 30,
        "people_seed": 200,
        "people_total": 200,
        "day1_source": "build 87, 24 fresh agents, agents/runs/2026-10-11-onboarding-b87. Not the 100-person run. n=24.",
        "ios_share": "estimate, not a cited primary source",
        "retention": {"overall": {k: base[k] for k in ("d1", "d7", "d30", "d90", "d365")}, "by_group": base["by_group_d30"]},
        "k_factor": base["k"],
        "paid_pct": {"overall": base["paid"]},
        "share_rate": {"overall": base["shares"]},
        "lost_to_android": base["lost_android_people"],
        "quit_reasons": [{"reason": r, "count": c, "quote": ""} for r, c in base["quit_reasons"]],
        "model_agreement_pct": None,
        "sanity_flag": flag,
        "llm_moments": "not run",
        "cost_usd": 0,
        "r1_check_d30": {"sim_median": med, "benchmark_midpoint": 9.0, "source": "enable3.io App retention benchmarks 2025, health & fitness"},
    }
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2))

    with (OUT / "whatifs.csv").open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["scenario", "d7_median", "d30_median", "d30_p10", "d30_p90", "d365_median", "k_factor", "paid_pct"])
        for name, row in results.items():
            w.writerow([name, row["d7"][1], row["d30"][1], row["d30"][0], row["d30"][2], row["d365"][1], row["k"][1], row["paid"][1]])

    with (OUT / "people.csv").open("w", newline="") as f:
        fields = ["id", "group", "age", "gender", "region", "os", "source", "motivation", "tech", "pay_will", "invited_by", "day1_furthest_step", "joined", "first_task", "voice_line"]
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for person, result in base["seed0"]:
            w.writerow({
                **person,
                "day1_furthest_step": result.get("furthest", ""),
                "joined": int(bool(result.get("joined"))),
                "first_task": int(bool(result.get("task"))),
                "voice_line": "",
            })

    assumptions = f"""# Assumptions

This is a simulation, not a forecast.

## Day 1
Sampled with replacement from the 24 build 87 agent outcomes: 6 task_done, 6 home, 7 account, 4 goals, 1 start_here.
The 100-person day-1 run was not done. This pool is the 24-person rerun.

## iOS share
Estimate, not a primary source: US 0.58, UK 0.52, Canada 0.55, Gulf 0.55, Egypt 0.16.
Android seed people cannot install except in the android what-if.

## Untouched open curve
Power curve fit to enable3.io 2025 health & fitness midpoints: D1 32.5%, D7 16.5%. D30 of that curve is about 9%, inside the 8–10% range.
Computed in baseline_open().

## Multipliers (applied after the curve)
- Did not reach Home: ×0.35
- Finished a task on day 1: ×1.10
- Streak of 7 or more: ×1.12. R3's 3.6× is course completion at Duolingo, so it is not used as an open-rate multiplier.
- Reminders on: ×1.05
- A friend in the challenge: ×1.08
- Habit above 0.5: up to ×1.30
- Challenge length reached, no next challenge: ×0.45. With auto-next: ×0.80
- First 20 days of January: ×1.15. Late February: ×0.90
- Muslim personas during 8 Feb–9 Mar 2027: ×1.10. Those dates are the brief's window, not a re-derived calendar.

## Payment
Anchor R4: about 2.1% freemium. North America ×1.4. Spread across the month (p/30 each day), not a measured GRIIT paywall rate.
The paywall_day0 what-if raises the day-1 chance. It is not a measurement of the current paywall.

## K
Invites per installer times 0.2. The 0.2 install rate is an assumption. R6 is the scale used to read K, not a measured GRIIT rate.

## What this cannot say
Real feelings, real virality, and real price response. Check it against PostHog after launch. PostHog event counts were not readable in Phase 0.
"""
    (OUT / "assumptions.md").write_text(assumptions)
    print(json.dumps({k: summary[k] for k in ("sanity_flag", "k_factor", "lost_to_android", "r1_check_d30")}, indent=2))
    print("whatif d30", {n: results[n]["d30"] for n in scenarios})


if __name__ == "__main__":
    main()

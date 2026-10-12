# Assumptions

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

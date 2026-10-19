import { loadConfig, priceOf } from "./config";

export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const SONNET_MODEL = "claude-sonnet-4-6";

const config = loadConfig();
export const PRICE = config.prices;

export function dollars(model: string, inputTokens: number, outputTokens: number): number {
  const price = priceOf(model, config);
  return (inputTokens / 1_000_000) * price.inPerM + (outputTokens / 1_000_000) * price.outPerM;
}

/** Projects a full run from what a dry run actually spent per step, per model. */
export function projectRun(input: {
  measured: { model: string; usd: number; steps: number }[];
  planned: { model: string; sessions: number; stepsEach: number }[];
}): { perStep: Record<string, number>; total: number; lines: string[] } {
  const perStep: Record<string, number> = {};
  for (const row of input.measured) {
    if (row.steps > 0) perStep[row.model] = row.usd / row.steps;
  }
  const [refModel, refRate] = Object.entries(perStep)[0] ?? ["", 0];
  const scaled = (model: string) => (refModel ? refRate * (priceOf(model, config).outPerM / priceOf(refModel, config).outPerM) : 0);
  let total = 0;
  const lines: string[] = [];
  for (const plan of input.planned) {
    const rate = perStep[plan.model] ?? scaled(plan.model);
    const cost = rate * plan.sessions * plan.stepsEach;
    total += cost;
    lines.push(`${plan.sessions} sessions × ${plan.stepsEach} steps on ${plan.model} at ${money(rate)}/step: ${money(cost)}${perStep[plan.model] == null ? " (rate scaled from the measured model by list price)" : ""}`);
  }
  return { perStep, total, lines };
}

/** Rough pre-run estimate. Image is resized to a 1000px long side. */
export function estimate(agents: number, stepsEach: number, model: string) {
  const inputPerStep = 3500;
  const outputPerStep = 300;
  const per = dollars(model, inputPerStep, outputPerStep);
  return {
    agents,
    stepsEach,
    calls: agents * stepsEach,
    perStep: per,
    total: per * agents * stepsEach,
    model,
  };
}

export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function estimateText(kind: "pilot" | "full"): string {
  const haikuExpected = estimate(kind === "pilot" ? 12 : 120, kind === "pilot" ? 40 : 40, HAIKU_MODEL);
  const haikuWorst = estimate(kind === "pilot" ? 12 : 120, kind === "pilot" ? 80 : 80, HAIKU_MODEL);
  const freeNote =
    kind === "full"
      ? `Full pool, both modes: goal worst ${money(estimate(120, 80, HAIKU_MODEL).total)} on Haiku plus free-roam worst ${money(estimate(120, 120, HAIKU_MODEL).total)}.`
      : "This is the 12-agent goal-mode pilot, one simulator, sequential. Haiku 4.5 only. No second-model comparison.";
  return [
    `Cost estimate (${kind}). Rate is the published Haiku 4.5 price, $1 per million input tokens and $5 per million output tokens.`,
    `Assumed ~3,500 input tokens and ~300 output tokens per step, screenshot resized to 1000px.`,
    freeNote,
    `Haiku expected ${haikuExpected.calls} steps ${money(haikuExpected.total)} (${money(haikuExpected.perStep)}/step). Worst ${haikuWorst.calls} steps ${money(haikuWorst.total)}.`,
    `Safety stop: abort the run if measured spend passes $20.`,
    `Target: production Supabase. No staging URL is configured. The iOS simulator runs the installed GRIIT app.`,
  ].join("\n");
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type Price = { inPerM: number; outPerM: number };

export type AgentConfig = {
  models: { default: string; firstDay: string };
  firstDayGroups: string[];
  capUsd: number;
  maxTokens: number;
  prices: Record<string, Price>;
};

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.config.json");

/** agents/agents.config.json, then AGENT_MODEL / AGENT_FIRST_DAY_MODEL / AGENT_CAP_USD / AGENT_MAX_TOKENS from the environment. */
export function loadConfig(env: Record<string, string | undefined> = process.env, raw?: string): AgentConfig {
  const base = JSON.parse(raw ?? fs.readFileSync(file, "utf8")) as AgentConfig;
  const cap = Number(env.AGENT_CAP_USD);
  const maxTokens = Number(env.AGENT_MAX_TOKENS);
  return {
    ...base,
    models: {
      default: env.AGENT_MODEL?.trim() || base.models.default,
      firstDay: env.AGENT_FIRST_DAY_MODEL?.trim() || base.models.firstDay,
    },
    capUsd: Number.isFinite(cap) && cap > 0 ? cap : base.capUsd,
    maxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : base.maxTokens,
  };
}

export function modelFor(persona: { group: string; model?: string }, config: AgentConfig): string {
  if (persona.model) return persona.model;
  return config.firstDayGroups.includes(persona.group) ? config.models.firstDay : config.models.default;
}

/** An unpriced model is costed at the dearest known price, so the cap stops early rather than late. */
export function priceOf(model: string, config: AgentConfig): Price {
  const known = config.prices[model];
  if (known) return known;
  const all = Object.values(config.prices);
  return {
    inPerM: Math.max(...all.map((p) => p.inPerM)),
    outPerM: Math.max(...all.map((p) => p.outPerM)),
  };
}

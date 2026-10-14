import fs from "fs";
import { HAIKU_MODEL, dollars } from "./cost";
import { safeText } from "./env";
import type { Decision } from "./types";

export type AskResult = {
  decision: Decision | null;
  raw: string;
  inputTokens: number;
  outputTokens: number;
  usd: number;
  error: string;
};

export async function askModel(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  imagePath: string;
}): Promise<AskResult> {
  const bytes = fs.readFileSync(input.imagePath);
  const data = bytes.toString("base64");
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: 400,
        system: input.system,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data } },
              { type: "text", text: input.prompt },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    return { decision: null, raw: "", inputTokens: 0, outputTokens: 0, usd: 0, error: safeText(err instanceof Error ? err.message : "network") };
  }
  const body = (await response.json()) as {
    content?: { text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
    error?: { message?: string };
  };
  const raw = body.content?.map((part) => part.text ?? "").join("\n") ?? "";
  const inputTokens = body.usage?.input_tokens ?? 0;
  const outputTokens = body.usage?.output_tokens ?? 0;
  if (!response.ok) {
    return {
      decision: null,
      raw: "",
      inputTokens,
      outputTokens,
      usd: dollars(input.model, inputTokens, outputTokens),
      error: safeText(body.error?.message || `HTTP ${response.status}`),
    };
  }
  return {
    decision: null,
    raw,
    inputTokens,
    outputTokens,
    usd: dollars(input.model, inputTokens, outputTokens),
    error: "",
  };
}

export function modelName(model: string): string {
  return model === HAIKU_MODEL ? "Haiku 4.5" : model;
}

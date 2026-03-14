import type { AnyRouter } from "@trpc/server";
import { appRouter } from "@/backend/trpc/app-router";
import { createContext } from "@/backend/trpc/create-context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function withCORS(res: Response) {
  const headers = new Headers(res.headers);

  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization, x-trpc-source");
  headers.set("Access-Control-Expose-Headers", "content-type");
  headers.set("Vary", "Origin");

  return new Response(res.body, { status: res.status, headers });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "content-type, authorization, x-trpc-source",
      "Vary": "Origin",
    },
  });
}

async function handler(request: Request) {
  try {
    const res = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter as AnyRouter,
      createContext: async () => createContext({ req: request }),
      onError() {
        // Error is thrown to client
      },
    });

    return withCORS(res);
  } catch {
    return withCORS(
      new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

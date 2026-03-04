import app from "./hono";
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT ?? 8080);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

console.log(`[backend] listening on port ${port} (PORT=${process.env.PORT ?? "unset, using 8080"})`);

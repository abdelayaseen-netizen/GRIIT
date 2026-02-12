import app from "./hono";
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT ?? 8080);

console.log(`[Hono] Starting server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

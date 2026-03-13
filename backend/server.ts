import "dotenv/config";
import app from "./hono";
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT ?? 8080);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

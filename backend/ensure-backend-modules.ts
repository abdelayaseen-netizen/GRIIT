/** Point NODE_PATH at backend/node_modules so root lib/ files can resolve zod. */
import Module from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendNodeModules = join(dirname(fileURLToPath(import.meta.url)), "node_modules");
const existing = process.env.NODE_PATH?.split(":").filter(Boolean) ?? [];
if (!existing.includes(backendNodeModules)) {
  process.env.NODE_PATH = [backendNodeModules, ...existing].join(":");
  const initPaths = (Module as typeof Module & { _initPaths?: () => void })._initPaths;
  initPaths?.();
}

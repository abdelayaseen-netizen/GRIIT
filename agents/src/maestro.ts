import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { safeText } from "./env";

type Rpc = { id?: number; result?: { content?: { type: string; text?: string }[]; isError?: boolean }; error?: { message?: string } };

export class MaestroSession {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private nextId = 1;
  private buffer = "";
  private waiters: { id: number; resolve: (msg: Rpc) => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }[] = [];

  async start() {
    if (this.proc) return;
    this.buffer = "";
    const child = spawn("maestro", ["mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, JAVA_HOME: process.env.JAVA_HOME || "/opt/homebrew/opt/openjdk" },
    });
    this.proc = child;
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      if (this.proc !== child) return;
      this.buffer += chunk;
      let nl = this.buffer.indexOf("\n");
      while (nl >= 0) {
        const line = this.buffer.slice(0, nl).trim();
        this.buffer = this.buffer.slice(nl + 1);
        if (line) this.onLine(line);
        nl = this.buffer.indexOf("\n");
      }
    });
    child.on("exit", () => {
      if (this.proc !== child) return;
      const err = new Error("Maestro MCP exited");
      for (const waiter of this.waiters) {
        clearTimeout(waiter.timer);
        waiter.reject(err);
      }
      this.waiters = [];
      this.proc = null;
    });
    await this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "griit-agents", version: "1" },
    });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  }

  stop() {
    const child = this.proc;
    this.proc = null;
    child?.kill();
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("Maestro restarted"));
    }
    this.waiters = [];
  }

  private onLine(line: string) {
    let msg: Rpc;
    try {
      msg = JSON.parse(line) as Rpc;
    } catch {
      return;
    }
    if (msg.id == null) return;
    const idx = this.waiters.findIndex((w) => w.id === msg.id);
    if (idx < 0) return;
    const waiter = this.waiters[idx]!;
    this.waiters.splice(idx, 1);
    clearTimeout(waiter.timer);
    waiter.resolve(msg);
  }

  private request(method: string, params: unknown, timeoutMs = 45000): Promise<Rpc> {
    if (!this.proc) return Promise.reject(new Error("Maestro is not running"));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waiters.findIndex((w) => w.id === id);
        if (idx >= 0) this.waiters.splice(idx, 1);
        reject(new Error(`Maestro ${method} timed out`));
      }, timeoutMs);
      this.waiters.push({ id, resolve, reject, timer });
      this.proc!.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  private async tool(name: string, args: Record<string, unknown>, timeoutMs = 45000): Promise<string> {
    const msg = await this.request("tools/call", { name, arguments: args }, timeoutMs);
    if (msg.error?.message) throw new Error(safeText(msg.error.message));
    const parts = msg.result?.content ?? [];
    const text = parts.map((part) => part.text ?? "").join("\n");
    const cleaned = text.replace(/Important: Maestro Viewer is available at http:\/\/127\.0\.0\.1:\d+\/\.[^\n]*/gi, "").trim();
    if (msg.result?.isError) {
      if (!cleaned) return "";
      throw new Error(safeText(cleaned));
    }
    return text;
  }

  async inspect(deviceId: string): Promise<string> {
    return this.call("inspect_screen", { device_id: deviceId }, 40000);
  }

  async run(deviceId: string, yaml: string): Promise<string> {
    return this.call("run", { device_id: deviceId, yaml }, 50000);
  }

  private async call(name: string, args: Record<string, unknown>, timeoutMs: number): Promise<string> {
    try {
      return await this.tool(name, args, timeoutMs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (!/unreachable|exited|not running|timed out/i.test(message)) throw err;
      this.stop();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await this.start();
      return this.tool(name, args, timeoutMs);
    }
  }
}

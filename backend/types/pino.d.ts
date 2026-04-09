declare module "pino" {
  interface Logger {
    info(obj: Record<string, unknown>, msg?: string): void;
    info(msg: string, ...args: unknown[]): void;
    error(obj: Record<string, unknown>, msg?: string): void;
    error(msg: string, ...args: unknown[]): void;
    warn(obj: Record<string, unknown>, msg?: string): void;
    warn(msg: string, ...args: unknown[]): void;
    debug(obj: Record<string, unknown>, msg?: string): void;
    debug(msg: string, ...args: unknown[]): void;
    child(bindings: Record<string, unknown>): Logger;
  }
  interface Pino {
    (opts?: Record<string, unknown>): Logger;
    stdTimeFunctions: { isoTime: () => string };
  }
  const pino: Pino;
  export default pino;
}

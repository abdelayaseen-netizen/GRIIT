/**
 * Structured logger for backend. Use logger.info/warn/error instead of native logging.
 */
import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
});

export default logger;

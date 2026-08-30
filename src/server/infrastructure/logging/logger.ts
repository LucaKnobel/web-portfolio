import pino from "pino";
import { LOG_LEVEL } from "astro:env/server";
import type { Logger } from "@/server/application/interfaces/logger.js";

type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

const toLogLevel = (value: unknown, fallback: LogLevel): LogLevel => {
  if (
    value === "trace" ||
    value === "debug" ||
    value === "info" ||
    value === "warn" ||
    value === "error"
  ) {
    return value;
  }
  return fallback;
};

const baseLogger = pino({
  level: toLogLevel(LOG_LEVEL, "info"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
    ],
    remove: true,
  },
});

export const logger: Logger = {
  trace: (message, meta) => baseLogger.trace(meta ?? {}, message),
  debug: (message, meta) => baseLogger.debug(meta ?? {}, message),
  info: (message, meta) => baseLogger.info(meta ?? {}, message),
  warn: (message, meta) => baseLogger.warn(meta ?? {}, message),
  error: (msg, meta, err) => baseLogger.error({ ...meta, err }, msg),
};

/**
 * Metadata passed along with log entries.
 */
export type LogMeta = Record<string, unknown>;

/**
 * Minimal logging interface used by the application layer.
 */
export interface Logger {
  trace(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta, err?: unknown): void;
}

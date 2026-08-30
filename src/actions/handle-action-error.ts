import { ActionError } from "astro:actions";
import { ApplicationError } from "@/server/application/errors/application-error.js";
import { logger } from "@/server/infrastructure/composition.js";

/**
 * Handles errors thrown in server actions by logging them
 * and converting them into typed Astro ActionErrors.
 */
export const handleActionError = (error: unknown): never => {
  if (error instanceof ActionError) {
    throw error;
  }

  if (error instanceof ApplicationError) {
    logger.error("Application error during action execution", {
      code: error.code,
      message: error.message,
    });

    const code =
      error.code === "RATE_LIMIT_EXCEEDED" ? "TOO_MANY_REQUESTS" : "BAD_REQUEST";

    throw new ActionError({
      code,
      message: error.message,
    });
  }

  logger.error("Unexpected error during action execution", {}, error);

  throw new ActionError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred. Please try again later.",
  });
};

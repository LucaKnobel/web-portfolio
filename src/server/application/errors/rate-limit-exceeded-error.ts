import { ApplicationError } from "@/server/application/errors/application-error.js";

export class RateLimitExceededError extends ApplicationError {
  constructor(
    message: string = "Daily email limit reached. Please try again tomorrow.",
  ) {
    super(message, "RATE_LIMIT_EXCEEDED");
  }
}

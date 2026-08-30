import { ApplicationError } from "@/server/application/errors/application-error.js";

/**
 * Thrown when an email dispatch operation fails at the application or infrastructure boundary.
 */
export class EmailSendError extends ApplicationError {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message, "EMAIL_SEND_ERROR");
  }
}

import { ApplicationError } from "@/server/application/errors/application-error.js";

export class EmailSendError extends ApplicationError {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message, "EMAIL_SEND_ERROR");
  }
}

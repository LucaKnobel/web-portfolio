export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string = "APPLICATION_ERROR",
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

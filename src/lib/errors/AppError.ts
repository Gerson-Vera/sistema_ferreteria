export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(resource: string) {
    return new AppError(`${resource} no encontrado`, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, details);
  }
}

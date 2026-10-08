/** Stable across Next.js server bundles and development module reloads. */
export class FormError extends Error {
  readonly kind = "chemizen-form-error";
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ChemizenFormError";
  }
}

export function isFormError(error: unknown): error is FormError {
  if (!error || typeof error !== "object") return false;
  const value = error as Partial<FormError>;
  return (
    value.kind === "chemizen-form-error" &&
    [400, 403, 404, 409, 429, 503].includes(value.status ?? 0) &&
    typeof value.message === "string"
  );
}

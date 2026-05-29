const MISSING_DATABASE_URL_MESSAGE = "DATABASE_URL is not configured.";

export function isMissingDatabaseConfigError(error: unknown) {
  return error instanceof Error && error.message === MISSING_DATABASE_URL_MESSAGE;
}
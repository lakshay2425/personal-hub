export class InvalidBackupError extends Error {
  constructor(message = "Invalid backup file") {
    super(message);
    this.name = "InvalidBackupError";
  }
}

export function assertBackupShape(
  data: unknown,
  requiredArrays: string[],
  version = 1,
): Record<string, unknown[]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new InvalidBackupError();
  }

  const record = data as Record<string, unknown>;

  if (record.version !== version) {
    throw new InvalidBackupError();
  }

  for (const key of requiredArrays) {
    if (!Array.isArray(record[key])) {
      throw new InvalidBackupError();
    }
  }

  return Object.fromEntries(
    requiredArrays.map((key) => [key, record[key] as unknown[]]),
  );
}

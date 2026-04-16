export const INSTALLATION_ID_STORAGE_KEY = "installation_id";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isValidInstallationId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4_PATTERN.test(value);
}

function createInstallationId(): string | null {
  if (typeof window === "undefined" || typeof window.crypto?.randomUUID !== "function") {
    return null;
  }

  const installationId = window.crypto.randomUUID();
  return isValidInstallationId(installationId) ? installationId : null;
}

export function readInstallationId(): string | null {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(INSTALLATION_ID_STORAGE_KEY);

    if (!isValidInstallationId(storedValue)) {
      if (storedValue !== null) {
        storage.removeItem(INSTALLATION_ID_STORAGE_KEY);
      }

      return null;
    }

    return storedValue;
  } catch {
    return null;
  }
}

export function ensureInstallationId(): string | null {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  const existingInstallationId = readInstallationId();
  if (existingInstallationId) {
    return existingInstallationId;
  }

  const nextInstallationId = createInstallationId();
  if (!nextInstallationId) {
    return null;
  }

  try {
    storage.setItem(INSTALLATION_ID_STORAGE_KEY, nextInstallationId);
    return readInstallationId();
  } catch {
    return null;
  }
}

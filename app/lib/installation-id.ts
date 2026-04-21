export const INSTALLATION_ID_STORAGE_KEY = "installation_id";
const INSTALLATION_ID_COOKIE_NAME = "installation_id";
const INSTALLATION_ID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const matchingCookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(cookiePrefix));

  if (!matchingCookie) {
    return null;
  }

  const cookieValue = matchingCookie.slice(cookiePrefix.length);
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

function writeCookie(value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${INSTALLATION_ID_COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${INSTALLATION_ID_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

function removeCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${INSTALLATION_ID_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
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
  let storedValue: string | null = null;

  if (storage) {
    try {
      storedValue = storage.getItem(INSTALLATION_ID_STORAGE_KEY);
    } catch {
      storedValue = null;
    }
  }

  if (isValidInstallationId(storedValue)) {
    writeCookie(storedValue);
    return storedValue;
  }

  if (storage && storedValue !== null) {
    try {
      storage.removeItem(INSTALLATION_ID_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  const cookieValue = readCookie(INSTALLATION_ID_COOKIE_NAME);
  if (isValidInstallationId(cookieValue)) {
    if (storage) {
      try {
        storage.setItem(INSTALLATION_ID_STORAGE_KEY, cookieValue);
      } catch {
        // Ignore storage mirror failures and still return the cookie value.
      }
    }

    return cookieValue;
  }

  removeCookie();
  return null;
}

export function ensureInstallationId(): string | null {
  const existingInstallationId = readInstallationId();
  if (existingInstallationId) {
    return existingInstallationId;
  }

  const nextInstallationId = createInstallationId();
  if (!nextInstallationId) {
    return null;
  }

  const storage = getLocalStorage();

  writeCookie(nextInstallationId);

  if (storage) {
    try {
      storage.setItem(INSTALLATION_ID_STORAGE_KEY, nextInstallationId);
    } catch {
      return readInstallationId();
    }
  }

  return readInstallationId();
}

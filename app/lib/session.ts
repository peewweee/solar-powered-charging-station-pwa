export type SessionRecord = {
  session_token: string | null;
  device_hash: string | null;
  remaining_seconds: number;
  status: string | null;
  ap_connected: boolean | null;
  session_end: string | null;
  last_heartbeat: string | null;
};

function coerceString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function coerceBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function coerceNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeSessionRecord(value: unknown): SessionRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    session_token: coerceString(record.session_token),
    device_hash: coerceString(record.device_hash),
    remaining_seconds: Math.max(0, Math.floor(coerceNumber(record.remaining_seconds))),
    status: coerceString(record.status),
    ap_connected: coerceBoolean(record.ap_connected),
    session_end: coerceString(record.session_end),
    last_heartbeat: coerceString(record.last_heartbeat),
  };
}

export function extractSessionRecord(value: unknown): SessionRecord | null {
  if (Array.isArray(value)) {
    return normalizeSessionRecord(value[0] ?? null);
  }

  return normalizeSessionRecord(value);
}

export function getResolvedSessionState(session: SessionRecord | null) {
  if (!session) {
    return {
      isConnected: false,
      remainingSeconds: 0,
      label: "Connect to Station",
    };
  }

  const normalizedStatus = session.status?.toLowerCase() ?? "";
  const remainingSeconds = Math.max(0, session.remaining_seconds);
  const isActive = remainingSeconds > 0 && normalizedStatus === "active" && session.ap_connected !== false;

  if (isActive) {
    return {
      isConnected: true,
      remainingSeconds,
      label: "Remaining Time",
    };
  }

  if (remainingSeconds > 0) {
    return {
      isConnected: false,
      remainingSeconds,
      label: "Connect to Station",
    };
  }

  return {
    isConnected: false,
    remainingSeconds: 0,
    label: "Connect to Station",
  };
}

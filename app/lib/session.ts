export type SessionRecord = {
  session_token: string | null;
  device_hash: string | null;
  remaining_seconds: number;
  status: string | null;
  ap_connected: boolean | null;
  session_end: string | null;
  last_heartbeat: string | null;
};

export type ResolvedSessionState = {
  isConnected: boolean;
  remainingSeconds: number;
  label: string;
  helperText: string | null;
  needsRecoveryLink: boolean;
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

function getTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getResolvedSessionState(session: SessionRecord | null, now = Date.now()): ResolvedSessionState {
  if (!session) {
    return {
      isConnected: false,
      remainingSeconds: 0,
      label: "Connect to Station",
      helperText:
        "No linked session was found for this browser. If you just connected to SOLAR CONNECT, open 192.168.4.1 to continue.",
      needsRecoveryLink: true,
    };
  }

  const normalizedStatus = session.status?.toLowerCase() ?? "";
  const rawRemainingSeconds = Math.max(0, session.remaining_seconds);
  const sessionEndAt = getTimestamp(session.session_end);
  const heartbeatAt = getTimestamp(session.last_heartbeat);
  const remainingFromEnd =
    sessionEndAt === null ? null : Math.max(0, Math.ceil((sessionEndAt - now) / 1000));
  const remainingSeconds =
    remainingFromEnd === null ? rawRemainingSeconds : Math.max(0, Math.min(rawRemainingSeconds, remainingFromEnd));
  const hasFreshHeartbeat = heartbeatAt !== null && now - heartbeatAt <= 120_000;
  const isExpired = remainingFromEnd !== null && remainingFromEnd <= 0;
  const isStaleActive =
    normalizedStatus === "active" &&
    rawRemainingSeconds > 0 &&
    session.ap_connected !== false &&
    heartbeatAt !== null &&
    !hasFreshHeartbeat;
  const isActive =
    !isExpired &&
    !isStaleActive &&
    remainingSeconds > 0 &&
    normalizedStatus === "active" &&
    session.ap_connected !== false;

  if (isActive) {
    return {
      isConnected: true,
      remainingSeconds,
      label: "Remaining Time",
      helperText: null,
      needsRecoveryLink: false,
    };
  }

  if (isExpired) {
    return {
      isConnected: false,
      remainingSeconds: 0,
      label: "Connect to Station",
      helperText:
        "Your last session has ended. Reconnect to SOLAR CONNECT, or open 192.168.4.1 if the portal does not appear.",
      needsRecoveryLink: true,
    };
  }

  if (isStaleActive) {
    return {
      isConnected: false,
      remainingSeconds,
      label: "Connect to Station",
      helperText:
        "The last linked session looks stale or disconnected. Reconnect to SOLAR CONNECT, or open 192.168.4.1 to recover.",
      needsRecoveryLink: true,
    };
  }

  if (remainingSeconds > 0) {
    return {
      isConnected: false,
      remainingSeconds,
      label: "Connect to Station",
      helperText:
        "A linked session exists but is not currently active on this device. Reconnect to SOLAR CONNECT, or open 192.168.4.1 to recover.",
      needsRecoveryLink: true,
    };
  }

  return {
    isConnected: false,
    remainingSeconds: 0,
    label: "Connect to Station",
    helperText:
      "No active session is available right now. Connect to SOLAR CONNECT, or open 192.168.4.1 if you need the local recovery page.",
    needsRecoveryLink: true,
  };
}

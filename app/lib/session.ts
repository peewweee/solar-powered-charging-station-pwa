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
  phase: "active" | "disconnected" | "expired" | "not_linked";
  isConnected: boolean;
  remainingSeconds: number;
  label: string;
  helperText: string | null;
  needsRecoveryLink: boolean;
  shouldTick: boolean;
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
      phase: "not_linked",
      isConnected: false,
      remainingSeconds: 0,
      label: "Connect to Station",
      helperText: "You are disconnected. If you just connected to 'SOLAR CONNECT', ",
      needsRecoveryLink: true,
      shouldTick: false,
    };
  }

  const normalizedStatus = session.status?.toLowerCase() ?? "";
  const rawRemainingSeconds = Math.max(0, session.remaining_seconds);
  const sessionEndAt = getTimestamp(session.session_end);
  const heartbeatAt = getTimestamp(session.last_heartbeat);
  const remainingFromEnd =
    sessionEndAt === null ? null : Math.max(0, Math.ceil((sessionEndAt - now) / 1000));
  const hasFreshHeartbeat = heartbeatAt !== null && now - heartbeatAt <= 120_000;
  const isExpired =
    normalizedStatus === "expired" ||
    rawRemainingSeconds <= 0 ||
    (remainingFromEnd !== null && remainingFromEnd <= 0);
  const isDisconnected =
    !isExpired &&
    (normalizedStatus === "disconnected" ||
      session.ap_connected === false ||
      (normalizedStatus === "active" &&
        rawRemainingSeconds > 0 &&
        heartbeatAt !== null &&
        !hasFreshHeartbeat));
  const remainingSeconds =
    isDisconnected || remainingFromEnd === null
      ? rawRemainingSeconds
      : Math.max(0, Math.min(rawRemainingSeconds, remainingFromEnd));
  const isActive =
    !isExpired &&
    !isDisconnected &&
    remainingSeconds > 0 &&
    normalizedStatus === "active" &&
    session.ap_connected !== false;

  if (isActive) {
    return {
      phase: "active",
      isConnected: true,
      remainingSeconds,
      label: "Remaining Time",
      helperText: null,
      needsRecoveryLink: false,
      shouldTick: true,
    };
  }

  if (isExpired) {
    return {
      phase: "expired",
      isConnected: false,
      remainingSeconds: 0,
      label: "Expired",
      helperText: "Your one-hour session has ended. Come back again tomorrow.",
      needsRecoveryLink: false,
      shouldTick: false,
    };
  }

  if (isDisconnected) {
    return {
      phase: "disconnected",
      isConnected: false,
      remainingSeconds,
      label: "Disconnected",
      helperText:
        "Your session is currently disconnected or paused.",
      needsRecoveryLink: false,
      shouldTick: false,
    };
  }

  if (remainingSeconds > 0) {
    return {
      phase: "disconnected",
      isConnected: false,
      remainingSeconds,
      label: "Disconnected",
      helperText:
        "You are disconnected. If you just connected to 'SOLAR CONNECT',",
      needsRecoveryLink: true,
      shouldTick: false,
    };
  }

  return {
    phase: "not_linked",
    isConnected: false,
    remainingSeconds: 0,
    label: "Connect to Station",
    helperText: "You are disconnected. If you just connected to 'SOLAR CONNECT', ",
    needsRecoveryLink: true,
    shouldTick: false,
  };
}

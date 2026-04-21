import type { PostgrestError } from "@supabase/supabase-js";
import { extractSessionRecord, type SessionRecord } from "./session";
import { getSupabaseBrowserClient, getSupabaseEnvErrorMessage } from "./supabase";

type SupabaseLikeClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;
type LegacySessionRow = Record<string, unknown>;

function getSupabaseClientOrThrow(): SupabaseLikeClient {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(getSupabaseEnvErrorMessage());
  }

  return supabase;
}

function isRpcMissing(error: PostgrestError | null) {
  if (!error) {
    return false;
  }

  return error.code === "PGRST202" || error.message.toLowerCase().includes("could not find the function");
}

function normalizeCompatibilityRow(row: LegacySessionRow | null | undefined): SessionRecord | null {
  if (!row) {
    return null;
  }

  return extractSessionRecord({
    session_token: row.session_token ?? row.token,
    device_hash: row.device_hash ?? row.mac_hash,
    remaining_seconds: row.remaining_seconds,
    status: row.status,
    ap_connected: row.ap_connected,
    session_end: row.session_end,
    last_heartbeat: row.last_heartbeat,
  });
}

function getTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRowRecency(row: LegacySessionRow) {
  const id = typeof row.id === "number" ? row.id : 0;
  const heartbeatAt = getTimestamp(typeof row.last_heartbeat === "string" ? row.last_heartbeat : null) ?? 0;
  const sessionEndAt = getTimestamp(typeof row.session_end === "string" ? row.session_end : null) ?? 0;
  const sessionStartAt = getTimestamp(typeof row.session_start === "string" ? row.session_start : null) ?? 0;
  const latestAt = Math.max(heartbeatAt, sessionStartAt, sessionEndAt);

  return {
    id,
    heartbeatAt,
    sessionEndAt,
    sessionStartAt,
    latestAt,
  };
}

function pickBestSession(rows: LegacySessionRow[]) {
  const normalizedRows = rows
    .map((row) => ({
      session: normalizeCompatibilityRow(row),
      row,
    }))
    .filter((entry): entry is { session: SessionRecord; row: LegacySessionRow } => entry.session !== null);

  if (!normalizedRows.length) {
    return null;
  }

  normalizedRows.sort((left, right) => {
    const rightRecency = getRowRecency(right.row);
    const leftRecency = getRowRecency(left.row);

    return (
      rightRecency.latestAt - leftRecency.latestAt ||
      rightRecency.heartbeatAt - leftRecency.heartbeatAt ||
      rightRecency.sessionStartAt - leftRecency.sessionStartAt ||
      rightRecency.sessionEndAt - leftRecency.sessionEndAt ||
      rightRecency.id - leftRecency.id
    );
  });

  return normalizedRows[0]?.session ?? null;
}

async function claimSessionLinkFallback(supabase: SupabaseLikeClient, sessionToken: string, installationId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ installation_id: installationId })
    .eq("token", sessionToken)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const session = normalizeCompatibilityRow((data as LegacySessionRow | null) ?? null);
  if (!session) {
    throw new Error("No matching session was found for this link.");
  }

  return session;
}

async function resolveInstallationSessionFallback(supabase: SupabaseLikeClient, installationId: string) {
  const { data: linkedRows, error: linkedError } = await supabase
    .from("sessions")
    .select("*")
    .eq("installation_id", installationId)
    .order("last_heartbeat", { ascending: false, nullsFirst: false })
    .order("session_start", { ascending: false, nullsFirst: false })
    .order("session_end", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(10);

  if (linkedError) {
    throw linkedError;
  }

  const linkedDeviceSession = pickBestSession(((linkedRows ?? []) as LegacySessionRow[]).filter(Boolean));

  if (!linkedDeviceSession?.device_hash) {
    return linkedDeviceSession;
  }

  const { data: deviceRows, error: deviceError } = await supabase
    .from("sessions")
    .select("*")
    .or(`device_hash.eq.${linkedDeviceSession.device_hash},mac_hash.eq.${linkedDeviceSession.device_hash}`)
    .order("last_heartbeat", { ascending: false, nullsFirst: false })
    .order("session_start", { ascending: false, nullsFirst: false })
    .order("session_end", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(20);

  if (deviceError) {
    throw deviceError;
  }

  return pickBestSession(((deviceRows ?? []) as LegacySessionRow[]).filter(Boolean));
}

export async function claimSessionLink(sessionToken: string, installationId: string) {
  const supabase = getSupabaseClientOrThrow();

  const rpcResult = await supabase.rpc("claim_session_link", {
    session_token: sessionToken,
    installation_id: installationId,
  });

  if (!rpcResult.error) {
    return extractSessionRecord(rpcResult.data);
  }

  if (!isRpcMissing(rpcResult.error)) {
    throw rpcResult.error;
  }

  return claimSessionLinkFallback(supabase, sessionToken, installationId);
}

export async function resolveInstallationSession(installationId: string) {
  const supabase = getSupabaseClientOrThrow();

  const rpcResult = await supabase.rpc("resolve_installation_session", {
    installation_id: installationId,
  });

  if (!rpcResult.error) {
    return extractSessionRecord(rpcResult.data);
  }

  if (!isRpcMissing(rpcResult.error)) {
    throw rpcResult.error;
  }

  return resolveInstallationSessionFallback(supabase, installationId);
}

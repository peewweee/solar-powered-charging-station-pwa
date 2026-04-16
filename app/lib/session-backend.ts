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

function getSessionPriority(session: SessionRecord | null, now: number) {
  if (!session) {
    return Number.NEGATIVE_INFINITY;
  }

  const remainingSeconds = Math.max(0, session.remaining_seconds);
  const sessionEndAt = getTimestamp(session.session_end);
  const heartbeatAt = getTimestamp(session.last_heartbeat);
  const status = session.status?.toLowerCase() ?? "";
  const hasFutureEnd = sessionEndAt !== null && sessionEndAt > now;
  const heartbeatFresh = heartbeatAt !== null && now - heartbeatAt <= 120_000;
  const looksActive =
    remainingSeconds > 0 &&
    status === "active" &&
    session.ap_connected !== false &&
    (hasFutureEnd || heartbeatFresh);

  if (looksActive) {
    return 100;
  }

  if (remainingSeconds > 0 && hasFutureEnd) {
    return 75;
  }

  if (status === "active") {
    return 50;
  }

  if (sessionEndAt !== null) {
    return sessionEndAt / 1_000;
  }

  if (heartbeatAt !== null) {
    return heartbeatAt / 1_000;
  }

  return remainingSeconds;
}

function pickBestSession(rows: LegacySessionRow[]) {
  const now = Date.now();
  const normalizedRows = rows
    .map((row) => ({
      session: normalizeCompatibilityRow(row),
      row,
    }))
    .filter((entry): entry is { session: SessionRecord; row: LegacySessionRow } => entry.session !== null);

  if (!normalizedRows.length) {
    return null;
  }

  normalizedRows.sort((left, right) => getSessionPriority(right.session, now) - getSessionPriority(left.session, now));
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
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("installation_id", installationId)
    .order("last_heartbeat", { ascending: false, nullsFirst: false })
    .order("session_end", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return pickBestSession(((data ?? []) as LegacySessionRow[]).filter(Boolean));
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

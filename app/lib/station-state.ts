import { getSupabaseBrowserClient, getSupabaseEnvErrorMessage } from "./supabase";

export type PortKey = "usb_a_1" | "usb_a_2" | "usb_c_1" | "usb_c_2" | "outlet";
export type PortStatus = "available" | "in_use" | "fault" | "offline";

export type StationSnapshot = {
  ports: Partial<Record<PortKey, PortStatus>>;
  batteryPercent: number | null;
  batteryUpdatedAt: string | null;
};

const DEFAULT_STATION_ID = "solar-hub-01";

function clientOrThrow() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(getSupabaseEnvErrorMessage());
  }
  return supabase;
}

function normalizePercent(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function fetchStationSnapshot(
  stationId: string = DEFAULT_STATION_ID,
): Promise<StationSnapshot> {
  const supabase = clientOrThrow();

  const [portResult, stationResult] = await Promise.all([
    supabase
      .from("port_state")
      .select("port_key, status")
      .eq("station_id", stationId),
    supabase
      .from("station_state")
      .select("battery_percent, updated_at")
      .eq("station_id", stationId)
      .maybeSingle(),
  ]);

  if (portResult.error) {
    throw portResult.error;
  }
  if (stationResult.error) {
    throw stationResult.error;
  }

  const ports: Partial<Record<PortKey, PortStatus>> = {};
  for (const row of portResult.data ?? []) {
    const key = row.port_key as PortKey | null;
    const status = row.status as PortStatus | null;
    if (key && status) {
      ports[key] = status;
    }
  }

  return {
    ports,
    batteryPercent: normalizePercent(stationResult.data?.battery_percent),
    batteryUpdatedAt: stationResult.data?.updated_at ?? null,
  };
}

export function portDisplayStatus(
  raw: PortStatus | undefined,
): "Available" | "Unavailable" {
  if (raw === "in_use" || raw === "fault" || raw === "offline") {
    return "Unavailable";
  }
  return "Available";
}

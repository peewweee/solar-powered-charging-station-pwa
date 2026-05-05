import { getSupabaseBrowserClient, getSupabaseEnvErrorMessage } from "./supabase";

export type PortKey = "usb_a_1" | "usb_a_2" | "usb_c_1" | "usb_c_2" | "outlet";
export type PortStatus = "available" | "in_use" | "fault" | "offline";

export type StationSnapshot = {
  ports: Partial<Record<PortKey, PortStatus>>;
  /* Per-port "seconds in_use today" counter. Drives the USB Wh estimate
   * (Pavg × hours). Reset at UTC midnight by the firmware. */
  portsDailyInUseSeconds: Partial<Record<PortKey, number>>;
  batteryPercent: number | null;
  batteryUpdatedAt: string | null;
  /* AC outlet energy delivered today (Wh), measured by the PZEM as
   * cumulative_energy_wh − cumulative_at_midnight. Real measurement,
   * not an estimate. */
  acEnergyWhToday: number;
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
      .select("port_key, status, daily_in_use_seconds")
      .eq("station_id", stationId),
    supabase
      .from("station_state")
      .select("battery_percent, ac_energy_wh_today, updated_at")
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
  const portsDailyInUseSeconds: Partial<Record<PortKey, number>> = {};
  for (const row of portResult.data ?? []) {
    const key = row.port_key as PortKey | null;
    const status = row.status as PortStatus | null;
    if (key && status) {
      ports[key] = status;
    }
    if (key && typeof row.daily_in_use_seconds === "number") {
      portsDailyInUseSeconds[key] = row.daily_in_use_seconds;
    }
  }

  const acEnergyWhTodayRaw = stationResult.data?.ac_energy_wh_today;
  const acEnergyWhToday =
    typeof acEnergyWhTodayRaw === "number" && Number.isFinite(acEnergyWhTodayRaw)
      ? acEnergyWhTodayRaw
      : 0;

  return {
    ports,
    portsDailyInUseSeconds,
    batteryPercent: normalizePercent(stationResult.data?.battery_percent),
    batteryUpdatedAt: stationResult.data?.updated_at ?? null,
    acEnergyWhToday,
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

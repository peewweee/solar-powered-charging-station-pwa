"use client";

import React, { useEffect, useState } from "react";
import BatteryGauge from "react-battery-gauge";
import { ensureInstallationId, readInstallationId } from "../lib/installation-id";
import { getSupabaseEnvErrorMessage, hasSupabaseEnv } from "../lib/supabase";
import { getResolvedSessionState, type ResolvedSessionState } from "../lib/session";
import { resolveInstallationSession } from "../lib/session-backend";
import {
  fetchStationSnapshot,
  portDisplayStatus,
  type PortKey,
  type PortStatus,
} from "../lib/station-state";

export default function DashboardClient() {
  const ACTIVE_REFRESH_INTERVAL_MS = 3000;
  const RECOVERY_REFRESH_INTERVAL_MS = 2000;
  const [wifiTime, setWifiTime] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<ResolvedSessionState["phase"]>("not_linked");
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionHelperText, setSessionHelperText] = useState<string | null>(null);
  const [showRecoveryLink, setShowRecoveryLink] = useState(false);
  const [shouldTick, setShouldTick] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [hasResolvedSessionOnce, setHasResolvedSessionOnce] = useState(false);

  const [portStatus, setPortStatus] = useState<Partial<Record<PortKey, PortStatus>>>({});
  const [batteryPercent, setBatteryPercent] = useState<number | null>(null);

  useEffect(() => {
    let retryTimeout: number | null = null;
    let cancelled = false;

    const applyResolvedState = (resolvedState: ResolvedSessionState) => {
      setSessionPhase(resolvedState.phase);
      setWifiTime(resolvedState.remainingSeconds);
      setSessionMessage(resolvedState.label);
      setSessionHelperText(resolvedState.helperText);
      setShowRecoveryLink(resolvedState.needsRecoveryLink);
      setShouldTick(resolvedState.shouldTick);
      setSessionError(null);
      setHasResolvedSessionOnce(true);
    };

    const resolveSession = async () => {
      try {
        const installationId = ensureInstallationId() ?? readInstallationId();
        if (!installationId) {
          throw new Error("Unable to access this browser installation identity.");
        }

        const session = await resolveInstallationSession(installationId);
        const resolvedState = getResolvedSessionState(session);

        if (cancelled) {
          return;
        }

        applyResolvedState(resolvedState);
      } catch (error) {
        console.error("Failed to resolve installation session", error);

        if (!cancelled) {
          setSessionError("We could not refresh your session right now.");

          // Keep the last known linked state during transient network changes.
          if (!hasResolvedSessionOnce) {
            setSessionPhase("not_linked");
            setWifiTime(0);
            setSessionMessage("Connect to Station");
            setSessionHelperText(
              "You are disconnected. If you just connected to 'SOLAR CONNECT',",
            );
            setShowRecoveryLink(true);
            setShouldTick(false);
          }

          if (retryTimeout !== null) {
            window.clearTimeout(retryTimeout);
          }

          retryTimeout = window.setTimeout(() => {
            void resolveSession();
          }, 2500);
        }
      }
    };

    void resolveSession();
    const refreshIntervalMs =
      sessionPhase === "disconnected" || sessionError ? RECOVERY_REFRESH_INTERVAL_MS : ACTIVE_REFRESH_INTERVAL_MS;

    const refreshInterval = window.setInterval(() => {
      void resolveSession();
    }, refreshIntervalMs);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void resolveSession();
      }
    };

    const onWindowFocus = () => {
      void resolveSession();
    };

    const onPageShow = () => {
      void resolveSession();
    };

    const onOnline = () => {
      void resolveSession();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onOnline);
    };
  }, [hasResolvedSessionOnce, sessionError, sessionPhase]);

  useEffect(() => {
    if (!shouldTick || sessionPhase !== "active") {
      return;
    }

    const interval = window.setInterval(() => {
      setWifiTime((current) => {
        const nextValue = Math.max(0, current - 1);

        if (nextValue === 0) {
          setSessionPhase("expired");
          setSessionMessage("Expired");
          setSessionHelperText("Your one-hour session has ended. Come back again tomorrow.");
          setShowRecoveryLink(false);
          setShouldTick(false);
        }

        return nextValue;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionPhase, shouldTick]);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        setWeather({
          temp: data.temperature,
          desc: data.description,
          icon: data.icon,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoadingWeather(false);
      }
    }

    void fetchWeather();
  }, []);

  useEffect(() => {
    const STATION_REFRESH_INTERVAL_MS = 5000;
    let cancelled = false;

    const refresh = async () => {
      try {
        const snapshot = await fetchStationSnapshot();
        if (cancelled) return;
        setPortStatus(snapshot.ports);
        if (snapshot.batteryPercent !== null) {
          setBatteryPercent(Math.round(snapshot.batteryPercent));
        }
      } catch (error) {
        // Keep last-known values on transient failures; the dashboard
        // shouldn't flash "all available" just because a poll missed.
        console.warn("Failed to refresh station snapshot", error);
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, STATION_REFRESH_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const recoveryUrl = "http://192.168.4.1/confirm";
  const isActive = sessionPhase === "active";
  const showCountdown = sessionPhase === "active" || sessionPhase === "disconnected" || sessionPhase === "expired";
  const wifiDisplay = showCountdown ? formatTime(wifiTime) : "Offline";

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="wifi-container" data-phase={sessionPhase}>
        <div className="wifi-time" style={{ color: isActive ? "#998A64" : "#6F1D1B" }}>
          {wifiDisplay}
        </div>
        <div className="wifi-text">
          <span className="wifi-bold">
            <span className="status-dot" data-phase={sessionPhase} aria-hidden="true" />
            Wi-Fi Status
          </span>
          <span className="wifi-subtext">{sessionMessage ?? "Connect to Station"}</span>
        </div>
      </div>

      {sessionError ? (
        <div className="session-notice">{sessionError}</div>
      ) : null}

      {!isActive && sessionHelperText ? (
        <div className="session-notice">
          <span>{sessionHelperText} </span>
          {showRecoveryLink ? (
            <a href={recoveryUrl}>get your unique app link.</a>
          ) : null}
        </div>
      ) : null}

      {!hasSupabaseEnv() ? (
        <div className="session-notice">{getSupabaseEnvErrorMessage()}</div>
      ) : null}

      <div className="line-separator"></div>

      <div className="port-container">
        <h3 className="port-title">Available Ports</h3>
        <div className="port-list-container">
          <div className="port-left-items">
            <PortItem name="USB-A 1" status={portDisplayStatus(portStatus.usb_a_1)} />
            <PortItem name="USB-A 2" status={portDisplayStatus(portStatus.usb_a_2)} />
            <PortItem name="Outlet" status={portDisplayStatus(portStatus.outlet)} />
          </div>

          <div className="port-right-items">
            <PortItem name="USB-C 1" status={portDisplayStatus(portStatus.usb_c_1)} />
            <PortItem name="USB-C 2" status={portDisplayStatus(portStatus.usb_c_2)} />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "13px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          flexWrap: "nowrap",
        }}
      >
        <div className="metric-column">
          <h3 className="port-title">Battery Percentage</h3>
          <div className="metric-tile">
            {batteryPercent === null ? (
              <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                <span className="skeleton-line sm" style={{ height: "20px" }} />
                <span className="skeleton-line md" />
              </div>
            ) : (
              <div className="metric-tile-inner">
                <BatteryGauge
                  value={batteryPercent}
                  size={60}
                  customization={{
                    batteryBody: {
                      strokeColor: "#FFFFFF",
                      strokeWidth: 3,
                      fill: "transparent",
                      cornerRadius: 4,
                    },
                    batteryCap: {
                      fill: "transparent",
                      strokeColor: "#FFFFFF",
                      strokeWidth: 3,
                      cornerRadius: 2,
                    },
                    batteryMeter: {
                      fill: "#FFFFFF",
                      lowBatteryFill: "#FFFFFF",
                      noOfCells: 1,
                    },
                    readingText: {
                      lightContrastColor: "#FFFFFF",
                      darkContrastColor: "#FFFFFF",
                      fontSize: 0,
                    },
                  }}
                />

                <span className="metric-value">{batteryPercent}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="metric-column">
          <h3 className="port-title">Weather</h3>
          <div className="metric-tile">
            {loadingWeather ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                <span className="skeleton-line sm" />
                <span className="skeleton-line md" />
              </div>
            ) : weather ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  {Math.round(weather.temp)}&deg;C
                </span>
                <span style={{ fontSize: "12px", opacity: 0.85 }}>{weather.desc}</span>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.desc}
                  width={32}
                  height={32}
                />
              </div>
            ) : (
              <span style={{ fontSize: "13px", opacity: 0.7 }}>Weather unavailable</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12.67px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 className="port-title">Announcements</h3>
        <Announcements />
      </div>
    </div>
  );
}

const PortItem = ({ name, status }: { name: string; status: string }) => (
  <div className="port-item">
    <div className="port-item-text" data-status={status}>
      <span className="port-name">{name}</span>
      <span className="port-status">{status}</span>
    </div>
    <div className="port-line"></div>
  </div>
);

const Announcements = () => {
  return (
    <a
      href="https://www.pup.edu.ph/"
      target="_blank"
      rel="noopener noreferrer"
      className="announcements-card"
    >
      <div className="announcements-preview" />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span className="announcements-heading">
          Polytechnic University of the Philippines
        </span>
        <span className="announcements-sub">Click to visit website &rarr;</span>
      </div>
    </a>
  );
};

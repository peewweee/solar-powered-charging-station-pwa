"use client";

import React, { useEffect, useState } from "react";
import BatteryGauge from "react-battery-gauge";
import { ensureInstallationId, readInstallationId } from "../lib/installation-id";
import { getSupabaseEnvErrorMessage, hasSupabaseEnv } from "../lib/supabase";
import { getResolvedSessionState, type ResolvedSessionState } from "../lib/session";
import { resolveInstallationSession } from "../lib/session-backend";

export default function DashboardClient() {
  const recoveryUrl = "http://192.168.4.1/";
  const [wifiTime, setWifiTime] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<ResolvedSessionState["phase"]>("not_linked");
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [sessionHelperText, setSessionHelperText] = useState<string | null>(null);
  const [showRecoveryLink, setShowRecoveryLink] = useState(false);
  const [shouldTick, setShouldTick] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [batteryPercentage, setBatteryPercentage] = useState(60);
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [portStatus] = useState({
    port1: "inactive",
    port2: "inactive",
    port3: "inactive",
    port4: "inactive",
    outlet: "inactive",
  });

  useEffect(() => {
    let interval: number | null = null;
    let cancelled = false;

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

        setSessionPhase(resolvedState.phase);
        setWifiTime(resolvedState.remainingSeconds);
        setSessionMessage(resolvedState.label);
        setSessionHelperText(resolvedState.helperText);
        setShowRecoveryLink(resolvedState.needsRecoveryLink);
        setShouldTick(resolvedState.shouldTick);
        setSessionError(null);
      } catch (error) {
        console.error("Failed to resolve installation session", error);

        if (!cancelled) {
          setSessionPhase("not_linked");
          setWifiTime(0);
          setSessionMessage("Connect to Station");
          setSessionHelperText(
            "We could not load your linked session right now. If you are connected to SOLAR CONNECT, open 192.168.4.1 to recover.",
          );
          setShowRecoveryLink(true);
          setShouldTick(false);
          setSessionError(error instanceof Error ? error.message : "Unable to load session.");
        }
      }
    };

    void resolveSession();
    interval = window.setInterval(() => {
      if (!shouldTick) {
        return;
      }

      setWifiTime((current) => {
        const nextValue = Math.max(0, current - 1);

        if (nextValue === 0) {
          setSessionPhase("expired");
          setSessionMessage("Expired");
          setSessionHelperText(
            "Your last session has ended. Reconnect to SOLAR CONNECT, or open 192.168.4.1 if the portal does not appear.",
          );
          setShowRecoveryLink(true);
          setShouldTick(false);
        }

        return nextValue;
      });
    }, 1000);

    const refreshInterval = window.setInterval(() => {
      void resolveSession();
    }, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void resolveSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      if (interval !== null) {
        window.clearInterval(interval);
      }
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shouldTick]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isActive = sessionPhase === "active";
  const showCountdown = sessionPhase === "active" || sessionPhase === "disconnected" || sessionPhase === "expired";
  const wifiDisplay = showCountdown ? formatTime(wifiTime) : "Offline";

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="wifi-container">
        <div className="wifi-time" style={{ color: isActive ? "#998A64" : "#6F1D1B" }}>
          {wifiDisplay}
        </div>
        <div className="wifi-text">
          <span className="wifi-bold">Wi-Fi Status</span>
          <br />
          <span className="wifi-subtext">{sessionMessage ?? "Connect to Station"}</span>
        </div>
      </div>

      {sessionError ? (
        <div style={{ marginTop: "10px", color: "#F1E8E8", fontSize: "12px" }}>{sessionError}</div>
      ) : null}

      {!isActive && sessionHelperText ? (
        <div style={{ marginTop: "10px", color: "#F1E8E8", fontSize: "12px" }}>
          <span>{sessionHelperText} </span>
          {showRecoveryLink ? (
            <a href={recoveryUrl} style={{ color: "#F1E8E8", textDecoration: "underline" }}>
              Open local recovery
            </a>
          ) : null}
        </div>
      ) : null}

      {!hasSupabaseEnv() ? (
        <div style={{ marginTop: "10px", color: "#F1E8E8", fontSize: "12px" }}>
          {getSupabaseEnvErrorMessage()}
        </div>
      ) : null}

      <div className="line-separator"></div>

      <div className="port-container">
        <h3 className="port-title">Available Ports</h3>
        <div className="port-list-container">
          <div className="port-left-items">
            <PortItem
              name="USB-A 1"
              status={portStatus.port1 === "active" ? "Unavailable" : "Available"}
            />
            <PortItem
              name="USB-A 2"
              status={portStatus.port2 === "active" ? "Unavailable" : "Available"}
            />
            <PortItem
              name="Outlet"
              status={portStatus.outlet === "active" ? "Unavailable" : "Available"}
            />
          </div>

          <div className="port-right-items">
            <PortItem
              name="USB-C 1"
              status={portStatus.port3 === "active" ? "Unavailable" : "Available"}
            />
            <PortItem
              name="USB-C 2"
              status={portStatus.port4 === "active" ? "Unavailable" : "Available"}
            />
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <h3 className="port-title">Battery Percentage</h3>
          <div
            style={{
              marginTop: "10px",
              background: "rgba(67, 17, 16, 0.3)",
              height: "53.33px",
              borderRadius: "10.667px",
              padding: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#F1E8E8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <BatteryGauge
                value={batteryPercentage}
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

              <span style={{ fontSize: "20px", fontWeight: "bold" }}>{batteryPercentage}%</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <h3 className="port-title">Weather</h3>
          <div
            style={{
              marginTop: "10px",
              background: "rgba(67, 17, 16, 0.3)",
              height: "53.33px",
              borderRadius: "10.667px",
              padding: "13px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#F1E8E8",
            }}
          >
            {loadingWeather ? (
              <span style={{ fontSize: "16px" }}>Loading...</span>
            ) : weather ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "400" }}>
                  {Math.round(weather.temp)}&deg;C
                </span>
                <span style={{ fontSize: "12px" }}>{weather.desc}</span>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.desc}
                  width={32}
                  height={32}
                />
              </div>
            ) : (
              <span style={{ fontSize: "16px" }}>Weather unavailable</span>
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
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(67, 17, 16, 0.35)",
        borderRadius: "12px",
        padding: "12px",
        width: "100%",
        height: "240px",
        textDecoration: "none",
        color: "#F1E8E8",
        overflow: "hidden",
        cursor: "pointer",
        transition: "0.2s",
        marginBottom: "40px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(67, 17, 16, 0.5)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(67, 17, 16, 0.35)")}
    >
      <div
        style={{
          width: "100%",
          height: "165px",
          background: "url('/announcements/preview.png') center/cover no-repeat",
          borderRadius: "10px",
          marginBottom: "10px",
        }}
      ></div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>
          Polytechnic University of the Philippines
        </span>
        <span style={{ fontSize: "12px", opacity: 0.8 }}>Click to visit website &rarr;</span>
      </div>
    </a>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import BatteryGauge from "react-battery-gauge"; 
import StationStatus from '../components/StationStatus';

export default function Dashboard() {
  // --- Wi-Fi Timer State (Updated) ---
  const [wifiTime, setWifiTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // --- Existing Dashboard State ---
  const [batteryPercentage, setBatteryPercentage] = useState(60);
  const [isCharging, setIsCharging] = useState(true);
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [portStatus, setPortStatus] = useState({
    port1: 'inactive',
    port2: 'inactive',
    port3: 'inactive',  // USB-C 1
    port4: 'inactive',  // USB-C 2
    outlet: 'inactive', // Outlet
  });

  const handleBatteryUpdate = (percent: number) => {
    setBatteryPercentage(percent);
  };

  const handlePortStatusUpdate = (ports: { port1: string; port2: string; port3: string; port4: string; outlet: string }) => {
    setPortStatus(ports);
  };

  // --- NEW: Timer Logic (Reads from LocalStorage) ---
  useEffect(() => {
    const checkTimer = () => {
      const storedExpiry = localStorage.getItem('wifi_expiry');
      const storedConnected = localStorage.getItem('wifi_connected');

      if (storedConnected === 'true' && storedExpiry) {
        const now = Date.now();
        const timeLeftMs = parseInt(storedExpiry, 10) - now;
        const timeLeftSec = Math.floor(timeLeftMs / 1000);

        if (timeLeftSec > 0) {
          setIsConnected(true);
          setWifiTime(timeLeftSec);
        } else {
          // Time Expired
          setIsConnected(false);
          setWifiTime(0);
          localStorage.removeItem('wifi_expiry');
          localStorage.removeItem('wifi_connected');
        }
      } else {
        setIsConnected(false);
        setWifiTime(0);
      }
    };

    // Run immediately on mount
    checkTimer();

    // Start interval loop
    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
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

    fetchWeather();
  }, []);

  const formatTime = (seconds: number) => {
    if (!isConnected || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
        <StationStatus
        onBatteryUpdate={handleBatteryUpdate}
        onPortStatusUpdate={handlePortStatusUpdate}
        />

      {/* WIFI REMAINING TIME (Updated) */}
      <div className="wifi-container">
        <div className="wifi-time" style={{ color: isConnected ? '#998A64' : '#6F1D1B' }}>
            {isConnected ? formatTime(wifiTime) : "Offline"}
        </div>
        <div className="wifi-text">
          <span className="wifi-bold">Wi-Fi Status</span>
          <br />
          <span className="wifi-subtext">
             {isConnected ? "Remaining Time" : "Connect to Station"}
          </span>
        </div>
      </div>

      <div className="line-separator"></div>

      {/* AVAILABLE PORTS */}
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


      {/* BATTERY + WEATHER ROW */}
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
        {/* BATTERY */}
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
                    strokeColor: "#FFFFFF",   // outline color
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
                    fill: "#FFFFFF",          // inner fill color
                    lowBatteryFill: "#FFFFFF",
                    noOfCells: 1,
                  },
                  readingText: {
                    lightContrastColor: "#FFFFFF",
                    darkContrastColor: "#FFFFFF",
                    fontSize: 0, // hide built-in percentage text since you use your own
                  },
                }}
              />

              <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                {batteryPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* WEATHER */}
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
                    {Math.round(weather.temp)}°C
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

      {/* ANNOUNCEMENTS */}
      <div style={{ marginTop: "12.67px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 className="port-title">Announcements</h3>
        <Announcements />
      </div>
    </div>
  );
}

/* --- Helper Component --- */
const PortItem = ({ name, status }: { name: string; status: string }) => (
  <div className="port-item">
    <div className="port-item-text" data-status={status}>
      <span className="port-name">{name}</span>
      <span className="port-status">{status}</span>
    </div>
    <div className="port-line"></div>
  </div>
);

/* --- Announcements (Website Preview) --- */
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
      {/* PREVIEW IMAGE */}
      <div
        style={{
          width: "100%",
          height: "165px",
          background: "url('/announcements/preview.png') center/cover no-repeat",
          borderRadius: "10px",
          marginBottom: "10px",
        }}
      ></div>

      {/* TITLE + SUBTEXT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>
          Polytechnic University of the Philippines
        </span>
        <span style={{ fontSize: "12px", opacity: 0.8 }}>
          Click to visit website →
        </span>
      </div>
    </a>
  );
};
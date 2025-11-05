"use client";

import React, { useState, useEffect } from "react";
import BatteryGauge from "react-battery-gauge"; // npm install react-battery-gauge

export default function Dashboard() {
  const [wifiTime, setWifiTime] = useState(59 * 60 + 45);
  const [batteryPercentage, setBatteryPercentage] = useState(60);
  const [isCharging, setIsCharging] = useState(true);
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Wi-Fi countdown
  useEffect(() => {
    if (wifiTime <= 0) return;
    const timer = setInterval(() => setWifiTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [wifiTime]);

  // Battery simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCharging) return;
      setBatteryPercentage((prev) => {
        const change = Math.floor(Math.random() * 3) - 1;
        let next = prev + change;
        if (next > 100) next = 100;
        if (next < 0) next = 0;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isCharging]);

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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* WIFI REMAINING TIME */}
      <div className="wifi-container">
        <div className="wifi-time">{formatTime(wifiTime)}</div>
        <div className="wifi-text">
          <span className="wifi-bold">Wi-Fi</span>
          <br />
          <span className="wifi-subtext">Remaining Time</span>
        </div>
      </div>

      <div className="line-separator"></div>

      {/* AVAILABLE PORTS */}
      <div className="port-container">
        <h3 className="port-title">Available Ports</h3>
        <div className="port-list-container">
          <div className="port-left-items">
            <PortItem name="USB-A 1" status="Unavailable" />
            <PortItem name="USB-A 2" status="Available" />
            <PortItem name="Outlet" status="Available" />
          </div>
          <div className="port-right-items">
            <PortItem name="USB-C 1" status="Available" />
            <PortItem name="USB-C 2" status="Unavailable" />
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
              <BatteryGauge value={batteryPercentage} size={60} />
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

/* --- Announcements --- */
const Announcements = () => {
  const announcements = [
    {
      text: "Clarification on the List of All Applicants First and Second...",
      date: "Posted: May 28, 2025",
    },
    {
      text: "Public Advisory: Protecting the Integrity of the Admission Process",
      date: "Posted: May 02, 2025",
    },
    {
      text: "Important Announcement For Our Mid-Year Graduates",
      date: "Posted: April 07, 2025",
    },
  ];

  return (
    <div
      className="rounded-lg bg-white p-4 text-gray-900 shadow-inner overflow-y-auto"
      style={{ marginTop: "10.33px", height: "240px", borderRadius: "21.333px" }}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div>
          <h3 className="mb-2 font-bold text-red-700">Announcements and Advisories</h3>
          <div className="space-y-3">
            {announcements.map((item, i) => (
              <div key={i}>
                <a href="#" className="text-sm font-medium text-blue-800 hover:underline">
                  {item.text}
                </a>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 className="mb-2 font-bold text-gray-700">Latest News from the University</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <img
              src="https://placehold.co/600x400/e2e8f0/333333?text=University+Event"
              alt="University event"
              className="h-auto w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/e2e8f0/333333?text=Image+Not+Found";
              }}
            />
            <p className="p-2 text-xs text-gray-600">
              CHK champions inclusivity: organized seminar empowering visually impaired youth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

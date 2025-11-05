"use client";

import React, { useState, useEffect } from "react";
import BatteryGauge from "react-battery-gauge"; // npm install react-battery-gauge

export default function Dashboard() {
  // --- State Logic from new code ---
  const [wifiTime, setWifiTime] = useState(59 * 60 + 45); // 59:45 initial
  const [batteryPercentage, setBatteryPercentage] = useState(60);
  const [isCharging, setIsCharging] = useState(true);

  // Wi-Fi countdown effect
  useEffect(() => {
    if (wifiTime <= 0) return;
    const timer = setInterval(() => {
      setWifiTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [wifiTime]);

  // Battery simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCharging) return;
      setBatteryPercentage((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
        let next = prev + change;
        if (next > 100) next = 100;
        if (next < 0) next = 0;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isCharging]);

  // Helper: format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* WIFI REMAINING TIME SECTION */}
      <div className="wifi-container">
        <div className="wifi-time">{formatTime(wifiTime)}</div>
        <div className="wifi-text">
          <span className="wifi-bold">Wi-Fi</span>
          <br />
          <span className="wifi-subtext">Remaining Time</span>
        </div>
      </div>

      <div className="line-separator"></div>

      {/* AVAILABLE PORTS SECTION */}
      <div className="port-container">
        <h3 className="port-title">Available Ports</h3>
        <div className="port-list-container">
          {/* LEFT PORT LIST */}
          <div className="port-left-items">
            <div className="port-item">
              <div className="port-item-text" data-status="Unavailable">
                <span className="port-name">USB-A 1</span>
                <span className="port-status">Unavailable</span>
              </div>
              <div className="port-line"></div>
            </div>
            <div className="port-item">
              <div className="port-item-text" data-status="Available">
                <span className="port-name">USB-A 2</span>
                <span className="port-status">Available</span>
              </div>
              <div className="port-line"></div>
            </div>
            <div className="port-item">
              <div className="port-item-text" data-status="Available">
                <span className="port-name">Outlet</span>
                <span className="port-status">Available</span>
              </div>
              <div className="port-line"></div>
            </div>
          </div>

          {/* RIGHT PORT LIST */}
          <div className="port-right-items">
            <div className="port-item">
              <div className="port-item-text" data-status="Available">
                <span className="port-name">USB-C 1</span>
                <span className="port-status">Available</span>
              </div>
              <div className="port-line"></div>
            </div>
            <div className="port-item">
              <div className="port-item-text" data-status="Unavailable">
                <span className="port-name">USB-C 2</span>
                <span className="port-status">Unavailable</span>
              </div>
              <div className="port-line"></div>
            </div>
          </div>
        </div>
      </div>

      {/* LINE SEPARATOR */}
      <div className="line-separator"></div>

      {/* BATTERY STATUS SECTION */}
      <div
        style={{
          marginTop: "20px",
          padding: "13.33px",
          borderRadius: "10.667px",
          background: "#1E120B",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="port-title">Battery Percentage</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <BatteryGauge value={batteryPercentage} size={60} />
            <span
              style={{
                color: "#F1E8E8",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {batteryPercentage}%
            </span>
          </div>
        </div>

      </div>

      {/* WEATHER SECTION (placeholder for API) */}
      <div
        style={{
          marginTop: "20px",
          padding: "13.33px",
          borderRadius: "10.667px",
          background: "#321E12",
          color: "#F1E8E8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 className="port-title">Weather</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>21°</span>
          <span>Sunny ☀️</span>
        </div>
      </div>

      {/* ANNOUNCEMENTS SECTION */}
      <div style={{ marginTop: "30px" }}>
        <Announcements />
      </div>
    </div>
  );
}

/**
 * Announcements Card
 */
const Announcements = () => {
  // Mock data for announcements
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
    <div className="rounded-lg bg-black/30 p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-bold text-neutral-200">Announcements</h2>
      <div className="rounded-lg bg-white p-4 text-gray-900 shadow-inner">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column: Text */}
          <div>
            <h3 className="mb-2 font-bold text-red-700">
              Announcements and Advisories
            </h3>
            <div className="space-y-3">
              {announcements.map((item, i) => (
                <div key={i}>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-800 hover:underline"
                  >
                    {item.text}
                  </a>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right Column: Image */}
          <div>
            <h3 className="mb-2 font-bold text-gray-700">
              Latest News from the University
            </h3>
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
                CHK champions inclusivity: organized seminar empowering visually
                impaired youth
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

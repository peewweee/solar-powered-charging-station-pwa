"use client";

import React, { useState, useEffect, Suspense } from "react";
// Removed external imports to fix build errors
// import BatteryGauge from "react-battery-gauge"; 
// import StationStatus from '../components/StationStatus';

// --- MOCK COMPONENTS (To replace missing dependencies) ---

const BatteryGauge = ({ value, size }: { value: number, size: number, customization?: any }) => {
  // Simple SVG Battery Gauge Mock
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#444" strokeWidth="10" />
        <path
          fill="none"
          stroke="#FFF"
          strokeWidth="10"
          strokeLinecap="round"
          d={`M 50, 5 a 45,45 0 0 1 0,90 a 45,45 0 0 1 0,-90`}
          strokeDasharray={`${value * 2.8}, 283`} // Approx circumference
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div style={{ position: 'absolute', fontSize: size * 0.25, color: 'white', fontWeight: 'bold' }}>
        {/* Text is handled by parent in original code, but we keep structure valid */}
      </div>
    </div>
  );
};

const StationStatus = ({ onBatteryUpdate, onPortStatusUpdate }: { onBatteryUpdate: (val: number) => void, onPortStatusUpdate: (val: any) => void }) => {
  // Mock StationStatus to simulate data updates
  useEffect(() => {
    // Simulate getting data from the station
    const interval = setInterval(() => {
      onBatteryUpdate(Math.floor(Math.random() * (100 - 80 + 1) + 80)); // Random battery 80-100
      onPortStatusUpdate({
        port1: 'active', port2: 'inactive', port3: 'inactive', port4: 'active', outlet: 'inactive'
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return <div style={{ display: 'none' }}></div>; // Hidden controller
};

// --- MAIN CONTENT COMPONENT ---

function DashboardContent() {
  // --- Wi-Fi Timer State ---
  const [wifiTime, setWifiTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // --- Existing Dashboard State ---
  const [batteryPercentage, setBatteryPercentage] = useState(60);
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [portStatus, setPortStatus] = useState({
    port1: 'inactive', port2: 'inactive', port3: 'inactive', port4: 'inactive', outlet: 'inactive', 
  });

  const handleBatteryUpdate = (percent: number) => setBatteryPercentage(percent);
  const handlePortStatusUpdate = (ports: any) => setPortStatus(ports);

  // --- TIMER LOGIC (Reads from LocalStorage) ---
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

    checkTimer(); // Run immediately
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Fetch Weather (MOCKED) ---
  useEffect(() => {
    async function fetchWeather() {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setWeather({ temp: 29, desc: "Sunny", icon: "01d" });
      } catch (error) { 
        console.error("Error fetching weather:", error); 
        setWeather({ temp: 30, desc: "Sunny", icon: "01d" });
      } 
      finally { setLoadingWeather(false); }
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
        <StationStatus onBatteryUpdate={handleBatteryUpdate} onPortStatusUpdate={handlePortStatusUpdate} />

      {/* WIFI REMAINING TIME */}
      <div className="wifi-container">
        <div className="wifi-time" style={{ color: isConnected ? '#2E7D32' : '#d32f2f' }}>
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
            <PortItem name="USB-A 1" status={portStatus.port1 === "active" ? "Unavailable" : "Available"} />
            <PortItem name="USB-A 2" status={portStatus.port2 === "active" ? "Unavailable" : "Available"} />
            <PortItem name="Outlet" status={portStatus.outlet === "active" ? "Unavailable" : "Available"} />
          </div>
          <div className="port-right-items">
            <PortItem name="USB-C 1" status={portStatus.port3 === "active" ? "Unavailable" : "Available"} />
            <PortItem name="USB-C 2" status={portStatus.port4 === "active" ? "Unavailable" : "Available"} />
          </div>
        </div>
      </div>

      {/* BATTERY + WEATHER */}
      <div style={{ marginTop: "13px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "nowrap" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <h3 className="port-title">Battery Percentage</h3>
          <div style={{ marginTop: "10px", background: "rgba(67, 17, 16, 0.3)", height: "53.33px", borderRadius: "10.667px", padding: "13px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#F1E8E8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <BatteryGauge value={batteryPercentage} size={60} customization={{ batteryBody: { strokeColor: "#FFFFFF", strokeWidth: 3, fill: "transparent", cornerRadius: 4 }, batteryCap: { fill: "transparent", strokeColor: "#FFFFFF", strokeWidth: 3, cornerRadius: 2 }, batteryMeter: { fill: "#FFFFFF", lowBatteryFill: "#FFFFFF", noOfCells: 1 }, readingText: { lightContrastColor: "#FFFFFF", darkContrastColor: "#FFFFFF", fontSize: 0 } }} />
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>{batteryPercentage}%</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <h3 className="port-title">Weather</h3>
          <div style={{ marginTop: "10px", background: "rgba(67, 17, 16, 0.3)", height: "53.33px", borderRadius: "10.667px", padding: "13px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#F1E8E8" }}>
            {loadingWeather ? (<span style={{ fontSize: "16px" }}>Loading...</span>) : weather ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "400" }}>{Math.round(weather.temp)}°C</span>
                <span style={{ fontSize: "12px" }}>{weather.desc}</span>
                <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.desc} width={32} height={32} />
              </div>
            ) : (<span style={{ fontSize: "16px" }}>Weather unavailable</span>)}
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

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="dashboard-container" style={{padding: '20px', textAlign: 'center', color: '#6F1D1B'}}>Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
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
    <a href="https://www.pup.edu.ph/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", background: "rgba(67, 17, 16, 0.35)", borderRadius: "12px", padding: "12px", width: "100%", height: "240px", textDecoration: "none", color: "#F1E8E8", overflow: "hidden", cursor: "pointer", transition: "0.2s", marginBottom: "40px" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(67, 17, 16, 0.5)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(67, 17, 16, 0.35)")}>
      <div style={{ width: "100%", height: "165px", background: "url('/announcements/preview.png') center/cover no-repeat", borderRadius: "10px", marginBottom: "10px" }}></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: "600" }}>Polytechnic University of the Philippines</span>
        <span style={{ fontSize: "12px", opacity: 0.8 }}>Click to visit website →</span>
      </div>
    </a>
  );
};
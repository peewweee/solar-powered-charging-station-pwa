"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// The IP Address of your ESP32 SoftAP Gateway
const ESP_GATEWAY_URL = "http://192.168.4.1/api/status";

// --- SUB-COMPONENT: HANDLES LOGIC & SEARCH PARAMS ---
function StatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This is safe now because it's inside Suspense

  // State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // --- THE HEARTBEAT LOGIC ---
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(ESP_GATEWAY_URL, { 
        signal: controller.signal,
        mode: 'cors', 
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setTimeLeft(data.remaining_seconds);
        setIsConnected(true);
      } else {
        throw new Error("ESP32 API Error");
      }
    } catch (error) {
      setIsConnected(false);
      setTimeLeft(0);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard"); 
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* DYNAMIC STATUS CARD */}
      <div style={{ 
        backgroundColor: isConnected ? "#E6F4EA" : "#FCE8E6", 
        padding: "20px", 
        borderRadius: "12px",
        margin: "20px auto",
        maxWidth: "400px",
        border: `1px solid ${isConnected ? "#1D734B" : "#C5221F"}`
      }}>
        {loading ? (
          <p>Connecting to Station...</p>
        ) : isConnected ? (
          <>
            <h2 style={{ fontSize: "3rem", margin: "10px 0", fontWeight: "bold", color: "#1D734B" }}>
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </h2>
            <p style={{ color: "#1D734B", fontWeight: "bold" }}>CONNECTED</p>
            <p style={{ fontSize: "0.8rem" }}>Time Remaining</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.5rem", margin: "10px 0", color: "#C5221F" }}>
              OFFLINE
            </h2>
            <p style={{ color: "#C5221F" }}>
              Please connect to "CPE Wi-Fi" to view your timer.
            </p>
          </>
        )}
      </div>

      <button 
        className="dashboard-button" 
        onClick={goToDashboard}
        disabled={!isConnected}
        style={{
          opacity: isConnected ? 1 : 0.5,
          cursor: isConnected ? "pointer" : "not-allowed",
          padding: "12px 24px",
          backgroundColor: "#1D734B",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem"
        }}
      >
        Go to Dashboard
      </button>
    </>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  return (
    <div className="page-container" style={{ textAlign: "center", padding: "2rem" }}>
      
      {/* HEADER SECTION */}
      <h3 className="title-text" style={{ color: "#6F1D1B", fontSize: "1.5rem", fontWeight: "bold" }}>
        Solar-Powered Charging Station
      </h3>
      
      <p className="description-text" style={{ color: "#521B1B", margin: "1rem 0" }}>
        The solar-powered charging station provides free device charging and Wi-Fi access.
      </p>

      {/* WRAP DYNAMIC CONTENT IN SUSPENSE */}
      <Suspense fallback={<p>Loading System...</p>}>
        <StatusContent />
      </Suspense>

      {/* FOOTER */}
      <div className="info-container" style={{ marginTop: "40px", fontSize: "0.8rem", color: "#666" }}>
        <p>
          This application is part of the thesis project ‘Integrating Renewable Energy Solutions in PUP-CEA’.
        </p>
      </div>
    </div>
  );
}
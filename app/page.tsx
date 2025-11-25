"use client";

import React, { useEffect } from "react";

export default function Home() {
  // --- LOGIC: Capture Timer Data from ESP32 URL ---
  useEffect(() => {
    // 1. Check if ESP32 sent us timer parameters
    const params = new URLSearchParams(window.location.search);
    const paramsSeconds = params.get('seconds');
    const paramsConnected = params.get('connected');

    if (paramsSeconds && paramsConnected === 'true') {
      const secondsToAdd = parseInt(paramsSeconds, 10);
      
      // 2. Calculate when the session expires (Now + 60s)
      const expiryTime = Date.now() + (secondsToAdd * 1000);
      
      // 3. Save to LocalStorage (The Dashboard page will read this)
      localStorage.setItem('wifi_expiry', expiryTime.toString());
      localStorage.setItem('wifi_connected', 'true');

      // 4. Clean the URL so the user doesn't see the ugly parameters
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const goToDashboard = () => {
    // Use standard browser navigation
    window.location.href = "/dashboard"; 
  };

  return (
    <div className="page-container">
      <h3 className="title-text">
        Solar-Powered Charging Station
      </h3>
      <p className="description-text">
        The solar-powered charging station provides free device charging and Wi-Fi access, promoting sustainability, connectivity, and academic productivity
      </p>
      
      <button className="dashboard-button" onClick={goToDashboard}>
        Go to Dashboard
      </button>

      {/* New Content Container */}
      <div className="info-container">
        <p className="info-text">
          This application is part of the thesis project ‘Integrating Renewable Energy Solutions in PUP-CEA: Solar-Powered Charging Station Offering Connectivity’, developed by 4th Year Computer Engineering students of the Polytechnic University of the Philippines.
        </p>
      </div>
    </div>
  );
}
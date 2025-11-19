'use client';

import { useState, useEffect } from 'react';

// Fetch from your own Next.js API route
const API_URL = '/api/status';

export default function StationStatus({ onBatteryUpdate, onPortStatusUpdate }) {

  useEffect(() => {
    const fetchData = () => {
      fetch(API_URL)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errData) => {
              throw new Error(errData.error || 'Network error');
            });
          }
          return res.json();
        })
        .then((jsonData) => {
          // 🔋 Send battery % to page
          if (jsonData?.batteryPercent !== undefined && onBatteryUpdate) {
            onBatteryUpdate(jsonData.batteryPercent);
          }

          // 🔌 Send ALL ports to page
          if (jsonData?.ports && onPortStatusUpdate) {
            onPortStatusUpdate({
              port1: jsonData.ports.port1,
              port2: jsonData.ports.port2,
              port3: jsonData.ports.port3,
              port4: jsonData.ports.port4,
              outlet: jsonData.ports.outlet,
            });
          }
        })
        .catch(() => {})
    };

    fetchData(); // initial fetch
    const intervalId = setInterval(fetchData, 1000); // poll every 1s

    return () => clearInterval(intervalId);
  }, [onBatteryUpdate, onPortStatusUpdate]);

  // ⛔ Render nothing — UI fully hidden
  return null;
}

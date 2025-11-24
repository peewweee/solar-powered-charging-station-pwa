'use client';

import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
// Make sure this path points to the file you created in the previous step
import { database } from '../firebaseConfig'; 

export default function StationStatus({ onBatteryUpdate, onPortStatusUpdate }) {

  useEffect(() => {
    // 1. Connect to the exact path your ESP32 is writing to
    // In your Arduino code: Firebase.RTDB.setJSON(&fbdo, "/station_status", &json)
    const stationRef = ref(database, 'station_status');

    // 2. Start the Real-Time Listener
    // This function runs automatically whenever the ESP32 updates the cloud
    const unsubscribe = onValue(stationRef, (snapshot) => {
      const data = snapshot.val();

      // Safety check: Ensure data exists before trying to read it
      if (data) {
        
        // 🔋 Update Battery
        if (data.batteryPercent !== undefined && onBatteryUpdate) {
          onBatteryUpdate(data.batteryPercent);
        }

        // 🔌 Update Ports
        // Your ESP32 sends: { port1: "active", port2: "inactive", ... }
        // This matches exactly what the Dashboard expects.
        if (data.ports && onPortStatusUpdate) {
          onPortStatusUpdate(data.ports);
        }
      }
    }, (error) => {
      console.error("Firebase connection error:", error);
    });

    // 3. Cleanup: Close the connection when the user leaves the page
    return () => unsubscribe();
  }, [onBatteryUpdate, onPortStatusUpdate]);

  // ⛔ Component is invisible
  return null;
}
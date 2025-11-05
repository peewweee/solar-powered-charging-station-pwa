'use client'
import React, { useState, useEffect } from 'react';
import BatteryGauge from 'react-battery-gauge'; // <-- ADDED THIS IMPORT

// --- Re-usable UI Components ---

/**
 * Inline SVG for the Sun icon
 */
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-yellow-300 sm:h-10 sm:w-10"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

/**
 * A single item in the port list
 */
const PortItem = ({ name, available }: { name: string; available: boolean }) => (
  <div className="flex justify-between border-b border-white/20 py-2">
    <span className="text-neutral-300">{name}</span>
    <span
      className={`font-medium ${
        available ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {available ? 'Available' : 'Unavailable'}
    </span>
  </div>
);

// --- REMOVED commented-out SimpleBatteryGauge component ---

// --- Dashboard Section Components ---

/**
 * Wi-Fi Timer Card
 */
const WifiTimer = ({ time }: { time: string }) => (
  <div className="mb-6 rounded-lg bg-black/30 p-4 sm:p-6">
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-5xl font-bold text-amber-300 sm:text-7xl">
        {time}
      </span>
      <span className="text-right text-lg text-neutral-300 sm:text-xl">
        Wi-Fi
        <br />
        Remaining Time
      </span>
    </div>
  </div>
);

/**
 * Available Ports Card
 */
const AvailablePorts = () => {
  // Mock data based on the image
  const portsLeft = [
    { name: 'USB-A 1', available: false },
    { name: 'USB-A 1', available: true },
    { name: 'Outlet', available: true },
  ];
  const portsRight = [
    { name: 'USB-C 1', available: true },
    { name: 'USB-C 2', available: false },
  ];

  return (
    <div className="mb-6 rounded-lg bg-black/30 p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-bold text-neutral-200">
        Available Ports
      </h2>
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <div>
          {portsLeft.map((port, i) => (
            <PortItem key={i} {...port} />
          ))}
        </div>
        <div>
          {portsRight.map((port, i) => (
            <PortItem key={i} {...port} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Battery Status Card
 */
// --- REPLACED with the new component using react-battery-gauge ---
const BatteryStatus = ({
  percentage,
  isCharging,
  setIsCharging,
}: {
  percentage: number;
  isCharging: boolean;
  setIsCharging: (val: boolean) => void;
}) => (
  <div className="rounded-lg bg-black/30 p-4 sm:p-6">
    <h2 className="mb-4 text-lg font-bold text-neutral-200 sm:text-xl">
      Battery Percentage
    </h2>
    <div className="flex items-center justify-between space-x-4">
      {/* Use the new BatteryGauge component */}
      <BatteryGauge
        value={percentage}
        charging={isCharging}
        size={150} // The default is 300, adjust this size as needed
      />
      <span className="text-3xl font-bold text-white">
        {percentage}%
      </span>
    </div>
  </div>
);

/**
 * Weather Info Card
 */
const WeatherInfo = () => (
  <div className="rounded-lg bg-black/30 p-4 sm:p-6">
    <h2 className="mb-4 text-lg font-bold text-neutral-200 sm:text-xl">
      Weather
    </h2>
    <div className="flex items-center justify-between space-x-2">
      <span className="font-mono text-4xl font-bold text-amber-300 sm:text-5xl">
        21°
      </span>
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:space-x-2">
        <span className="text-lg font-medium text-neutral-200 sm:text-xl">
          Sunny
        </span>
        <SunIcon />
      </div>
    </div>
  </div>
);

/**
 * Announcements Card
 */
const Announcements = () => {
  // Mock data for announcements
  const announcements = [
    {
      text: 'Clarification on the List of All Applicants First and Second...',
      date: 'Posted: May 28, 2025',
    },
    {
      text: 'Public Advisory: Protecting the Integrity of the Admission Process',
      date: 'Posted: May 02, 2025',
    },
    {
      text: 'Important Announcement For Our Mid-Year Graduates',
      date: 'Posted: April 07, 2025',
    },
  ];

  return (
    <div className="rounded-lg bg-black/30 p-4 sm:p-6">
      <h2 className="mb-4 text-2xl font-bold text-neutral-200">
        Announcements
      </h2>
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
              {/* Using a placeholder image service to mock the news image */}
              <img
                src="https://placehold.co/600x400/e2e8f0/333333?text=University+Event"
                alt="University event"
                className="h-auto w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400/e2e8f0/333333?text=Image+Not+Found';
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

// --- Main Dashboard Page Component ---

export default function DashboardPage() {
  // State for the Wi-Fi countdown timer (59:45 in seconds)
  const [wifiTime, setWifiTime] = useState(59 * 60 + 45);
  // State for the battery percentage
  const [batteryPercentage, setBatteryPercentage] = useState(60);
  // State for the charging toggle
  const [isCharging, setIsCharging] = useState(true);

  // Effect for the Wi-Fi countdown timer
  useEffect(() => {
    if (wifiTime <= 0) return; // Stop timer at 0

    const timer = setInterval(() => {
      setWifiTime((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [wifiTime]);

  // Effect to simulate real-time battery percentage fluctuation
  useEffect(() => {
    const batterySimulator = setInterval(() => {
      setBatteryPercentage((prevPercent) => {
        // Only fluctuate if "charging" is on
        if (!isCharging) return prevPercent;
        
        // Randomly change by -1, 0, or +1
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        let newPercent = prevPercent + change;

        // Clamp values between 0 and 100
        if (newPercent > 100) newPercent = 100;
        if (newPercent < 0) newPercent = 0;
        
        return newPercent;
      });
    }, 3000); // Update every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(batterySimulator);
  }, [isCharging]); // Re-run effect if isCharging changes

  /**
   * Helper function to format seconds into MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    // Main container with the same background as the landing page
    <main className="relative min-h-screen w-full overflow-x-hidden bg-linear-to-br from-[#2a1a0c] via-[#4f2f0f] to-[#201509] text-white font-sans">
      {/* Background dot-grid pattern */}
      <div
        className="absolute inset-0 w-full h-full bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [bg-size:16px_16px]"
        aria-hidden="true"
      />
      {/* Fades the dot-grid at the edges */}
      <div
        className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_0%,#2a1a0c_80%)]"
        aria-hidden="true"
      />

      {/* Content wrapper */}
      <div className="relative z-10 mx-auto max-w-4xl p-4 py-8 sm:p-8">
        {/* Page Title */}
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
          Dashboard
        </h1>

        {/* Wi-Fi Timer */}
        <WifiTimer time={formatTime(wifiTime)} />

        {/* Available Ports */}
        <AvailablePorts />

        {/* Battery & Weather Row */}
        <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <BatteryStatus
            percentage={batteryPercentage}
            isCharging={isCharging}
            setIsCharging={setIsCharging}
          />
          <WeatherInfo />
        </div>

        {/* Announcements */}
        <Announcements />
      </div>
    </main>
  );
}
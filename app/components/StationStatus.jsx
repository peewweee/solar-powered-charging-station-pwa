'use client'; 

import { useState, useEffect } from 'react';

// Fetch from your own Next.js API route
const API_URL = '/api/status';

export default function StationStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect now runs ONLY ONCE when the component mounts
  useEffect(() => {
    
    const fetchData = () => {
      // Don't show loading spinner on background polls
      // (This logic is now handled by the initial isLoading state)
      
      fetch(API_URL)
        .then((res) => {
          if (!res.ok) {
            return res.json().then(errData => {
              throw new Error(errData.error || 'Network error');
            });
          }
          return res.json();
        })
        .then((jsonData) => {
          setData(jsonData);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
          setData(null);
        })
        .finally(() => {
          // Only set loading to false on the first load
          if (isLoading) setIsLoading(false);
        });
    };

    fetchData(); // 1. Fetches data immediately on load
    
    // 2. Sets up an interval to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 1000); 

    // 3. This cleanup function runs when the component is unmounted
    return () => clearInterval(intervalId);

  }, [isLoading]); // <-- THE FIX: Use an empty array []
  // We add 'isLoading' to satisfy the linter, but it won't cause a loop
  // You can also just use an empty array: }, []);

  // --- Added Tailwind classes for visibility ---
  if (isLoading) return <div className="text-gray-300">Loading station status...</div>;
  if (error) return <div className="text-red-400">Failed to load data: {error}</div>;
  if (!data) return <div className="text-gray-500">No data available.</div>;

  // Render the data
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-sm">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">
        Charging Station Status
      </h2>
      
      <div className="mb-4">
        <span className="text-sm text-gray-400 uppercase">Battery Level</span>
        <p className="text-4xl font-bold text-green-400">
          {data.batteryPercent}%
        </p>
      </div>

      <div>
        <h3 className="text-sm text-gray-400 uppercase mb-2">Ports</h3>
        <ul className="space-y-2">
          <li className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
            <span>Port 1:</span>
            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
              data.ports.port1 === 'active' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-gray-200'
            }`}>
              {data.ports.port1}
            </span>
          </li>
          <li className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
            <span>Port 2:</span>
            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
              data.ports.port2 === 'active' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-gray-200'
            }`}>
              {data.ports.port2}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
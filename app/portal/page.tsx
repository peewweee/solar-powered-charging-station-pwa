"use client";

import { useState } from "react";

export default function PortalRecoveryPage() {
  const [showManualSteps, setShowManualSteps] = useState(false);

  const showConnectSteps = () => {
    setShowManualSteps(true);
  };

  const openPortal = () => {
    window.location.href = "http://192.168.4.1/";
  };

  const goBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={goBackToDashboard}
          className="back-btn"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(23, 14, 8, 0.55);
          border: 1px solid rgba(241, 232, 232, 0.18);
          color: rgba(241, 232, 232, 0.75);
          padding: 8px 14px 8px 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
          letter-spacing: 0.01em;
          line-height: 1;
        }
        .back-btn:hover {
          color: #F1E8E8;
          background: rgba(40, 25, 15, 0.7);
          border-color: rgba(241, 232, 232, 0.32);
          transform: translateX(-2px);
        }
        .back-btn:active {
          transform: translateX(-1px);
          background: rgba(50, 30, 18, 0.75);
        }
      `}</style>

      <h3 className="title-text">Connect to 'SOLAR CONNECT'</h3>
      <p className="description-text">You are not connected to the station's Wi-Fi network.</p>

        <div className="info-container">
          <p className="info-text">
            Open your phone&apos;s Wi-Fi settings and connect to &apos;SOLAR CONNECT&apos; manually.
            Follow the on-screen instructions to complete the connection.
          </p>
        </div>
    </div>
  );
}
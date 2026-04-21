"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLinkClient from "./components/DashboardLinkClient";

function LandingPage() {
  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="page-container">
      <h3 className="title-text">Solar-Powered Charging Station</h3>
      <p className="description-text">
        The solar-powered charging station provides free device charging and Wi-Fi access,
        promoting sustainability, connectivity, and academic productivity
      </p>

      <button className="dashboard-button" onClick={goToDashboard}>
        Go to Dashboard
      </button>

      <div className="info-container">
        <p className="info-text">
          This application is part of the thesis project &lsquo;Integrating Renewable Energy
          Solutions in PUP-CEA: Solar-Powered Charging Station Offering Connectivity&rsquo;,
          developed by 4th Year Computer Engineering students of the Polytechnic University of
          the Philippines.
        </p>
      </div>
    </div>
  );
}

function RootRouteContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("session_token");

  if (sessionToken) {
    return <DashboardLinkClient />;
  }

  return <LandingPage />;
}

export default function Home() {
  return (
    <Suspense fallback={<LandingPage />}>
      <RootRouteContent />
    </Suspense>
  );
}

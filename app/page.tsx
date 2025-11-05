"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const goToDashboard = () => {
    router.push("/dashboard"); 
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

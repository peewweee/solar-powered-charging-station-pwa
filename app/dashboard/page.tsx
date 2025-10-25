"use client";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="wifi-container ">
        <div className="wifi-time">59:45</div>
        <div className="wifi-text">
            <span className="wifi-bold">Wi-Fi</span>
            <br />
            <span className="wifi-subtext">Remaining Time</span>
        </div>
      </div>
      <div className="line-separator"></div>
    </div>
  );
}

"use client";

export default function PortalRecoveryPage() {
  const openWifiSettings = () => {
    const userAgent = navigator.userAgent || "";

    if (/android/i.test(userAgent)) {
      window.location.href =
        "intent://settings/panel/internet#Intent;scheme=android-app;package=com.android.settings;end";
      return;
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      window.location.href = "App-Prefs:root=WIFI";
      return;
    }

    window.location.href = "http://192.168.4.1/";
  };

  const goBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="page-container">
      <h3 className="title-text">Solar-Powered Charging Station</h3>
      <p className="description-text">You are not connected to 'SOLAR CONNECT'.</p>

      <button className="dashboard-button" onClick={openWifiSettings}>
        Connect to 'SOLAR CONNECT'
      </button>

      <button
        className="dashboard-button"
        onClick={goBackToDashboard}
        style={{ marginTop: "16px", background: "#321E12", color: "#F1E8E8" }}
      >
        Back to Dashboard
      </button>

      <div className="info-container">
        <p className="info-text">
          This button opens your device Wi-Fi settings when possible. If settings do not open
          automatically, connect to 'SOLAR CONNECT' manually, then open the portal again.
        </p>
      </div>
    </div>
  );
}

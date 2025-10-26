"use client";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

{/* WIFI REMAINING TIME SECTION */}
      <div className="wifi-container ">
        <div className="wifi-time">59:45</div>
        <div className="wifi-text">
            <span className="wifi-bold">Wi-Fi</span>
            <br />
            <span className="wifi-subtext">Remaining Time</span>
        </div>
      </div>

      <div className="line-separator"></div>

{/* AVAILABLE PORTS SECTION */}
      <div className="port-container">
        <h3 className="port-title">Available Ports</h3>
        <div className="port-list-container">

          {/* LEFT PORT LIST */}
            <div className="port-left-items">
              <div className="port-item">
                <div className="port-item-text">
                  <span className="port-name">USB-A 1</span>
                  <span className="port-status">Available</span>
                </div>
                <div className="port-line"></div>
              </div>
              <div className="port-item">
                <div className="port-item-text">
                  <span className="port-name">USB-A 2</span>
                  <span className="port-status">Available</span>
                </div>
                <div className="port-line"></div>
              </div>
              <div className="port-item">
                <div className="port-item-text">
                  <span className="port-name">Outlet</span>
                  <span className="port-status">Available</span>
                </div>
                <div className="port-line"></div>
              </div>
            </div>
            
          {/* RIGHT PORT LIST */}  
          <div className="port-right-items">
            <div className="port-item">
              <div className="port-item-text">
                <span className="port-name">USB-C 1</span>
                <span className="port-status">Available</span>
              </div>
              <div className="port-line"></div>
            </div>
            <div className="port-item">
              <div className="port-item-text">
                <span className="port-name">USB-C 2</span>
                <span className="port-status">Unavailable</span>
              </div>
              <div className="port-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

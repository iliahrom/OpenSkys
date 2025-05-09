import React, { useState } from "react";
import styles from "../styles/ControlPanel.module.css";
import ManageDrones from "./ManageDrones";
import ManageUsers from "./ManageUsers"; 

function ControlPanel() {
  // ✅ State to track which page is selected (users / drones)
  const [activePage, setActivePage] = useState("users");

  // ✅ Handlers to switch between pages
  const handlePageChange = (page) => {
    setActivePage(page);
  };

  return (
    <div className={styles.panelWrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h2 className={styles.panelTitle}>Control Panel - Admin</h2>
        <button
          className={`${activePage === "users" ? styles.active : ""}`}
          onClick={() => handlePageChange("users")}
        >
          Users Management
        </button>
        <button
          className={activePage === "drones" ? styles.active : ""}
          onClick={() => handlePageChange("drones")}
        >
          Drones Management
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activePage === "users" && <ManageUsers />}
        {activePage === "drones" && <ManageDrones />}
      </div>
    </div>
  );
}

export default ControlPanel;

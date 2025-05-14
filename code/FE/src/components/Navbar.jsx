import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Navbar.module.css"; // ✅ Import Navbar styles

const Navbar = ({ user, handleLogout }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSide}>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About us</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          {/* <li>
            <Link to="/flight-points">Flight Points</Link>
          </li> */}
        </ul>
      </div>

      <div className={styles.rightSide}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* ✅ New Profile Link */}
            <Link to="/profile" className={styles.profileLink}>
              Profile
            </Link>

            {user.role === "admin" && (
              <Link to="/control-panel" className={styles.controlPanelLink}>
                Control Panel
              </Link>
            )}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import styles from "../styles/About.module.css";

const images = [
  "/assets/drone1.jpg",
  "/assets/drone2.jpg",
  "/assets/drone3.jpg",
];

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.aboutWrapper}>
      <section className={styles.heroSection}>
        <h1 className={styles.mainTitle}>About OpenSkys</h1>
        <p className={styles.subtitle}>
          Advanced Drone Management & Flight Visualization Platform
        </p>
      </section>

      <section className={styles.missionSection}>
        <h2>Our Mission</h2>
        <p>
          OpenSkys bridges the gap between simulation and real-world drone
          operation. Our mission is to empower developers, pilots, and engineers
          with a clear, visual, and data-driven approach to drone navigation and
          control.
        </p>
      </section>

      <section className={styles.featuresSection}>
        <h2>Main Features</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <i className="fas fa-route"></i>
            <h3>Route Visualization</h3>
            <p>Define, simulate, and monitor drone paths in real time.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="fas fa-battery-half"></i>
            <h3>Live Telemetry</h3>
            <p>Track battery, altitude, and position updates instantly.</p>
          </div>
          <div className={styles.featureCard}>
            <i className="fas fa-user-shield"></i>
            <h3>Role-based Access</h3>
            <p>Admin and user dashboards for full control and safety.</p>
          </div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <h2>Developed by</h2>
        <div className={styles.teamCard}>
          <h3>Bar Pahima & Ilia Hromchenko</h3>
          <p>Software Engineers & Drone Enthusiasts</p>
        </div>
      </section>

      <section className={styles.gallerySection}>
        <h2>Gallery</h2>
        <div className={styles.galleryFrame}>
          <img
            src={images[currentImageIndex]}
            alt="Drone"
            className={styles.galleryImage}
          />
        </div>
      </section>
    </div>
  );
};

export default About;

import React, { useState, useEffect } from "react"; // ✅ Importing React and hooks
import styles from "../styles/About.module.css"; // ✅ Importing CSS module for styling

// ✅ Array of drone images used in the gallery section
const images = [
  "/assets/drone1.jpg",
  "/assets/drone2.jpg",
  "/assets/drone3.jpg",
];

const About = () => {
  // ✅ State to track the current image index in the gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ `useEffect` to automatically cycle through images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval); // ✅ Cleanup function to prevent memory leaks
  }, []);

  return (
    <div className={styles.aboutWrapper}>
      {" "}
      {/* ✅ Main wrapper for the about section */}
      <div className={styles.container}>
        {" "}
        {/* ✅ Container for all content */}
        <h1>About Us</h1>
        <p>
          {/* ✅ Brief introduction about the drone project */}
          Welcome to our drone project! Our goal is to provide an interactive
          platform that visualizes how drones fly from one point to another.
        </p>
        <h2>Our Mission</h2>
        <p>
          {/* ✅ Explanation of the project's purpose */}
          We strive to make drone technology accessible and easy to understand.
          Our project helps users explore various drone applications, flight
          paths, and real-time drone tracking.
        </p>
        <h2>Why Choose Us?</h2>
        {/* ✅ List of key features that make the project unique */}
        <ul>
          <li> Interactive visualizations of drone movements</li>
          <li> Real-time drone tracking capabilities</li>
          <li> Educational resources about different drone types</li>
          <li> User-friendly interface with a modern design</li>
        </ul>
        <h2>Meet the Team</h2>
        <div className={styles.teamContainer}>
          {" "}
          {/* ✅ Section for the team members */}
          <div className={styles.teamCard}>
            <img
              src="/assets/developer.jpg"
              alt="Developer"
              className={styles.teamImage}
            />
            <h3>Bar Pahima and Ilia Hromchenko</h3>
            <p>Softwares Engineeres & Drone Enthusiast</p>
          </div>
        </div>
        <h2>Gallery</h2>
        <div className={styles.gallery}>
          {" "}
          {/* ✅ Displays the changing drone images */}
          <img
            src={images[currentImageIndex]} // ✅ Cycles through the images every 3 seconds
            alt="Drone"
            className={styles.animatedImage}
            style={{ width: "30%", height: "auto" }} // ✅ Adjusts the image size dynamically
          />
        </div>
      </div>
    </div>
  );
};

export default About; // ✅ Exporting the About component to be used in the project

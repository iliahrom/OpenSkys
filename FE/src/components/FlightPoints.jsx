import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "../styles/flight.module.css";
import droneIcon from "../assets/drone.png";

const FlightPoints = () => {
  const [points, setPoints] = useState([]); // מגיע מה-DB
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [wifiList, setWifiList] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState("");
  const [lines, setLines] = useState([]);
  const pointRefs = useRef({});
  const droneRef = useRef(null);
  const containerRef = useRef(null);
  const baseRef = useRef(null);

  const handlePointClick = (pointName) => {
    setSelectedPoints((prev) =>
      prev.includes(pointName)
        ? prev.filter((p) => p !== pointName)
        : [...prev, pointName]
    );
  };

  const fetchPointsFromDB = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/points");
      setPoints(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch points from DB:", err);
    }
  };

  const fetchWifiNetworks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wifi");
      setWifiList(res.data.networks);
    } catch (err) {
      console.error("❌ Failed to fetch WiFi networks", err);
    }
  };

  const connectToWifi = async (ssid) => {
    try {
      await axios.post("http://localhost:5000/api/wifi/connect", { ssid });
      console.log("📶 Connected to", ssid);
    } catch (err) {
      console.error("❌ Failed to connect to WiFi", err);
    }
  };

  const sendToDrone = async () => {
    if (selectedPoints.length < 2) return;
    try {
      await axios.post("http://localhost:5000/api/flight", {
        path: selectedPoints,
      });
      animateFlight(selectedPoints);
    } catch (err) {
      console.error("❌ Failed sending to drone", err);
    }
  };

  const getXY = (el) => {
    const box = el.getBoundingClientRect();
    const containerBox = containerRef.current.getBoundingClientRect();
    return {
      x: box.left - containerBox.left + box.width / 2,
      y: box.top - containerBox.top + box.height / 2,
    };
  };

  const moveDrone = async (fromEl, toEl) => {
    const from = getXY(fromEl);
    const to = getXY(toEl);
    const drone = droneRef.current;
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = duration / frameRate;
    let frame = 0;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        drone.style.left = `${x - 30}px`;
        drone.style.top = `${y - 30}px`;
        if (frame >= totalFrames) {
          clearInterval(interval);
          setTimeout(resolve, 300);
        }
      }, frameRate);
    });
  };

  const animateFlight = async (pointNames) => {
    if (!droneRef.current || !containerRef.current || !baseRef.current) return;

    const drone = droneRef.current;
    const base = baseRef.current;
    const basePos = getXY(base);
    drone.style.left = `${basePos.x - 30}px`;
    drone.style.top = `${basePos.y - 30}px`;

    const flightLines = [];

    for (let i = 0; i < pointNames.length; i++) {
      const fromEl =
        i === 0 ? base : pointRefs.current[pointNames[i - 1]];
      const toEl = pointRefs.current[pointNames[i]];
      if (!fromEl || !toEl) continue;
      const from = getXY(fromEl);
      const to = getXY(toEl);
      flightLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
      await moveDrone(fromEl, toEl);
    }

    const lastEl = pointRefs.current[pointNames[pointNames.length - 1]];
    const lastPos = getXY(lastEl);
    flightLines.push({ x1: lastPos.x, y1: lastPos.y, x2: basePos.x, y2: basePos.y });
    await moveDrone(lastEl, base);

    setLines(flightLines);
    setTimeout(() => setLines([]), 5000);
  };

  useEffect(() => {
    fetchWifiNetworks();
    fetchPointsFromDB();
  }, []);

  useEffect(() => {
    console.log("📌 Points from DB:", points); // תוסיף את זה
  }, [points]);

  const handleWifiSelect = (e) => {
    const ssid = e.target.value;
    setSelectedWifi(ssid);
    connectToWifi(ssid);
  };

  const clearPoints = () => {
    setSelectedPoints([]);
    setLines([]);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <h1 className={styles.title}>Flight points</h1>
      <p className={styles.instructions}>
        Select multiple points to create a flight path.
      </p>

      <select onChange={handleWifiSelect} className={styles.selectDrone} value={selectedWifi}>
        <option disabled value="">Select a TELLO network</option>
        {wifiList.map((ssid, index) => (
          <option key={index} value={ssid}>{ssid}</option>
        ))}
      </select>

      <div className={styles.grid}>
        <button className={styles.base} ref={baseRef} id="Base">Base</button>

        {[0, 1, 2].map((rowVal) => (
          <div key={rowVal} className={styles.gridRow}>
            {points
              .filter((p) => p.row === rowVal)
              .sort((a, b) => a.col - b.col)
              .map((point) => (
                <button
                  key={point.id}
                  ref={(el) => (pointRefs.current[point.name] = el)}
                  className={`${styles.point} ${selectedPoints.includes(point.name) ? styles.start : ""}`}
                  onClick={() => handlePointClick(point.name)}
                >
                  {point.name}
                </button>
              ))}
          </div>
        ))}


        {lines.map((line, idx) => (
          <svg key={idx} className={styles.svgOverlay}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        ))}

        {selectedPoints.length > 0 && (
          <img
            src={droneIcon}
            alt="drone"
            ref={droneRef}
            className={styles.droneImage}
            style={{
              position: "absolute",
              width: "60px",
              height: "60px",
              left: 0,
              top: 0,
              zIndex: 1000,
            }}
          />
        )}
      </div>

      <div className={styles.controls}>
        <button onClick={sendToDrone}>Start Flight</button>
        <button onClick={clearPoints}>Clear Points</button>
      </div>
    </div>
  );
};












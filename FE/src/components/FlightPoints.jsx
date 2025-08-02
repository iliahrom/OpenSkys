import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../styles/flight.module.css";
import droneIcon from "../assets/drone.png";

const FlightPoints = ({ user }) => {
  const [points, setPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [wifiList, setWifiList] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState("");
  const [lines, setLines] = useState([]);
  const [pathName, setPathName] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [savedPaths, setSavedPaths] = useState([]);
  const [selectedSavedPathId, setSelectedSavedPathId] = useState(null);

  const pointRefs = useRef({});
  const droneRef = useRef(null);
  const containerRef = useRef(null);
  const baseRef = useRef(null);

  useEffect(() => {
    fetchWifiNetworks();
    fetchPointsFromDB();
    fetchSavedPaths();
  }, []);

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

  const fetchSavedPaths = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/paths");
      setSavedPaths(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch saved paths:", err);
    }
  };

  const handlePointClick = (pointName) => {
    setSelectedPoints((prev) =>
      prev.includes(pointName)
        ? prev.filter((p) => p !== pointName)
        : [...prev, pointName]
    );
  };

  const handleWifiSelect = (e) => {
    const ssid = e.target.value;
    setSelectedWifi(ssid);
    connectToWifi(ssid);
  };

  const getBatteryLevel = useCallback(async () => {
    try {
      const result = await axios.get(
        "http://localhost:5000/api/flight/battery"
      );
      return result.data.batteryLevel || "0";
    } catch (err) {
      console.error("❌ Failed to get battery level", err);
    }
  }, []);

  const connectToWifi = async (ssid) => {
    try {
      await axios.post("http://localhost:5000/api/wifi/connect", { ssid });
    } catch (err) {
      console.error("❌ Failed to connect to WiFi", err);
    }
  };

  const sendToDrone = async () => {
    if (selectedPoints.length < 2 || !user?.id) return;

    try {
      console.log("📤 Sending path to drone:", selectedPoints);

      await axios.post("http://localhost:5000/api/flight", {
        path: selectedPoints,
      });

      await axios.post("http://localhost:5000/api/flight/history/save", {
        user_id: user.id,
        path_name: pathName || "Unnamed Path",
        points: selectedPoints,
      });

      animateFlight(selectedPoints);
    } catch (err) {
      console.error("❌ Failed sending to drone or saving history", err);
    }
  };

  const savePathToDB = async () => {
    if (!pathName || selectedPoints.length < 2)
      return alert("Enter a path name and at least 2 points");
    try {
      await axios.post("http://localhost:5000/api/paths", {
        name: pathName,
        points: selectedPoints,
      });
      alert("✅ Path saved successfully!");
      setPathName("");
      fetchSavedPaths();
    } catch (err) {
      console.error("❌ Failed to save path:", err);
      alert("❌ Failed to save path");
    }
  };

  const loadSavedPath = async () => {
    if (!selectedSavedPathId) return alert("Select a path to load");
    const selected = savedPaths.find(
      (p) => p.id === parseInt(selectedSavedPathId)
    );
    if (selected) {
      const pointList = selected.points;
      setSelectedPoints(pointList);
      animateFlight(pointList);
    }
  };

  const clearPoints = () => {
    setSelectedPoints([]);
    setLines([]);
    setPathName("");
  };

  const getXY = (el) => {
    const box = el.getBoundingClientRect();
    const containerBox = containerRef.current.getBoundingClientRect();
    console.log("📍 getXY", {
      label: el?.innerText,
      box: el.getBoundingClientRect(),
      container: containerRef.current?.getBoundingClientRect(),
    });
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
      const fromEl = i === 0 ? base : pointRefs.current[pointNames[i - 1]];
      const toEl = pointRefs.current[pointNames[i]];
      if (!fromEl || !toEl) continue;
      const from = getXY(fromEl);
      const to = getXY(toEl);
      flightLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
      console.log(
        `🟢 Flying from ${pointNames[i - 1] || "BASE"} to ${pointNames[i]}`
      );
      await moveDrone(fromEl, toEl);
    }

    const lastEl = pointRefs.current[pointNames[pointNames.length - 1]];
    const lastPos = getXY(lastEl);
    flightLines.push({
      x1: lastPos.x,
      y1: lastPos.y,
      x2: basePos.x,
      y2: basePos.y,
    });
    console.log(`🔵 Returning to BASE`);
    await moveDrone(lastEl, base);

    setLines(flightLines);
    setTimeout(() => setLines([]), 5000);
  };

  useEffect(() => {
    let fetcher = setInterval(async () => {
      const level = await getBatteryLevel();
      setBatteryLevel(level);
    }, 1000);
    return () => {
      clearInterval(fetcher);
    };
  }, [getBatteryLevel, setBatteryLevel]);

  return (
    <div className={styles.container} ref={containerRef}>
      <h1 className={styles.title}>Flight points</h1>
      <p className={styles.instructions}>
        Select multiple points to create a flight path.
      </p>

      <select
        onChange={handleWifiSelect}
        className={styles.selectDrone}
        value={selectedWifi}
      >
        <option disabled value="">
          Select a TELLO network
        </option>
        {wifiList.map((ssid, index) => (
          <option key={index} value={ssid}>
            {ssid}
          </option>
        ))}
      </select>

      <div className={styles.grid}>
        <button className={styles.base} ref={baseRef}>
          Base
        </button>
        {[0, 1, 2, 3].map((rowVal) => (
          <div key={rowVal} className={styles.gridRow}>
            {points
              .filter((p) => p.row === rowVal)
              .sort((a, b) => a.col - b.col)
              .map((point) => (
                <button
                  key={point.id}
                  ref={(el) => (pointRefs.current[point.name] = el)}
                  className={`${styles.point} ${
                    selectedPoints.includes(point.name) ? styles.start : ""
                  }`}
                  onClick={() => handlePointClick(point.name)}
                >
                  <>
                    {point.name}
                    {selectedPoints.includes(point.name) && (
                      <span className={styles.pointOrder}>
                        {selectedPoints.indexOf(point.name)}
                      </span>
                    )}
                  </>
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

        <div className={styles.batteryLevel}>
          Battery Level
          <br />
          {batteryLevel}%
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.downloadButton}
          onClick={() =>
            window.open(
              `http://localhost:5000/api/flight/history/download?user_id=${user.id}`,
              "_blank"
            )
          }
        >
          Download Flight History as CSV
        </button>

        <input
          type="text"
          placeholder="Enter path name"
          value={pathName}
          onChange={(e) => setPathName(e.target.value)}
          className={styles.pathInput}
        />
        <button onClick={savePathToDB}>Save Path</button>
        <button onClick={sendToDrone}>Start Flight</button>
        <button onClick={clearPoints}>Clear Points</button>
        <select
          value={selectedSavedPathId || ""}
          onChange={(e) => setSelectedSavedPathId(e.target.value)}
          className={styles.selectPath}
        >
          <option value="">-- Select Saved Path --</option>
          {savedPaths.map((path) => (
            <option key={path.id} value={path.id}>
              {path.name}
            </option>
          ))}
        </select>
        <button onClick={loadSavedPath}>Run Saved Path</button>
      </div>
    </div>
  );
};

export default FlightPoints;

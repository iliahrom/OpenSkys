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
  const [droneVisible, setDroneVisible] = useState(false);
  const [visitedPoints, setVisitedPoints] = useState([]);
  const [flightToAnimate, setFlightToAnimate] = useState(null);
  const [stepSize, setStepSize] = useState(null);
  const [newStepSize, setNewStepSize] = useState("");



  const pointRefs = useRef({});
  const droneRef = useRef(null);
  const containerRef = useRef(null);
  const baseRef = useRef(null);

  const flyToPoint = (drone, point, container, callback) => {
    const droneRect = drone.getBoundingClientRect();
    const pointRect = point.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const offsetX = pointRect.left - containerRect.left;
    const offsetY = pointRect.top - containerRect.top;

    drone.style.transition = "left 1s linear, top 1s linear";
    drone.style.left = `${offsetX}px`;
    drone.style.top = `${offsetY}px`;

    setTimeout(() => {
      callback();
    }, 1000); // Match duration with CSS
  };

  useEffect(() => {
    fetchWifiNetworks();
    fetchPointsFromDB();
    fetchSavedPaths();
    fetchStepSize();
  }, []);

  const fetchPointsFromDB = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/points");
      setPoints(res.data);
    } catch (err) {
      console.error("Failed to fetch points from DB:", err);
    }
  };

  const fetchWifiNetworks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/wifi");
      setWifiList(res.data.networks);
    } catch (err) {
      console.error("Failed to fetch WiFi networks", err);
    }
  };

  const fetchSavedPaths = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/paths");
      setSavedPaths(res.data);
    } catch (err) {
      console.error("Failed to fetch saved paths:", err);
    }
  };
  const fetchStepSize = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/flight/step-size");
      setStepSize(res.data.stepSizeInCm);
    } catch (err) {
      console.error("Failed to fetch step size:", err);
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
      console.error("Failed to get battery level", err);
    }
  }, []);

  const connectToWifi = async (ssid) => {
    try {
      await axios.post("http://localhost:5000/api/wifi/connect", { ssid });
      await handleDroneConnect();
    } catch (err) {
      console.error("Failed to connect to WiFi", err);
    }
  };
  const handleDroneConnect = async () => {
    try {
      await axios.post("/api/drone/connect");
      setBatteryLevel(100); // default battery level 100%
    } catch (err) {
      console.error("Failed to connect to drone", err);
    }
  };

  const sendToDrone = async () => {
    if (selectedPoints.length < 2 || !user?.id) return;

    try {
      console.log("Sending path to drone:", selectedPoints);
      console.log("Refs:", {
        drone: droneRef.current,
        container: containerRef.current,
        base: baseRef.current,
      });

      await axios.post("http://localhost:5000/api/flight", {
        path: selectedPoints,
      });



      await axios.post("http://localhost:5000/api/flight/history/save", {
        user_id: user.id,
        path_name: pathName || "Unnamed Path",
        points: selectedPoints,
      });
      setDroneVisible(true);

    } catch (err) {
      console.error("Failed sending to drone or saving history", err);
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
      alert("Path saved successfully!");
      setPathName("");
      fetchSavedPaths();
    } catch (err) {
      console.error("Failed to save path:", err);
      alert("Failed to save path");
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
      setTimeout(() => animateFlight(pointList), 100);
    }
  };

  const clearPoints = () => {
    setSelectedPoints([]);
    setLines([]);
    setPathName("");
    setVisitedPoints([]);
  };

  const getXY = (el) => {
    if (!el || !containerRef.current) return { x: 0, y: 0 };

    // const container = containerRef.current;
    const x = el.offsetLeft + el.offsetWidth / 2;
    const y = el.offsetTop + el.offsetHeight / 2;

    return { x, y };
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

  const animateFlight = async (pointNames, live = false) => {
    if (!droneRef.current || !containerRef.current || !baseRef.current) return;
    if (live) await new Promise((resolve) => setTimeout(resolve, 12000));
    setDroneVisible(true);
    // const startEl = baseRef.current;
    // const startRect = startEl.getBoundingClientRect();
    // const containerRect = containerRef.current.getBoundingClientRect();
    // droneRef.current.style.left = `${startRect.left - containerRect.left}px`;
    // droneRef.current.style.top = `${startRect.top - containerRect.top}px`;
    const drone = droneRef.current;
    const base = baseRef.current;
    const basePos = getXY(base);
    drone.style.left = `${basePos.x - 30}px`;
    drone.style.top = `${basePos.y - 30}px`;
    console.log("Starting animation with points:", pointNames);
    console.log("Visited so far:", visitedPoints);
    console.log("Drone:", droneRef.current);
    console.log("Container:", containerRef.current);
    console.log("BASE:", baseRef.current);

    const flightLines = [];

    for (let i = 0; i < pointNames.length; i++) {
      const fromEl = i === 0 ? base : pointRefs.current[pointNames[i - 1]];
      const toEl = pointRefs.current[pointNames[i]];
      if (!fromEl || !toEl) continue;

      const from = getXY(fromEl);
      const to = getXY(toEl);
      flightLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
      console.log(
        `Flying from ${pointNames[i - 1] || "BASE"} to ${pointNames[i]}`
      );
      await moveDrone(fromEl, toEl);
      setVisitedPoints((prev) =>
        prev.includes(pointNames[i]) ? prev : [...prev, pointNames[i]]
      );
      if (live) await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    // Return to BASE at end
    const lastEl = pointRefs.current[pointNames[pointNames.length - 1]];

    if (lastEl) {
      const lastPos = getXY(lastEl);
      flightLines.push({
        x1: lastPos.x,
        y1: lastPos.y,
        x2: basePos.x,
        y2: basePos.y,
      });

      console.log(` Returning to BASE`);
      await moveDrone(lastEl, base);
    }

    setLines(flightLines);
    setTimeout(() => setLines([]), 5000);
  };

  useEffect(() => {
    let fetcher = setInterval(async () => {
      const level = await getBatteryLevel();

      if (level === null || level === undefined) {
        setBatteryLevel(100);
      } else {
        const normalizedLevel = parseInt(level);
        if (
          isNaN(normalizedLevel) ||
          normalizedLevel < 0 ||
          normalizedLevel > 100
        ) {
          setBatteryLevel(100);
        } else {
          setBatteryLevel(normalizedLevel);
        }
      }
    }, 1000);

    return () => {
      clearInterval(fetcher);
    };
  }, [getBatteryLevel]);

  useEffect(() => {
    if (flightToAnimate && flightToAnimate.length > 0) {
      const allRefsReady = flightToAnimate.every((p) => pointRefs.current[p]);
      if (allRefsReady) {
        animateFlight(flightToAnimate);
        setFlightToAnimate(null);
      } else {
        const retryTimeout = setTimeout(() => {
          setFlightToAnimate([...flightToAnimate]);
        }, 100);
        return () => clearTimeout(retryTimeout);
      }
    }
  }, [flightToAnimate]);


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
        {[0, 1, 2, 3].map((rowVal) => (
          <div key={rowVal} className={styles.gridRow}>
            {points
              .filter((p) => p.row === rowVal)
              .sort((a, b) => a.col - b.col)
              .map((point) => (
                <button
                  key={point.id}
                  ref={(el) => {
                    pointRefs.current[point.name] = el;
                    if (point.name === "BASE") baseRef.current = el;
                  }}
                  className={`${styles.point} ${
                    point.name === "BASE" ? styles.basePoint : ""
                  } ${selectedPoints.includes(point.name) ? styles.start : ""}
                  ${
                    visitedPoints.includes(point.name)
                      ? styles.visitedPoint
                      : ""
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
              display: droneVisible ? "block" : "none",
            }}
          />
        )}

        <div
          className={styles.batteryLevel}
          style={{ color: batteryLevel < 30 ? "red" : "limegreen" }}
        >
          Battery Level:
          {batteryLevel}%
        </div>
        {/* ✅ Step size control - appears centered under the grid */}
        {user.role === "admin" && (
          <div className={styles.stepSizeBox}>
            <strong>Grid Step Size:</strong>{" "}
            {stepSize ? `${stepSize} cm` : "Loading..."}
            <div className={styles.stepSizeControls}>
              <input
                type="number"
                min="20"
                max="500"
                value={newStepSize}
                onChange={(e) => setNewStepSize(e.target.value)}
                placeholder="Set new step size (20–500)"
              />
              <button
                onClick={async () => {
                  try {
                    const val = parseInt(newStepSize);
                    if (isNaN(val) || val < 20 || val > 500) {
                      alert("Step size must be between 20 and 500 cm");
                      return;
                    }
                    const res = await axios.post(
                      "http://localhost:5000/api/flight/step-size",
                      { newStepSize: val }
                    );
                    setStepSize(res.data.stepSizeInCm);
                    setNewStepSize("");
                    alert("Step size updated successfully!");
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update step size");
                  }
                }}
              >
                Save Step Size
              </button>
            </div>
          </div>
        )}
      </div>


      <div className={styles.controls}>
        {user?.role === "admin" ? (
          <button
            className={styles.downloadButton}
            onClick={() =>
              window.open(
                "http://localhost:5000/api/flight/history/download",
                "_blank"
              )
            }
          >
            Download All Flight Histories (Admin)
          </button>
        ) : (
          <button
            className={styles.downloadButton}
            onClick={() =>
              window.open(
                `http://localhost:5000/api/flight/history/download?user_id=${user.id}`,
                "_blank"
              )
            }
          >
            Download My Flight History
          </button>
        )}

        <input
          type="text"
          placeholder="Enter path name"
          value={pathName}
          onChange={(e) => setPathName(e.target.value)}
          className={styles.pathInput}
        />
        <button onClick={savePathToDB}>Save Path</button>
        <button
          onClick={() =>
            setTimeout(() => {
              sendToDrone().then(null).catch(null);
              animateFlight(selectedPoints, true);
            }, 0)
          }
        >
          Start Flight
        </button>
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

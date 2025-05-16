import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import styles from "../styles/flight.module.css";
import droneIcon from "../assets/drone.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const drones = [
  { id: 1, name: "DJI Tello", status: "Active" },
  { id: 2, name: "Drone 1", status: "Offline" },
  { id: 3, name: "Drone 2", status: "Offline" },
  { id: 4, name: "Drone 3", status: "Offline" },
];

const points = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

const FlightPoints = () => {
  const [selectedDrone, setSelectedDrone] = useState(drones[0]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [lineCoords, setLineCoords] = useState(null);

  const pointRefs = useRef({});
  const droneRef = useRef(null);
  const containerRef = useRef(null);
  const baseRef = useRef(null);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleDroneChange = (e) => {
    const drone = drones.find(
      (d) => `${d.name} - ${d.status}` === e.target.value
    );
    setSelectedDrone(drone);
  };

  const handlePointClick = (point) => {
    if (!start) {
      setStart(point);
      setEnd(null);
    } else if (!end) {
      setEnd(point);
    } else {
      setStart(point);
      setEnd(null);
    }
  };

  const sendToDrone = (from, to) => {
    axios
      .post("http://localhost:5000/api/flight", { from, to })
      .then(() => console.log("✅ Sent to drone"))
      .catch((err) => console.error("❌ Failed sending to drone", err));
  };

  useEffect(() => {
    if (start && end) {
      sendToDrone(start, end);
    }
  }, [start, end]);

  useEffect(() => {
    if (
      start &&
      end &&
      pointRefs.current[start] &&
      pointRefs.current[end] &&
      baseRef.current &&
      droneRef.current &&
      containerRef.current
    ) {
      const baseBox = baseRef.current.getBoundingClientRect();
      const startBox = pointRefs.current[start].getBoundingClientRect();
      const endBox = pointRefs.current[end].getBoundingClientRect();
      const containerBox = containerRef.current.getBoundingClientRect();
      const drone = droneRef.current;

      const getXY = (box) => ({
        x: box.left - containerBox.left + box.width / 2,
        y: box.top - containerBox.top + box.height / 2,
      });

      const basePos = getXY(baseBox);
      const startPos = getXY(startBox);
      const endPos = getXY(endBox);

      setLineCoords({
        x1: startPos.x,
        y1: startPos.y,
        x2: endPos.x,
        y2: endPos.y,
      });

      const duration = 2000;
      const frameRate = 1000 / 60;
      const totalFrames = duration / frameRate;

      drone.style.left = `${basePos.x - 30}px`;
      drone.style.top = `${basePos.y - 30}px`;

      const animate = (from, to, callback) => {
        let frame = 0;
        const interval = setInterval(() => {
          frame++;
          const progress = frame / totalFrames;
          const x = from.x + (to.x - from.x) * progress;
          const y = from.y + (to.y - from.y) * progress;
          drone.style.left = `${x - 30}px`;
          drone.style.top = `${y - 30}px`;
          if (frame >= totalFrames) {
            clearInterval(interval);
            if (callback) setTimeout(callback, 300);
          }
        }, frameRate);
      };

      animate(basePos, startPos, () => {
        animate(startPos, endPos, () => {
          animate(endPos, basePos);
          setTimeout(() => setLineCoords(null), 5000);
        });
      });
    }
  }, [start, end]);

  const handleSetupClick = () => {
    navigate("/manual-setup");
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <h1 className={styles.title}>Flight points</h1>
      <p className={styles.instructions}>
        Please choose flight points, starting point will be colored in green,
        end point in blue.
      </p>
      <select onChange={handleDroneChange} className={styles.selectDrone}>
        {drones.map((drone) => (
          <option key={drone.id}>{`${drone.name} - ${drone.status}`}</option>
        ))}
      </select>

      <div className={styles.grid}>
        <button className={styles.base} ref={baseRef}>
          Base
        </button>
        {[0, 3, 6].map((row) => (
          <div key={row} className={styles.gridRow}>
            {points.slice(row, row + 3).map((point) => (
              <button
                key={point}
                ref={(el) => (pointRefs.current[point] = el)}
                className={`${styles.point} ${
                  start === point ? styles.start : ""
                } ${end === point ? styles.end : ""}`}
                onClick={() => handlePointClick(point)}
              >
                {point}
              </button>
            ))}
          </div>
        ))}
        {lineCoords && (
          <svg className={styles.svgOverlay}>
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
      </div>

      {user?.role === "admin" && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={handleSetupClick} className={styles.setupButton}>
            Setup Points
          </button>
        </div>
      )}

      {start && end && (
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
  );
};

export default FlightPoints;

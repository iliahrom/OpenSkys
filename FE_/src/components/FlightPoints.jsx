import React, { useState, useEffect } from "react";
import styles from "../styles/flight.module.css";
import droneIcon from "../assets/drone.png";

const drones = [
  { id: 1, name: "DJI Tello", status: "Active" },
  { id: 2, name: "Drone 1", status: "Offline" },
  { id: 3, name: "Drone 2", status: "Offline" },
  { id: 4, name: "Drone 3", status: "Offline" },
];

const points = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

const pointCoordinates = {
  A: { row: 0, col: 0 },
  B: { row: 0, col: 1 },
  C: { row: 0, col: 2 },
  D: { row: 1, col: 0 },
  E: { row: 1, col: 1 },
  F: { row: 1, col: 2 },
  G: { row: 2, col: 0 },
  H: { row: 2, col: 1 },
  I: { row: 2, col: 2 },
};

const FlightPoints = () => {
  const [selectedDrone, setSelectedDrone] = useState(drones[0]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [dronePos, setDronePos] = useState("BASE");
  const [hovering, setHovering] = useState(false);
  const [step, setStep] = useState(-1);

  const handleDroneChange = (e) => {
    const drone = drones.find(
      (d) => `${d.name} - ${d.status}` === e.target.value
    );
    setSelectedDrone(drone);
  };

  const handlePointClick = (point) => {
    if (!start) setStart(point);
    else if (!end) setEnd(point);
    else {
      setStart(point);
      setEnd(null);
    }
  };

  useEffect(() => {
    if (!start || !end || step === -1) return;
    const route = [start, "hover1", end, "hover2", "BASE"];
    const curr = route[step];
    if (!curr) return;

    if (curr.startsWith("hover")) {
      setHovering(true);
      const timeout = setTimeout(() => {
        setHovering(false);
        setStep((s) => s + 1);
      }, 15000);
      return () => clearTimeout(timeout);
    } else {
      setDronePos(curr);
      const timeout = setTimeout(() => setStep((s) => s + 1), 2000);
      return () => clearTimeout(timeout);
    }
  }, [step, start, end]);

  const beginFlight = () => {
    setDronePos("BASE");
    setStep(0);
  };

  return (
    <div className={styles.container}>
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

      <div className={styles.gridWrapper}>
        <div className={styles.base}>BASE</div>

        <div className={styles.grid}>
          {points.map((point) => (
            <button
              key={point}
              className={`${styles.point} ${
                start === point ? styles.start : ""
              } ${end === point ? styles.end : ""}`}
              onClick={() => handlePointClick(point)}
            >
              {point}
            </button>
          ))}

          <img
            src={droneIcon}
            className={styles.dronePath}
            style={{
              top:
                dronePos === "BASE"
                  ? "-130px"
                  : `${pointCoordinates[dronePos].row * 120}px`,
              left:
                dronePos === "BASE"
                  ? "120px"
                  : `${pointCoordinates[dronePos].col * 120}px`,
              transform: hovering ? "translateY(50px)" : "translateY(0)",
            }}
            alt="drone"
          />
        </div>
      </div>

      {start && end && (
        <button className={styles.startBtn} onClick={beginFlight}>
          Start Flight
        </button>
      )}
    </div>
  );
};

export default FlightPoints;

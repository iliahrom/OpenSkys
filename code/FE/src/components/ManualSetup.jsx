import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/flight.module.css";

const POINTS = ["BASE", "A", "B", "C", "D", "E", "F", "G", "H", "I"];
const COMMAND_OPTIONS = [
  "command",
  "takeoff",
  "land",
  "forward 50",
  "back 50",
  "left 50",
  "right 50",
  "forward 30",
  "back 30",
  "left 30",
  "right 30",
  "up 50",
  "down 50",
  "up 30",
  "down 30",
  "cw 90",
  "ccw 90",
  "cw 30",
  "ccw 30",
];

export default function ManualSetup() {
  const [selectedPoint, setSelectedPoint] = useState("BASE");
  const [commands, setCommands] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [message, setMessage] = useState("");

  const handleAddCommand = () => {
    if (currentCommand) {
      setCommands((prev) => [...prev, currentCommand]);
      setCurrentCommand("");
    }
  };

  const handleClear = () => {
    setCommands([]);
    setMessage("");
  };

  const handleSave = async () => {
    if (commands.length === 0) {
      setMessage("No commands to save.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/points/${selectedPoint}`,
        { commands, x, y },
        { withCredentials: true }
      );
      setMessage(response.data.message || "Saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to save commands.");
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Manual Setup – Admin Only</h2>

      <label>Select Point:</label>
      <select
        value={selectedPoint}
        onChange={(e) => setSelectedPoint(e.target.value)}
        className={styles.selectDrone}
      >
        {POINTS.map((point) => (
          <option key={point} value={point}>
            {point}
          </option>
        ))}
      </select>

      {/* שורות קלט X/Y מיושרות לשורה אחת */}
      <div className={styles.flexRow}>
        <div className={styles.positionGroup}>
          <label>X Position (cm):</label>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className={styles.inputField}
          />
        </div>

        <div className={styles.positionGroup}>
          <label>Y Position (cm):</label>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className={styles.inputField}
          />
        </div>
      </div>

      <label>Add Command:</label>
      <div className={styles.flexRow}>
        <select
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
        >
          <option value="">-- Select command --</option>
          {COMMAND_OPTIONS.map((cmd) => (
            <option key={cmd} value={cmd}>
              {cmd}
            </option>
          ))}
        </select>
        <button className={styles.addButton} onClick={handleAddCommand}>
          Add
        </button>
        <button className={styles.clearButton} onClick={handleClear}>
          Clear
        </button>
      </div>

      <label>Command Sequence:</label>
      <ul>
        {commands.map((cmd, idx) => (
          <li key={idx}>{cmd}</li>
        ))}
      </ul>

      <button onClick={handleSave} className={styles.setupButton}>
        Save Sequence
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

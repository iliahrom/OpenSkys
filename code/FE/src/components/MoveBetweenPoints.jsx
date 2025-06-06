import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/flight.module.css";

const POINTS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export default function MoveDrone() {
  const [start, setStart] = useState("A");
  const [end, setEnd] = useState("B");
  const [status, setStatus] = useState("");
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFly = async () => {
    if (start === end) {
      setStatus("⚠️ Start and end must be different.");
      return;
    }

    setLoading(true);
    setStatus("🛰 Sending commands...");
    setCommands([]);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/move/${start}/${end}`,
        {},
        { withCredentials: true }
      );

      setCommands(res.data.commands);
      setStatus("✅ Drone flight executed.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error during movement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        Drone Flight – BASE → {start} → {end} → BASE
      </h2>

      <div className={styles.flexRow}>
        <label>Start:</label>
        <select value={start} onChange={(e) => setStart(e.target.value)}>
          {POINTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label>End:</label>
        <select value={end} onChange={(e) => setEnd(e.target.value)}>
          {POINTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleFly}
        className={styles.setupButton}
        disabled={loading}
      >
        {loading ? "⏳ Executing..." : "✈️ Start Flight"}
      </button>

      {status && <p style={{ marginTop: "10px" }}>{status}</p>}

      {commands.length > 0 && (
        <>
          <h4>Commands Sent:</h4>
          <ul>
            {commands.map((cmd, i) => (
              <li key={i}>{cmd}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

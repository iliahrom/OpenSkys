import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/savedPaths.module.css";

const SavedPaths = ({ onLoadPath }) => {
  const [paths, setPaths] = useState([]);

  const fetchPaths = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/paths");
      setPaths(res.data);
    } catch (err) {
      console.error("Failed to fetch saved paths", err);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Saved Flight Paths</h2>
      {paths.length === 0 ? (
        <p>No saved paths yet.</p>
      ) : (
        <ul>
          {paths.map((path) => (
            <li key={path.id}>
              {path.name}
              <button onClick={() => onLoadPath(path.id)}>Load</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedPaths;

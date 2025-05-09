import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../styles/Details.module.css";
import axios from "axios";

function Details({ existingDrone = null, onClose = null }) {
  const { id } = useParams();
  const [droneDetails, setDroneDetails] = useState({
    model: "",
    weight: "",
    range_km: "",
    description: "",
  });
  const [saving, setSaving] = useState(false); // ✅ Saving State

  useEffect(() => {
    if (existingDrone) {
      setDroneDetails({
        model: existingDrone.model || "",
        weight: existingDrone.weight || "",
        range_km: existingDrone.range_km || "",
        description: existingDrone.description || "",
      });
    } else if (id) {
      axios
        .get(`http://localhost:3000/api/drones/${id}`)
        .then((response) => setDroneDetails(response.data))
        .catch((error) => console.error("Error fetching drone:", error));
    }
  }, [existingDrone, id]);

  const saveChanges = async (e) => {
    e.preventDefault();
    setSaving(true); // 🔵 Start Saving
    try {
      const droneId = existingDrone?.id || id;
      if (droneId) {
        await axios.post(
          `http://localhost:3000/api/drones/${droneId}`,
          droneDetails
        );
        alert("Drone updated successfully!");
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(
        "Error saving drone:",
        error.response?.data || error.message
      );
      alert("Failed to update drone.");
    } finally {
      setSaving(false); // 🔵 End Saving
    }
  };

  const onDelete = async () => {
    if (!id) return;
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this drone?"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/drones/${id}`);
        alert("Drone deleted successfully!");
        window.location.href = "/";
      } catch (error) {
        console.error(
          "Error deleting drone:",
          error.response?.data || error.message
        );
        alert("Failed to delete drone.");
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* ✅ Title and Delete Button for full page only */}
      {!onClose && (
        <>
          <h2>Drones Management</h2>
          <Link to="/" className={styles.backButton}>
            Back to Home
          </Link>
          <button
            className={styles.deleteButton}
            type="button"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      )}

      {/* ✅ Edit Form */}
      <form className={styles.form} onSubmit={saveChanges}>
        <input
          type="text"
          placeholder="Drone Model"
          value={droneDetails.model}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              model: e.target.value,
            }))
          }
        />
        <input
          type="text"
          placeholder="Drone Weight"
          value={droneDetails.weight}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              weight: e.target.value,
            }))
          }
        />
        <input
          type="text"
          placeholder="Drone Range"
          value={droneDetails.range_km}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              range_km: e.target.value,
            }))
          }
        />
        <textarea
          placeholder="Drone Description"
          value={droneDetails.description}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              description: e.target.value,
            }))
          }
        />

        {/* ✅ Save Button with Saving... State */}
        <button className={styles.saveButton} type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>

        {/* ✅ Cancel Button if in popup */}
        {onClose && (
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default Details;

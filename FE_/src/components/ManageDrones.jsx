  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import styles from "../styles/ManageDrones.module.css";
  import AddDrone from "./AddDrone"; // ✅ Add Drone Form
  import Details from "./Details"; // ✅ Edit Drone Form

  const ManageDrones = () => {
    const [drones, setDrones] = useState([]);
    const [showForm, setShowForm] = useState(false); // Controls if form visible
    const [droneToEdit, setDroneToEdit] = useState(null); // null = add, not null = edit
    


    useEffect(() => {
      fetchDrones();
    }, []);

    const fetchDrones = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/drones");
        setDrones(response.data);
      } catch (error) {
        console.error("Error fetching drones:", error);
      }
    };

    const handleAddNew = () => {
      setDroneToEdit(null); // ❗ No drone selected means "Add"
      setShowForm(true);
    };

    const handleEdit = (drone) => {
      setDroneToEdit(drone); // ❗ Set drone to edit
      setShowForm(true);
    };

    const handleDelete = async (droneId) => {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this drone?"
      );
      if (isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/drones/${droneId}`);
          alert("Drone deleted successfully!");
          setDrones((current) => current.filter((d) => d.id !== droneId));
        } catch (error) {
          console.error(
            "Error deleting drone:",
            error.response?.data || error.message
          );
          alert("Failed to delete drone. Please try again.");
        }
      }
    };

    return (
      <div className={styles.manageWrapper}>
        <h2>Drones Management</h2>

        {/* Drones Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Weight</th>
              <th>Range (km)</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drones.map((drone) => (
              <tr key={drone.id}>
                <td>{drone.model}</td>
                <td>{drone.weight}</td>
                <td>{drone.range_km}</td>
                <td>{drone.description}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(drone)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(drone.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add New Drone Button */}
        <div className={styles.addButtonWrapper}>
          <button className={styles.addButton} onClick={handleAddNew}>
            + Add New Drone
          </button>
        </div>

        {/* Popup Form Area */}
        {showForm && (
          <div className={styles.addFormWrapper}>
            {droneToEdit ? (
              // ✅ If we are editing a drone -> show Details
              <Details
                existingDrone={droneToEdit}
                onClose={() => {
                  setShowForm(false);
                  fetchDrones();
                }}
              />
            ) : (
              // ✅ If we are adding new -> show AddDrone
              <AddDrone
                onClose={() => {
                  setShowForm(false);
                  fetchDrones();
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  export default ManageDrones;

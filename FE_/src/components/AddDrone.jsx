import React, { useState } from "react"; // ✅ Importing React and the useState hook
//import { Link } from "react-router-dom"; // ✅ Importing Link for navigation
import styles from "../styles/Details.module.css"; // ✅ Importing CSS module for styling
import axios from "axios"; // ✅ Importing axios for making API requests

function AddDrone({ onClose }) {
  // ✅ Retrieve the user from local storage (to check if they are an admin)
  const user = JSON.parse(localStorage.getItem("user") || {});
  const isAdmin = user.role === "admin"; // ✅ Check if the user is an admin

  // ✅ State to store drone details entered by the user
  const [droneDetails, setDroneDetails] = useState({
    model: "",
    weight: "",
    range_km: "",
    description: "",
  });

  // ✅ Function to save the drone details to the database
  const saveChanges = async (e) => {
    e.preventDefault(); // ✅ Prevent the default form submission behavior

    if (!isAdmin) {
      return false; // ✅ If the user is not an admin, do nothing
    }

    // ✅ Validate that all fields are filled
    if (
      !droneDetails.model.trim() ||
      !droneDetails.weight.trim() ||
      !droneDetails.range_km.trim() ||
      !droneDetails.description.trim()
    ) {
      alert("All fields are required!");
      return false;
    }

    // ✅ Validate that `weight` and `range_km` are numeric values
    if (isNaN(droneDetails.weight) || isNaN(droneDetails.range_km)) {
      alert("Weight and Range must be numeric values!");
      return false;
    }

    // ✅ Send a `POST` request to add the new drone to the database
    try {
      await axios.post("http://localhost:3000/api/drones", droneDetails);

      alert("Drone added successfully!");

      if (onClose) {
        onClose(); // ✅ Close the popup if inside Admin Control Panel
      } else {
        window.location.href = "/"; // ✅ Only redirect to home if NOT in popup
      }
    } catch (error) {
      console.error(
        "Error adding drone:",
        error.response?.data || error.message
      );
      alert("Failed to add drone. Please try again.");
    }

    // .catch((error) => console.error("Error inserting new drone:", error));

    return false;
  };

  // ✅ If the user is NOT an admin, redirect them to the homepage
  if (!isAdmin) {
    window.location.href = "/";
  }

  return (
    <div className={styles.container}>
      {" "}
      {/* ✅ Main container for the form */}
      <form action="#" className={styles.form} onSubmit={saveChanges}>
        {/* ✅ Input field for the drone model */}
        <input
          type="text"
          placeholder="Drone Model"
          value={droneDetails.model}
          disabled={!isAdmin} // ✅ Disable input if user is not an admin
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              model: e.target.value,
            }))
          }
        />

        {/* ✅ Input field for the drone weight */}
        <input
          type="text"
          placeholder="Drone weight"
          value={droneDetails.weight}
          disabled={!isAdmin}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              weight: e.target.value,
            }))
          }
        />

        {/* ✅ Input field for the drone range */}
        <input
          type="text"
          placeholder="Drone Range"
          value={droneDetails.range_km}
          disabled={!isAdmin}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              range_km: e.target.value,
            }))
          }
        />

        {/* ✅ Textarea field for the drone description */}
        <textarea
          placeholder="Drone Description"
          value={droneDetails.description}
          disabled={!isAdmin}
          onChange={(e) =>
            setDroneDetails((current) => ({
              ...current,
              description: e.target.value,
            }))
          }
        />

        {/* ✅ Submit button to save drone details */}
        <button className={styles.saveButton} type="submit">
          Save
        </button>
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
      {/* ✅ Link to navigate back to the home page */}
    </div>
  );
}

export default AddDrone; // ✅ Exporting the AddDrone component to be used in the project

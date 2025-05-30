import React, { useState, useEffect } from "react"; // ✅ Importing React hooks: useState (for state) and useEffect (for fetching data)
import { Link } from "react-router-dom"; // ✅ Importing Link for navigation
import axios from "axios"; // ✅ Importing axios for making API requests
import styles from "../styles/Home.module.css"; // ✅ Importing CSS module for styling

const Home = () => {
  // ✅ State to store the list of drones
  const [drones, setDrones] = useState([]);

  // ✅ Retrieve the user from local storage and check if they are an admin
  const user = JSON.parse(localStorage.getItem("user") || {});
  const isAdmin = user.role === "admin";

  // ✅ Fetch the list of drones from the backend when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/drones") // ✅ Send a GET request to fetch drones
      .then((response) => setDrones(response.data)) // ✅ Store the retrieved drones in state
      .catch((error) => console.error("Error fetching drones:", error)); // ✅ Log errors if request fails
  }, []); // ✅ Runs once when the component mounts

  return (
    <div className={styles.container}>
      {" "}
      {/* ✅ Main container for the home page */}
      <h2>Drones</h2>
      {/* ✅ If the user is an admin, show the "Add Drone" button */}
      {isAdmin && (
        <Link to={`/add-drone`}>
          <button className={styles.addDrone}>Add Drone</button>
        </Link>
      )}
      {/* ✅ List of drones */}
      <ul className={styles.list}>
        {drones.map((drone) => (
          <li key={drone.id} className={styles.item}>
            {" "}
            {/* ✅ List item for each drone */}
            <h3>
              {drone.model} ({drone.range_km}km){" "}
              {/* ✅ Display drone model and range */}
            </h3>
            {/* ✅ Button to view or edit drone details */}
            <Link
              to={`/details/${drone.id}`} // ✅ Navigate to drone details page
              className={`${styles.detailsButton} ${
                isAdmin ? styles.editButton : ""
              }`}
            >
              {!isAdmin && <span>View Details</span>}{" "}
              {/* ✅ If not admin, show "View Details" */}
              {isAdmin && <span>Edit</span>} {/* ✅ If admin, show "Edit" */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home; // ✅ Exporting the Home component to be used in the project

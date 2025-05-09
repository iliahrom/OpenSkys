import React, { useState } from "react"; // ✅ Importing React and useState hook
import axios from "axios"; // ✅ Importing axios to send HTTP requests
import { useNavigate } from "react-router-dom"; // ✅ Importing useNavigate for redirecting after login
import styles from "../styles/Login.module.css"; // ✅ Importing CSS module for styling

const Login = ({ setUser }) => {
  // ✅ State variables to store user input
  const [username, setUsername] = useState(""); // Stores the username input
  const [password, setPassword] = useState(""); // Stores the password input
  const [error, setError] = useState(""); // Stores error messages
  const navigate = useNavigate(); // ✅ Function to navigate between pages after login

  // ✅ Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevents page reload when submitting the form
    setError(""); // ✅ Clears previous error messages

    try {
      // ✅ Send a login request to the backend
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { username, password }, // ✅ Sending username and password in the request body
        { withCredentials: true } // ✅ Allows cookies (session storage)
      );

      // ✅ Store user data in local storage for persistent login
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ Update the user state in the application
      setUser(response.data.user);

      // ✅ Redirect user to the home page after successful login
      navigate("/");
    } catch (err) {
      // ✅ Handle login errors and display them to the user
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className={styles.container}>
      {" "}
      {/* ✅ Main container for the login page */}
      <div className={styles.loginBox}>
        {" "}
        {/* ✅ Box containing the login form */}
        <h2>Login</h2>
        {/* ✅ Display error message if login fails */}
        {error && <p className={styles.error}>{error}</p>}
        {/* ✅ Login form */}
        <form onSubmit={handleSubmit}>
          {/* ✅ Username input field */}
          <div className={styles.inputGroup}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // ✅ Updates state when user types
              required
            />
          </div>

          {/* ✅ Password input field */}
          <div className={styles.inputGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Login button */}
          <button type="submit" className={styles.loginButton}>
            Sign In
          </button>
        </form>
        {/* ✅ Link to registration page */}
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login; // ✅ Exporting the Login component to be used in the project

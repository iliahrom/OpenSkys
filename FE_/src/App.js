import React, { useState, useEffect } from "react"; // ✅ Importing React hooks: useState (for managing state) and useEffect (for fetching user session on load)
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // ✅ Importing React Router for handling navigation
// import Home from "./components/Home"; // ✅ Home page component
import Details from "./components/Details"; // ✅ Component for drone details
import Login from "./components/Login"; // ✅ Component for user login
import Register from "./components/Register"; // ✅ Component for user registration
import About from "./components/About"; // ✅ Component for about page
import Contact from "./components/Contact"; // ✅ Component for contact page
import FlightPoints from "./components/FlightPoints"; // ✅ Component for managing flight points
import Navbar from "./components/Navbar"; // ✅ Navbar component (shown only when the user is logged in)
import axios from "axios"; // ✅ Importing axios for API requests
import AddDrone from "./components/AddDrone"; // ✅ Component for adding new drones (for admin users)
import ControlPanel from "./components/ControlPanel";
import Profile from "./components/Profile";
import FlightAnimation from "./components/FlightAnimation";

function App() {
  // ✅ State to store the logged-in user
  const [user, setUser] = useState(null);

  // ✅ State to track loading while checking session
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user session when the app loads
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/session", { withCredentials: true }) // ✅ Request user session from backend
      .then((response) => {
        setUser(response.data.user); // ✅ Set user data if authenticated
        localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ Store user in local storage for persistence
      })
      .catch(() => {
        setUser(null); // ✅ If not logged in, set user to null
        localStorage.removeItem("user"); // ✅ Remove user from local storage
      })
      .finally(() => setLoading(false)); // ✅ Stop loading when request completes
  }, []);

  // ✅ Logout function to clear session and user state
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null); // ✅ Remove user from state
      localStorage.removeItem("user"); // ✅ Clear user from local storage
    } catch (err) {
      console.error("Logout failed:", err.response?.data?.error || err.message);
    }
  };

  // ✅ Show loading indicator while checking user session
  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      {/* ✅ Show Navbar only if user is logged in */}
      {user && <Navbar user={user} handleLogout={handleLogout} />}

      {/* ✅ Main container for all pages */}
      <div className="app-container">
        <Routes>
          {/* ✅ Protected Routes (Only logged-in users can access) */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/flight-points" /> : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<FlightAnimation />} />

          <Route
            path="/details/:id"
            element={user ? <Details /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-drone"
            element={user ? <AddDrone /> : <Navigate to="/login" />}
          />
          <Route
            path="/about"
            element={user ? <About /> : <Navigate to="/login" />}
          />
          <Route
            path="/contact"
            element={user ? <Contact /> : <Navigate to="/login" />}
          />
          <Route
            path="/flight-points"
            element={user ? <FlightPoints /> : <Navigate to="/login" />}
          />

          {/* ✅ Authentication Routes (Redirect if user is already logged in) */}
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />
          <Route
            path="/control-panel"
            element={
              user && user.role === "admin" ? (
                <ControlPanel />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; // ✅ Exporting App component

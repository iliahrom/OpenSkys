const express = require("express"); // Importing Express to create the server
const session = require("express-session"); // Importing session management for user authentication
const cors = require("cors"); // Importing CORS to allow cross-origin requests
const dbSingleton = require("./dbSingleton"); // Importing the database connection instance

//Importing route files for different features
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const contactRoutes = require("./routes/contactRoutes"); // Contact form routes
const droneRoutes = require("./routes/droneRoutes"); // Drone-related routes
const flightRoute = require("./routes/flightRoute");
const wifiRoutes = require("./routes/wifiRoutes");
const pointsRoutes = require("./routes/points");
const historyRoutes = require("./routes/historyRoutes");

const app = express(); // Initializing the Express app
const port = 5000; // Defining the port on which the server will run

app.use(express.json()); // Middleware to parse JSON requests

//Configuring CORS (Cross-Origin Resource Sharing)
//This allows the frontend (React app) to communicate with the backend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Allow frontend requests
    credentials: true, // Allow sending cookies (important for authentication)
  })
);

//Setting up session management
//This allows users to stay logged in between requests
app.use(
  session({
    secret: "mySecretKey", // Secret key used to sign session data (should be in environment variables)
    resave: false, // Prevents unnecessary session saving
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      secure: false, // Set to `true` in production (requires HTTPS)
      httpOnly: true, // Prevents client-side access to cookies
      sameSite: "lax", // Helps prevent CSRF attacks
      maxAge: 1000 * 60 * 60, // Session expires in 1 hour(or manually by logout)
    },
  })
);

//Connecting to the database and testing the connection
const db = dbSingleton.getConnection();
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("Database connection failed:", err); // Log error if connection fails
  } else {
    console.log("Connected to MySQL database!"); // Log success if connected
  }
});

//Registering API routes
//These define the available API endpoints for different parts of the system
app.use("/api/auth", authRoutes); // Authentication endpoints
app.use("/api/contact", contactRoutes); // Contact form endpoints
app.use("/api/drones", droneRoutes); // Drone management endpoints
app.use("/api/flight", flightRoute);
app.use("/api/wifi", wifiRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/paths", require("./routes/pathRoutes"));
app.use("/api/flight/history", historyRoutes);

//Health check route
//This allows checking if the server is running
app.get("/", (req, res) => {
  res.send("Server is running!"); // Returns a success message
});

//Starting the server
//This makes the backend accessible on port 5000
app.listen(port, "localhost", () => {
  console.log(`Good, Server running on port ${port}`); // Log confirmation message
});

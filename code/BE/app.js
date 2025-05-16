const express = require("express"); // Importing Express to create the server
const session = require("express-session"); // Importing session management for user authentication
const cors = require("cors"); // Importing CORS to allow cross-origin requests
const dbSingleton = require("./dbSingleton"); // Importing the database connection instance

// ✅ Importing route files for different features
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const contactRoutes = require("./routes/contactRoutes"); // Contact form routes
const droneRoutes = require("./routes/droneRoutes"); // Drone-related routes
const flightRoute = require("./routes/flightRoute"); // Flight execution logic
const pointRoutes = require("./routes/pointRoutes"); // Manual setup for point commands ✅

const app = express(); // Initializing the Express app
const port = 5000; // Port number for the backend server

app.use(express.json()); // Middleware to parse incoming JSON requests

// ✅ Enable CORS (for frontend <-> backend communication)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// ✅ Setup session management
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// ✅ Test DB connection
const db = dbSingleton.getConnection();
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

// ✅ Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/flight", flightRoute);
app.use("/api/points", pointRoutes); // ✅ Added line for admin setup of flight points

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ Start the server
app.listen(port, "localhost", () => {
  console.log(`🚀 Server running on port ${port}`);
});

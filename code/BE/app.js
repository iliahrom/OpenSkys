const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dbSingleton = require("./dbSingleton");

// Route files
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const droneRoutes = require("./routes/droneRoutes");
const flightRoute = require("./routes/flightRoute");
const pointRoutes = require("./routes/pointRoutes");
const movementRoutes = require("./routes/movement");//link to movement logic

const app = express();
const port = 5000;

// ✅ middleware to parse incoming JSON BEFORE ANYTHING ELSE
app.use(express.json());
app.use((req, res, next) => {
  console.log("📡 Raw incoming body:", req.method, req.originalUrl, req.body);
  next();
});

// ✅ CORS
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// ✅ Sessions
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  })
);

// ✅ DB test
const db = dbSingleton.getConnection();
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/flight", flightRoute);
app.use("/api/points", pointRoutes);
app.use("/api/move", movementRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

app.listen(port, "localhost", () => {
  console.log(`🚀 Server running on port ${port}`);
});

const express = require("express"); // Importing Express to define routes
const {
  getMissions,
  addMission,
  deleteMission,
} = require("../controllers/missionController"); // Importing mission-related controller functions

const router = express.Router(); // Create an Express router instance






























































// ✅ Route to retrieve all missions
// 🔹 Calls `getMissions` from `missionController.js`
// 🔹 Used in `GET /api/missions`
router.get("/", getMissions);

// ✅ Route to add a new mission
// 🔹 Calls `addMission` from `missionController.js`
// 🔹 Used in `POST /api/missions`
router.post("/", addMission);

// ✅ Route to delete a mission by ID
// 🔹 Calls `deleteMission` from `missionController.js`
// 🔹 Used in `DELETE /api/missions/:id`
router.delete("/:id", deleteMission);

// ✅ Exporting the router to be used in `app.js`
module.exports = router;

/*
/api/missions	GET	Retrieves all missions	getMissions
/api/missions	POST	Adds a new mission	addMission
/api/missions/:id	DELETE	Deletes a mission by ID	deleteMission

Postman Requests

Test GET /api/missions to retrieve all missions.
Test POST /api/missions with different input data.
Test DELETE /api/missions/:id with a valid and invalid ID.




Possible Exam Tasks

Add a route to update a mission (PUT /api/missions/:id).
Implement role-based access control (only admins can delete missions).
Modify GET /api/missions to allow filtering by drone ID (e.g., GET /api/missions?drone_id=5).
Prevent deletion of active missions: Add a status field (e.g., "Completed", "In Progress") and restrict deletion.


1️⃣ Add New Routes in app.js
🔹 Ensures that mission-related routes are properly registered in app.js.
🔹 This allows frontend users to access mission APIs.

✅ Modify app.js
const missionRoutes = require("./routes/missionRoutes"); // ✅ Import mission routes

// ✅ Register mission routes
app.use("/api/missions", missionRoutes);

✅ Postman Test:

GET /api/missions

Expected Response:
[
  {
    "id": 1,
    "drone_id": 3,
    "mission_name": "Surveillance Mission",
    "location": "Tel Aviv"
  }
]


2️⃣ Improve Error Handling (Global Middleware)
🔹 Adds a centralized error-handling middleware in app.js.
🔹 Ensures all unhandled errors return proper responses.

✅ Modify app.js
// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

✅ Modify missionRoutes.js
Convert callbacks into async/await to handle errors properly:

router.get("/", async (req, res, next) => {
  try {
    const db = dbSingleton.getConnection();
    db.query("SELECT * FROM missions", (err, results) => {
      if (err) return next(err); // ✅ Pass error to global handler
      res.json(results);
    });
  } catch (err) {
    next(err);
  }
});

✅ Postman Test:

Send a request when the database is down.
Expected 500 Internal Server Error response.



*/

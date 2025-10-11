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

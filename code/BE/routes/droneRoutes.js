const express = require("express"); // Importing Express to define routes
const {
  getDrones,
  getDroneById,
  updateDroneById,
  deleteDroneById,
  addDrone,
} = require("../controllers/droneController"); // Importing drone-related controller functions

const router = express.Router(); // Create an Express router instance

// ✅ Route to retrieve all drones
// 🔹 Calls `getDrones` from `droneController.js`
// 🔹 Used in `GET /api/drones`
router.get("/", getDrones);

// ✅ Route to add a new drone
// 🔹 Calls `addDrone` from `droneController.js`
// 🔹 Used in `POST /api/drones`
router.post("/", addDrone);

// ✅ Route to retrieve a specific drone by ID
// 🔹 Calls `getDroneById` from `droneController.js`
// 🔹 Used in `GET /api/drones/:id`
router.get("/:id", getDroneById);

// ⚠️ **Potential Issue:** `POST` is typically used for creating new resources
// ✅ Route to update a specific drone by ID
// 🔹 Calls `updateDroneById` from `droneController.js`
// 🔹 🔄 **Should be `PUT /api/drones/:id` instead of `POST`**
router.post("/:id", updateDroneById);

// ✅ Route to delete a specific drone by ID
// 🔹 Calls `deleteDroneById` from `droneController.js`
// 🔹 Used in `DELETE /api/drones/:id`
router.delete("/:id", deleteDroneById);

// ✅ Exporting the router to be used in `app.js`

module.exports = router;

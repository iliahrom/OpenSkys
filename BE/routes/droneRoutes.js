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

/*
/api/drones	GET	Retrieves all drones	getDrones
/api/drones	POST	Adds a new drone	addDrone
/api/drones/:id	GET	Retrieves a specific drone by ID	getDroneById
/api/drones/:id	POST ❌	Incorrect method for updates	updateDroneById (should be PUT)
/api/drones/:id	DELETE	Deletes a drone by ID	deleteDroneById

Postman Requests

Test GET /api/drones to retrieve all drones.
Test POST /api/drones with valid input data.
Test GET /api/drones/:id with a valid and invalid ID.
Test PUT /api/drones/:id (after changing POST to PUT) to update a drone.
Test DELETE /api/drones/:id to remove a drone.

Possible Exam Tasks

Fix the update method: Change router.post("/:id", updateDroneById); to router.put("/:id", updateDroneById);.
Add input validation: Ensure required fields (model, weight, range) are provided before inserting/updating.
Implement role-based access control: Only admin users should be allowed to delete drones.
Modify GET /api/drones to allow searching/filtering by model (e.g., GET /api/drones?model=Phantom).


1️⃣ Fix the Update Method (PUT Instead of POST)
🔹 The incorrect method (POST) is currently used for updating drones.
🔹 The correct method is PUT, which is the standard for updates.

✅ Modify droneRoutes.js
router.put("/:id", updateDroneById); // ✅ Changed from `router.post("/:id", updateDroneById);`

✅ Postman Test:
PUT /api/drones/1
{
  "model": "DJI Phantom",
  "weight": 2.5,
  "range_km": 15,
  "description": "Updated description"
}
 Expected Response:
 {
  "updated": true
}


2️⃣ Add Input Validation for model, weight, and range_km
🔹 This function ensures that all required fields are provided before adding or updating a drone.
🔹 Prevents invalid or missing data from entering the database.

✅ Modify droneController.js
const validateDroneData = (model, weight, range_km) => {
  if (!model || typeof model !== "string" || model.trim().length < 3) {
    return { valid: false, error: "Model name must be at least 3 characters long." };
  }
  if (isNaN(weight) || weight <= 0) {
    return { valid: false, error: "Weight must be a positive number." };
  }
  if (isNaN(range_km) || range_km <= 0) {
    return { valid: false, error: "Range must be a positive number." };
  }
  return { valid: true };
};

✅ Apply This Validation in droneRoutes.js
router.post("/", (req, res, next) => {
  const { model, weight, range_km } = req.body;
  const validation = validateDroneData(model, weight, range_km);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  next(); // Proceed to `addDrone` if validation passes
}, addDrone);

router.put("/:id", (req, res, next) => {
  const { model, weight, range_km } = req.body;
  const validation = validateDroneData(model, weight, range_km);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  next(); // Proceed to `updateDroneById` if validation passes
}, updateDroneById);

✅ Postman Test:
POST /api/drones
{
  "model": "",
  "weight": -1,
  "range_km": 0
}

Expected Response:

{
  "error": "Model name must be at least 3 characters long."
}


*/

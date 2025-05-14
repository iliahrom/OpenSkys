const dbSingleton = require("../dbSingleton"); // Importing the database connection instance

// ✅ This function retrieves all missions from the database
// 🔹 Used in the `GET /api/missions` route
const getMissions = (req, res) => {
  const sql = "SELECT * FROM missions"; // SQL query to fetch all missions
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res.json(results); // Return the list of missions
  });
};

// ✅ This function adds a new mission to the database
// 🔹 Used in the `POST /api/missions` route
const addMission = (req, res) => {
  const { drone_id, mission_name, location } = req.body; // Extract mission details from the request body

  // ✅ Input validation to ensure all required fields are provided
  if (!drone_id || !mission_name || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql =
    "INSERT INTO missions (drone_id, mission_name, location) VALUES (?, ?, ?)";
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, [drone_id, mission_name, location], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res
      .status(201)
      .json({ message: "Mission added successfully", id: result.insertId }); // Return success message and mission ID
  });
};

// ✅ This function deletes a mission from the database based on its ID
// 🔹 Used in the `DELETE /api/missions/:id` route
const deleteMission = (req, res) => {
  const missionId = req.params.id; // Extract mission ID from request parameters
  const sql = "DELETE FROM missions WHERE id = ?"; // SQL query to delete a mission by ID
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, [missionId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res.json({ message: "Mission deleted successfully" }); // Indicate that the mission was successfully deleted
  });
};

// ✅ Exporting all mission-related functions to be used in routes
module.exports = { getMissions, addMission, deleteMission };




















































/*
getMissions(req, res)	Retrieves all missions from the database	GET /api/missions
addMission(req, res)	Adds a new mission to the database	POST /api/missions
deleteMission(req, res)	Deletes a mission from the database by ID	DELETE /api/missions/:id

Postman Requests

Test GET /api/missions to retrieve all missions.
Test POST /api/missions with different input data.
Test DELETE /api/missions/:id with a valid and invalid ID.


1️⃣ Add Input Validation (Ensure Mission Names Are Unique)
🔹 This function checks if the mission name already exists before adding it.
🔹 If a duplicate is found, it prevents insertion.

✅ Modify missionController.js
const addMission = (req, res) => {
  const { drone_id, mission_name, location } = req.body;
  const db = dbSingleton.getConnection();

  if (!drone_id || !mission_name || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Check if the mission name already exists
  db.query("SELECT * FROM missions WHERE mission_name = ?", [mission_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ error: "Mission name already exists. Please choose a different name." });
    }

    // ✅ If mission name is unique, insert into the database
    db.query(
      "INSERT INTO missions (drone_id, mission_name, location, status) VALUES (?, ?, ?, 'In Progress')",
      [drone_id, mission_name, location],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Mission added successfully!", id: result.insertId });
      }
    );
  });
};

✅ Postman Test:
POST /api/missions
{
  "drone_id": 3,
  "mission_name": "Surveillance Mission",
  "location": "Tel Aviv"
}

POST /api/missions
{
  "drone_id": 3,
  "mission_name": "Surveillance Mission",
  "location": "Tel Aviv"
}

Expected Response if Duplicate Mission Name Exists:
{
  "error": "Mission name already exists. Please choose a different name."
}

2️⃣ Prevent Deletion of Active Missions (status Field)
🔹 This function prevents deletion of missions that are "In Progress".
🔹 Users can only delete missions marked as "Completed".

✅ Modify missionController.js
const deleteMission = (req, res) => {
  const missionId = req.params.id;
  const db = dbSingleton.getConnection();

  // ✅ Check mission status before deleting
  db.query("SELECT status FROM missions WHERE id = ?", [missionId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) return res.status(404).json({ error: "Mission not found" });

    if (results[0].status !== "Completed") {
      return res.status(400).json({ error: "Cannot delete an active mission. Mark it as 'Completed' first." });
    }

    // ✅ If mission is completed, delete it
    db.query("DELETE FROM missions WHERE id = ?", [missionId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Mission deleted successfully!" });
    });
  });
};

✅ Postman Test:
DELETE /api/missions/5


Expected Response if Mission Is Still Active:
{
  "error": "Cannot delete an active mission. Mark it as 'Completed' first."
}

3️⃣ Implement Role-Based Access Control (Admins Only for Deletion)
🔹 This function ensures that only admin users can delete missions.
🔹 Uses adminOnly middleware to restrict access.

✅ Modify missionRoutes.js
const { authenticateJWT, adminOnly } = require("../middleware/authMiddleware");

// ✅ Apply authentication and admin role check to delete route
router.delete("/:id", authenticateJWT, adminOnly, deleteMission);

✅ Postman Test:
DELETE /api/missions/5
Authorization: Bearer <non-admin-token>

Expected Response:
{
  "error": "Forbidden - Admins only"
}

*/

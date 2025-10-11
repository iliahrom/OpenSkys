const dbSingleton = require("../dbSingleton"); // Importing the database connection instance

// This function retrieves all missions from the database
// Used in the `GET /api/missions` route
// getMissions(req, res)
// Retrieves all missions from the database
// Parameters:
//     - req: Express request object (unused here)
//     - res: Express response object
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

// This function adds a new mission to the database
// Used in the `POST /api/missions` route
// addMission(req, res)
// Adds a new mission to the database
// Parameters:
//     - req.body = { drone_id, mission_name, location }
//     - res: Express response object
const addMission = (req, res) => {
  const { drone_id, mission_name, location } = req.body; // Extract mission details from the request body

  // Input validation to ensure all required fields are provided
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

// This function deletes a mission from the database based on its ID
// Used in the `DELETE /api/missions/:id` route
// deleteMission(req, res)
// Deletes a mission by its ID
// Parameters:
//     - req.params.id: ID of the mission to delete
//     - res: Express response object
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

// Exporting all mission-related functions to be used in routes
module.exports = { getMissions, addMission, deleteMission };

const dbSingleton = require("../dbSingleton"); // Importing the database connection instance

// This function retrieves all drones from the database
// Used in the `GET /api/drones` route
// getDrones(req, res)
// Retrieves all drones from the database
// Parameters: req - Express request, res - Express response
const getDrones = (req, res) => {
  const sql = "SELECT * FROM drones"; // SQL query to fetch all drones
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res.json(results); // Return the list of drones
  });
};

// This function retrieves a single drone by its ID
// Used in the `GET /api/drones/:id` route
// getDroneById(req, res)
// Retrieves a single drone by ID
// Parameters: req.params.id - drone ID, res - Express response
const getDroneById = (req, res) => {
  const sql = "SELECT * FROM drones WHERE id = ?"; // SQL query to fetch a drone by ID
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    if (!results.length) {
      return res.status(404).json({ error: "Drone not found" }); // Return 404 if drone doesn't exist
    }
    res.json(results[0]); // Return the found drone
  });
};

// This function updates a drone's details based on its ID
// Used in the `PUT /api/drones/:id` route
// updateDroneById(req, res)
// Updates drone data in the database based on its ID
// Parameters:
//    req.params.id - drone ID
//    req.body = { model, weight, range_km, description }
const updateDroneById = (req, res) => {
  const { model, weight, range_km, description } = req.body; // Extract drone details from the request body
  const sql =
    "UPDATE drones SET model = ?, weight = ?, range_km = ?, description = ? WHERE id = ?";
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(
    sql,
    [model, weight, range_km, description, req.params.id], // Bind values to SQL query
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message }); // Handle database errors
      }
      res.json({ updated: true }); // Indicate that the update was successful
    }
  );
};

// This function deletes a drone from the database based on its ID
// Used in the `DELETE /api/drones/:id` route
// deleteDroneById(req, res)
// Deletes a drone from the database by ID
// Parameters: req.params.id - drone ID, res - Express response
const deleteDroneById = (req, res) => {
  const sql = "DELETE FROM drones WHERE id = ?"; // SQL query to delete a drone by ID
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res.json({ deleted: true }); // Indicate that the drone was successfully deleted
  });
};

// This function adds a new drone to the database
// Used in the `POST /api/drones` route
// addDrone(req, res)
// Adds a new drone to the database
// Parameters:
//    req.body = { model, weight, range_km, description }
const addDrone = (req, res) => {
  const { model, weight, range_km, description } = req.body; // Extract drone details from the request body
  const sql =
    "INSERT INTO drones (model, weight, range_km, description) VALUES (?, ?, ?, ?)";
  const db = dbSingleton.getConnection(); // Get a connection to the database

  db.query(sql, [model, weight, range_km, description], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Handle database errors
    }
    res.json({ added: true }); // Indicate that the drone was successfully added
  });
};

// getDronesStartP(req, res)
// Retrieves drones where model name starts with "P"
// Parameters: req, res - standard Express request and response
const getDronesStartP = (req, res) => {
  const sql = "SELECT * FROM drones WHERE model LIKE 'P%'";
  const db = dbSingleton.getConnection();

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log(results);
    res.json(results);
  });
};

//Exporting all drone-related functions to be used in routes
module.exports = {
  getDrones,
  getDroneById,
  updateDroneById,
  deleteDroneById,
  addDrone,
};

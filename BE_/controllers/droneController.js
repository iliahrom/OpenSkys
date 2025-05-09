const dbSingleton = require("../dbSingleton"); // Importing the database connection instance

// ✅ This function retrieves all drones from the database
// 🔹 Used in the `GET /api/drones` route
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

// ✅ This function retrieves a single drone by its ID
// 🔹 Used in the `GET /api/drones/:id` route
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

// ✅ This function updates a drone's details based on its ID
// 🔹 Used in the `PUT /api/drones/:id` route
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

// ✅ This function deletes a drone from the database based on its ID
// 🔹 Used in the `DELETE /api/drones/:id` route
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

// ✅ This function adds a new drone to the database
// 🔹 Used in the `POST /api/drones` route
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

// ✅ Exporting all drone-related functions to be used in routes
module.exports = {
  getDrones,
  getDroneById,
  updateDroneById,
  deleteDroneById,
  addDrone
};



































































/*
getDrones(req, res)	Retrieves all drones from the database	GET /api/drones
getDroneById(req, res)	Retrieves a single drone by its ID	GET /api/drones/:id
updateDroneById(req, res)	Updates an existing drone by ID	PUT /api/drones/:id
deleteDroneById(req, res)	Deletes a drone from the database by ID	DELETE /api/drones/:id
addDrone(req, res)	Adds a new drone to the database	POST /api/drones

Postman Requests

Test GET /api/drones to retrieve all drones.
Test POST /api/drones with different input data.
Test GET /api/drones/:id with a valid and invalid ID.
Test PUT /api/drones/:id to update drone details.
Test DELETE /api/drones/:id to remove a drone.


1️⃣ Role-Based Authentication (Admin Only for Drone Management)
🔹 This function ensures that only admin users can add, update, or delete drones.
🔹 It checks if the logged-in user has an "admin" role before allowing access.

const adminOnly = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admins only" });
  }
  next(); // Proceed if the user is an admin
};

✅ Where to Use?

Apply this middleware to admin-only routes in droneRoutes.js.
router.post("/", adminOnly, addDrone);
router.put("/:id", adminOnly, updateDroneById);
router.delete("/:id", adminOnly, deleteDroneById);


2️⃣ Enhanced Drone Model Validation
🔹 This function validates drone details before inserting/updating.
🔹 Ensures model name is not empty and range is a positive number.
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

✅ Where to Use?

Modify addDrone and updateDroneById to validate input before saving:"

const validation = validateDroneData(model, weight, range_km);
if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}

3️⃣ Search Drones by Model Name
🔹 This function allows users to search for drones by model name.
🔹 It retrieves drones that contain the search query in their model name.
const searchDrones = (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Search query is required." });

  const sql = "SELECT * FROM drones WHERE model LIKE ?";
  const db = dbSingleton.getConnection();

  db.query(sql, [`%${query}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};


✅ Where to Use?

Add a new route in droneRoutes.js:
router.get("/search", searchDrones);

Test in Postman:
GET /api/drones/search?query=Phantom

*/

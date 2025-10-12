const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getConnection(); //get connection to DB

// Save a new flight to flight_history table
// Request body: { user_id, path_name?, points[] }
// Converts points array to comma-separated string before saving
router.post("/save", async (req, res) => {
  const { user_id, path_name, points } = req.body;
  console.log("Saving flight history:", { user_id, path_name, points });
  //Validation: user_id and points are required
  if (!user_id || !points)
    return res.status(400).json({ error: "Missing data" });

  try {
    await db.query(
      `INSERT INTO flight_history (user_id, path_name, points) VALUES (?, ?, ?)`,
      [user_id, path_name || "", points.join(",")]
    );
    res.json({ message: "Flight history saved" });
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ error: "Failed to save flight history" });
  }
});

// Gets the last 10 flights for a specific user
// Query param: user_id
// Response: JSON array of last 10 flight records for the user
router.get("/latest", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const [rows] = await db.execute(
      `SELECT * FROM flight_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.get("/download", (req, res) => {
  const user = req.session.user; // get the connected user from the session

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let query = "";
  let params = [];

  //if the user rule is admin - pull all history
  if (user.role === "admin") {
    query = `
      SELECT f.id, f.user_id, u.username, f.path_name, f.points, f.timestamp
      FROM flight_history f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.timestamp DESC
    `;
  } else {
    //regular user can download only his history
    query = `
      SELECT f.id, f.user_id, u.username, f.path_name, f.points, f.timestamp
      FROM flight_history f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.timestamp DESC
    `;
    params = [user.id];
  }

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("CSV Download error:", err);
      return res.status(500).json({ error: "CSV generation failed" });
    }

    if (!rows.length) {
      return res.status(404).json({ error: "No history found" });
    }

    const csv = [
      ["id", "username", "path_name", "points", "timestamp"], // headers
      ...rows.map((row) => [
        row.id,
        row.username,
        `"${row.path_name}"`,
        `"${row.points}"`,
        row.timestamp,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=flight_history_${
        user.role === "admin" ? "all" : user.username
      }.csv`
    );
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  });
});


module.exports = router;

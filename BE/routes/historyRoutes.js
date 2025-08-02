const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getConnection(); // ✅ get the real connection

// Save a flight
router.post("/save", async (req, res) => {
  const { user_id, path_name, points } = req.body;
  console.log("Saving flight history:", { user_id, path_name, points }); // ✅ Add this

  if (!user_id || !points)
    return res.status(400).json({ error: "Missing data" });

  try {
    await db.query(
      `INSERT INTO flight_history (user_id, path_name, points) VALUES (?, ?, ?)`,
      [user_id, path_name || "", points.join(",")]
    );
    res.json({ message: "Flight history saved" });
  } catch (err) {
    console.error("❌ Error saving history:", err);
    res.status(500).json({ error: "Failed to save flight history" });
  }
});

// Get latest 10 flights for a user
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
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/// 🚀 Download full flight history as CSV with username
router.get("/download", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const query = `
    SELECT f.id, f.user_id, u.username, f.path_name, f.points, f.timestamp
    FROM flight_history f
    JOIN users u ON f.user_id = u.id
    WHERE f.user_id = ?
  `;

  db.query(query, [user_id], (err, rows) => {
    if (err) {
      console.error("❌ CSV Download error:", err);
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
      "attachment; filename=flight_history.csv"
    );
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  });
});

module.exports = router;

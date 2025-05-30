const express = require("express");
const db = require("../dbSingleton");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/points/:label
 * @desc    Save or update position and command sequence for a flight point
 * @access  Admin only
 */
router.post("/:label", adminMiddleware, async (req, res) => {
  const { label } = req.params;
  const { x = 0, y = 0, commands = [] } = req.body;

  const commandString = Array.isArray(commands) ? commands.join(",") : "";

  console.log("🔗 Saving to DB:", {
    label: label.toUpperCase(),
    commandString,
    x,
    y,
  });

  try {
    const connection = db.getConnection();

    const query = `
      REPLACE INTO point_commands (point_label, command_sequence, x_offset, y_offset)
      VALUES (?, ?, ?, ?)
    `;

    await connection
      .promise()
      .query(query, [label.toUpperCase(), commandString, x, y]);

    res.json({
      message: `✅ Point '${label}' saved with position and commands.`,
    });
  } catch (error) {
    console.error("❌ Error saving point:", error.message, error);
    res.status(500).json({ error: "Failed to save point." });
  }
});

/**
 * @route   GET /api/points
 * @desc    Retrieve all stored points with their positions and commands
 */
router.get("/", async (req, res) => {
  try {
    const connection = db.getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM point_commands");

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching points:", error.message, error);
    res.status(500).json({ error: "Failed to fetch points." });
  }
});

module.exports = router;

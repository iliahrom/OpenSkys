const express = require("express");
const db = require("../dbSingleton");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/points/:label
 * @desc    Save or update command sequence and position for a flight point
 * @access  Admin only
 */
router.post("/:label", adminMiddleware, async (req, res) => {
  const { label } = req.params;
  const { commands, x = 0, y = 0 } = req.body;

  // Debug log
  console.log("📥 POST /api/points:", {
    label,
    commands,
    x,
    y,
    user: req.session?.user,
  });

  if (!commands || !Array.isArray(commands)) {
    return res
      .status(400)
      .json({ error: "Commands must be a non-empty array." });
  }

  try {
    const connection = db.getConnection();

    const query = `
      REPLACE INTO point_commands (point_label, command_sequence, x, y)
      VALUES (?, ?, ?, ?)
    `;

    await connection
      .promise()
      .query(query, [label.toUpperCase(), commands.join(","), x, y]);

    res.json({ message: `✅ Commands for point '${label}' saved.` });
  } catch (error) {
    console.error("❌ Error saving point commands:", error.message, error);
    res.status(500).json({ error: "Failed to save point commands." });
  }
});

/**
 * @route   GET /api/points
 * @desc    Retrieve all stored point commands
 * @access  Optional: can add authMiddleware if needed
 */
router.get("/", async (req, res) => {
  try {
    const connection = db.getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM point_commands");

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching point commands:", error.message, error);
    res.status(500).json({ error: "Failed to fetch point commands." });
  }
});

module.exports = router;

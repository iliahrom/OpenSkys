const express = require("express");
const router = express.Router();
const db = require("../dbSingleton");
const { runCommandSequence } = require("../controllers/telloCommandRunner");

function getMovementCommands(from, to) {
  const cmds = [];
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Move in Y first (forward/back)
  if (dy > 0) cmds.push(`forward ${dy}`);
  else if (dy < 0) cmds.push(`back ${Math.abs(dy)}`);

  // Then move in X (right/left)
  if (dx > 0) cmds.push(`right ${dx}`);
  else if (dx < 0) cmds.push(`left ${Math.abs(dx)}`);

  return cmds;
}

router.post("/:start/:end", async (req, res) => {
  const { start, end } = req.params;

  try {
    const [rows] = await db
      .getConnection()
      .promise()
      .query("SELECT label, x, y FROM flight_points WHERE label IN (?, ?, ?)", [
        "BASE",
        start,
        end,
      ]);

    const base = rows.find((r) => r.label === "BASE");
    const startPoint = rows.find((r) => r.label === start);
    const endPoint = rows.find((r) => r.label === end);

    if (!base || !startPoint || !endPoint) {
      return res.status(404).json({ error: "One or more points not found." });
    }

    const commands = ["command", "takeoff"];
    commands.push(...getMovementCommands(base, startPoint)); // BASE → Start
    commands.push(...getMovementCommands(startPoint, endPoint)); // Start → End
    commands.push(...getMovementCommands(endPoint, base)); // End → BASE
    commands.push("land");

    await runCommandSequence(commands); // Send with delay

    res.json({ message: "Full route executed", commands });
  } catch (err) {
    console.error("❌ Movement Error:", err);
    res.status(500).json({ error: "Movement execution failed" });
  }
});

module.exports = router;

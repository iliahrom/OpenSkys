const express = require("express");
const router = express.Router();
const db = require("../dbSingleton");

// saves a new path
router.post("/", async (req, res) => {
  const { name, points } = req.body;

  if (!name || !Array.isArray(points) || points.length === 0) {
    return res.status(400).json({ error: "Name and points are required" });
  }

  try {
    const [result] = await db
      .getConnection()
      .promise()
      .execute("INSERT INTO paths (name) VALUES (?)", [name]);

    const pathId = result.insertId;

    for (let i = 0; i < points.length; i++) {
      await db
        .getConnection()
        .promise()
        .execute(
          "INSERT INTO path_points (path_id, point_name, position) VALUES (?, ?, ?)",
          [pathId, points[i], i]
        );
    }
    res.json({ status: "Path saved", id: pathId });
  } catch (err) {
    console.error("Error saving path:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// pulls out all paths with the points
router.get("/", async (req, res) => {
  try {
    const [paths] = await db
      .getConnection()
      .promise()
      .execute("SELECT * FROM paths");

    const [pathPoints] = await db
      .getConnection()
      .promise()
      .execute("SELECT * FROM path_points ORDER BY path_id, position");

    const data = paths.map((path) => ({
      ...path,
      points: pathPoints
        .filter((p) => p.path_id === path.id)
        .map((p) => p.point_name),
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching paths:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

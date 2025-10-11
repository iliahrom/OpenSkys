const express = require("express");
const router = express.Router();
const dgram = require("dgram");
const client = dgram.createSocket("udp4"); //UDP socket used to communicate with Tello drone
const db = require("../dbSingleton").getConnection(); //Database connection instance

// Load step size from database at startup
db.query("SELECT step_size_cm FROM settings LIMIT 1", (err, result) => {
  if (err) {
    console.error("Error loading step size:", err);
  } else {
    console.log("Query result:", result);
  }

  if (!err && result.length > 0) {
    global.stepSizeInCm = result[0].step_size_cm;
    console.log(`Loaded step size from DB: ${global.stepSizeInCm} cm`);
  } else {
    global.stepSizeInCm = 20;
    console.log("Default step size set to 20 cm");
  }
});

let batteryLevel = 100; // battery level in percentage
let facingAngle = 0; // facing "up" (0°), full 360° supported

//Returns a promise that resolves after `timeInMs` (used for artificial delay)
const sleep = (timeInMs) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
};
//Sends a command to the drone and waits for the response
const sendCommand = (cmd) => {
  return new Promise((resolve) => {
    //listener is added on every call, leading to memory leaks
    client.on("message", (msg, rinfo) => {
      setTimeout(() => {
        resolve(msg.toString().trim());
      }, 1500);
    });
    client.send(cmd, 0, cmd.length, 8889, "192.168.10.1");
  });
};

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360; //Ensures angle stays within (0, 360)

// Rotates drone clockwise (cw) or counterclockwise (ccw) to face a desired direction
// Input: targetAngle (in degrees)
// Uses global `facingAngle` to track and update orientation
const rotateToAngle = async (targetAngle) => {
  const current = normalizeAngle(facingAngle);
  const target = normalizeAngle(targetAngle);
  let diff = normalizeAngle(target - current);

  if (diff === 0) return;

  if (diff <= 180) {
    await sendCommand(`cw ${diff}`);
  } else {
    await sendCommand(`ccw ${360 - diff}`);
  }

  facingAngle = target;
};
// Moves the drone from current position to a target point in grid
// Inputs:
//    - point: name of the destination point (e.g., "A", "B", etc.)
//    - currentPos: object with {row, col}
//    - gridCoordinates: map of pointName → {row, col}
let currentPoint = null;
const goToPoint = async (point, currentPos, gridCoordinates) => {
  const target = gridCoordinates[point];
  const dx = target.col - currentPos.col;
  const dy = target.row - currentPos.row;

  if (dx === 0 && dy === 0) return;

  // Angle in radians: atan2 returns clockwise from positive X (East)
  const angleRad = Math.atan2(dy, dx); // angle in radians
  let angleDeg = normalizeAngle((angleRad * 180) / Math.PI - 90); // Tello: 0° = up

  angleDeg = Math.round(angleDeg / 5) * 5; // Round to nearest 5° (Tello safe)

  // Distance in cm
  const distance = Math.round(
    Math.sqrt(dx * dx + dy * dy) * global.stepSizeInCm
  );

  await rotateToAngle(angleDeg);
  currentPoint = point;
  await sendCommand(`forward ${distance}`);

  // Update position and facing
  currentPos.col = target.col;
  currentPos.row = target.row;
  facingAngle = angleDeg;
};
// Fetches point layout from the database (row/col for each named point)
// Returns a map: { A: {row, col}, B: {row, col}, ... }
const getGridCoordinates = () =>
  new Promise((resolve) => {
    const sql = "SELECT id, name, row, col FROM points ORDER BY id ASC";

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      resolve(
        results.reduce((acc, point) => {
          acc[point.name] = { col: point.col, row: point.row };
          return acc;
        }, {})
      );
    });
  });

// Main route to simulate a full flight sequence based on a point path
// Input: { path: [ "A", "C", "F" ] }
// Logic:
//   - Initialize drone
//   - Takeoff
//   - Fly to all points
//   - Simulate drop (down, sleep, up)
//   - Return to BASE and land
router.post("/", async (req, res) => {
  const { path } = req.body;

  if (!Array.isArray(path) || path.length < 2) {
    return res
      .status(400)
      .json({ error: "Path must contain at least two points" });
  }

  try {
    const gridCoordinates = await getGridCoordinates();
    let currentPos = { ...gridCoordinates.BASE };
    facingAngle = 0;

    await sendCommand("command");
    batteryLevel = await sendCommand("battery?");

    await sendCommand("takeoff");

    for (const point of path) {
      await goToPoint(point, currentPos, gridCoordinates);
      batteryLevel = await sendCommand("battery?");
    }

    // Drop shipment, hovering for 5 seconds
    await sendCommand("down 20");
    await sleep(5000);
    await sendCommand("up 20");

    await goToPoint("BASE", currentPos, gridCoordinates);
    await rotateToAngle(0);
    await sendCommand("land");
    batteryLevel = await sendCommand("battery?");

    return res.json({ status: "OK" });
  } catch (err) {
    console.error("Error during flight:", err);
    return res.status(500).json({ error: "Flight failed" });
  }
});
// Endpoint to check latest known battery level
// Useful for displaying drone status on UI
router.get("/battery", async (req, res) => {
  return res.json({ batteryLevel });
});
// Return the current live point the drone is flying over
router.get("/position", (req, res) => {
  res.json({ currentPoint });
});

// Endpoint to get current step size (for admin UI)
router.get("/step-size", (req, res) => {
  res.json({ stepSizeInCm: global.stepSizeInCm });
});
// Update step size (admin only)
router.post("/step-size", async (req, res) => {
  const { newStepSize } = req.body;

  if (
    typeof newStepSize !== "number" ||
    newStepSize < 20 ||
    newStepSize > 500
  ) {
    return res
      .status(400)
      .json({ error: "Step size must be between 20 and 500 cm" });
  }

try {
  global.stepSizeInCm = newStepSize;

  // Save to database (Promise-based)
  await db
    .promise()
    .query("UPDATE settings SET step_size_cm = ? WHERE id = 1", [newStepSize]);

  console.log(`Step size updated to: ${newStepSize} cm`);
  res.json({ message: "Step size updated", stepSizeInCm: newStepSize });
} catch (err) {
  console.error("Failed to update step size in DB:", err);
  res.status(500).json({ error: "Database update failed" });
}

});

module.exports = router;

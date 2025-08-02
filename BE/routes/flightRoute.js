const express = require("express");
const router = express.Router();
const dgram = require("dgram");
const client = dgram.createSocket("udp4");
const db = require("../dbSingleton").getConnection();

const stepSizeInCm = 20; // each grid step in cm
let batteryLevel = 100; // battery level in percentage

let facingAngle = 0; // facing "up" (0°), full 360° supported

const sleep = (timeInMs) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
};

const sendCommand = (cmd) => {
  return new Promise((resolve) => {
    client.on("message", (msg, rinfo) => {
      setTimeout(() => {
        resolve(msg.toString().trim());
      }, 1500);
    });
    client.send(cmd, 0, cmd.length, 8889, "192.168.10.1");
  });
};

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

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
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy) * stepSizeInCm);

  await rotateToAngle(angleDeg);
  await sendCommand(`forward ${distance}`);

  // Update position and facing
  currentPos.col = target.col;
  currentPos.row = target.row;
  facingAngle = angleDeg;
};

const getGridCoordinates = () =>
  new Promise((resolve) => {
    const sql = "SELECT id, name, row, col FROM points ORDER BY id ASC";

    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Database error:", err);
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

    // Drop shipment
    await sendCommand("down 20");
    await sleep(5000);
    await sendCommand("up 20");

    await goToPoint("BASE", currentPos, gridCoordinates);
    await rotateToAngle(0);
    await sendCommand("land");
    batteryLevel = await sendCommand("battery?");

    return res.json({ status: "OK" });
  } catch (err) {
    console.error("❌ Error during flight:", err);
    return res.status(500).json({ error: "Flight failed" });
  }
});

router.get("/battery", async (req, res) => {
  return res.json({ batteryLevel });
});

module.exports = router;

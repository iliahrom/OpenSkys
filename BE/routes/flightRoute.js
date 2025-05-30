const express = require('express');
const router = express.Router();
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const db = require('../dbSingleton').getConnection();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendCommandSmart = (cmd) => {
  return new Promise((resolve) => {
    let delayMs = 1000;
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd.includes("takeoff") || lowerCmd.includes("land")) {
      delayMs = 3000;
    } else if (
      lowerCmd.startsWith("forward") ||
      lowerCmd.startsWith("back") ||
      lowerCmd.startsWith("left") ||
      lowerCmd.startsWith("right")
    ) {
      const parts = lowerCmd.split(" ");
      const dist = parseInt(parts[1]) || 0;
      delayMs = 1000 + dist * 10;
    }

    console.log("📡 Sending:", cmd, "| Delay:", delayMs);
    client.send(cmd, 0, cmd.length, 8889, '192.168.10.1', () => {
      setTimeout(resolve, delayMs);
    });
  });
};

const moveInSteps = async (direction, distance) => {
  const MAX = 500;
  let remaining = Math.abs(distance);
  while (remaining > 0) {
    const step = Math.min(MAX, remaining);
    await sendCommandSmart(`${direction} ${step}`);
    remaining -= step;
  }
};

router.post('/', async (req, res) => {
  const { path } = req.body;

  if (!Array.isArray(path) || path.length < 2) {
    return res.status(400).json({ error: 'Path must contain at least two points' });
  }

  try {
    // 1. נמשוך את כל הנקודות הרלוונטיות מה-DB
    const placeholders = path.map(() => '?').join(',');
    const [rows] = await db.promise().query(
      `SELECT name, col, row FROM points WHERE name IN (${placeholders})`,
      path
    );

    // 2. נהפוך את התוצאה למפה לשם מהיר
    const pointMap = {};
    rows.forEach(p => pointMap[p.name] = { col: p.col, row: p.row });

    const unit = 100;

    await sendCommandSmart('command');
    await sendCommandSmart('takeoff');
    await delay(5000);

    for (let i = 0; i < path.length - 1; i++) {
      const from = pointMap[path[i]];
      const to = pointMap[path[i + 1]];

      if (!from || !to) continue;

      const dCol = to.col - from.col;
      const dRow = to.row - from.row;

      const rowDist = Math.abs(dRow) * unit;
      const colDist = Math.abs(dCol) * unit;

      if (rowDist >= 20) {
        await moveInSteps(dRow > 0 ? 'forward' : 'back', rowDist);
      }
      if (colDist >= 20) {
        await moveInSteps(dCol > 0 ? 'right' : 'left', colDist);
      }
    }

    await sendCommandSmart('land');
    res.json({ status: 'OK' });

  } catch (err) {
    console.error("❌ Flight failed:", err);
    res.status(500).json({ error: 'Failed to send flight path' });
  }
});

module.exports = router;

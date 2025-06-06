const express = require('express');
const router = express.Router();
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const gridCoordinates = {
  A: { col: 0, row: 0 },
  B: { col: 1, row: 0 },
  C: { col: 2, row: 0 },
  D: { col: 0, row: 1 },
  E: { col: 1, row: 1 },
  F: { col: 2, row: 1 },
  G: { col: 0, row: 2 },
  H: { col: 1, row: 2 },
  I: { col: 2, row: 2 },
};

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

  const unit = 100;

  try {
    console.log("🔁 Sending 'command'...");
    await sendCommandSmart('command');

    console.log("🛫 Sending 'takeoff'...");
    await sendCommandSmart('takeoff');

    console.log("⏳ Stabilizing...");
    await delay(5000);

    for (let i = 0; i < path.length - 1; i++) {
      const from = gridCoordinates[path[i]];
      const to = gridCoordinates[path[i + 1]];

      if (!from || !to) continue;

      const dCol = to.col - from.col;
      const dRow = to.row - from.row;

      const rowDist = Math.abs(dRow) * unit;
      const colDist = Math.abs(dCol) * unit;

      if (rowDist >= 20) {
        console.log("⬆️ Rows:", dRow);
        await moveInSteps(dRow > 0 ? 'forward' : 'back', rowDist);
      }
      if (colDist >= 20) {
        console.log("➡️ Cols:", dCol);
        await moveInSteps(dCol > 0 ? 'right' : 'left', colDist);
      }
    }

    console.log("🛬 Sending 'land'...");
    await sendCommandSmart('land');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error("❌ Flight failed:", err);
    res.status(500).json({ error: 'Failed to send flight path' });
  }
});

module.exports = router;






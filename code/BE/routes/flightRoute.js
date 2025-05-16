const express = require('express');
const router = express.Router();
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const pointCoordinates = {
  A: { x: 0, y: 0 },
  B: { x: 50, y: 0 },
  C: { x: 100, y: 0 },
  D: { x: 0, y: 50 },
  E: { x: 50, y: 50 },
  F: { x: 200, y:150 },
  G: { x: 0, y: 100 },
  H: { x: 50, y: 100 },
  I: { x: 200, y: 200 },
};

const sendCommand = (cmd, delay = 1000) => {
  return new Promise((resolve) => {
    console.log("Sending:", cmd);
    client.send(cmd, 0, cmd.length, 8889, '192.168.10.1', () => {
      setTimeout(resolve, delay);
    });
  });
};

router.post('/', async (req, res) => {
  const { from, to } = req.body;
  const start = pointCoordinates[from];
  const end = pointCoordinates[to];

  if (!start || !end) return res.status(400).json({ error: 'Invalid points' });

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  try {
    await sendCommand('command');
    await sendCommand('takeoff');

    if (dy !== 0) {
      await sendCommand(dy > 0 ? `forward ${Math.abs(dy)}` : `back ${Math.abs(dy)}`);
    }
    if (dx !== 0) {
      await sendCommand(dx > 0 ? `right ${Math.abs(dx)}` : `left ${Math.abs(dx)}`);
    }

    await sendCommand('land');
    res.json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send commands' });
  }
});

module.exports = router;

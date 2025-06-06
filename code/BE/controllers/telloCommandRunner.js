const dgram = require("dgram");
const client = dgram.createSocket("udp4");

const TELLO_IP = "192.168.10.1";
const TELLO_PORT = 8889;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getDelayForCommand(cmd) {
  const base = cmd.trim().split(" ")[0];

  const customDelays = {
    command: 1000,
    takeoff: 5000,
    land: 6000,
    forward: 2000,
    back: 2000,
    left: 2000,
    right: 2000,
    up: 2000,
    down: 2000,
    flip: 5000,
    cw: 3000,
    ccw: 3000,
  };

  // Default delay if command is unknown
  return customDelays[base] || 6000;
}
function sendCommand(cmd) {
  return new Promise((resolve, reject) => {
    let acknowledged = false;

    const timeout = setTimeout(() => {
      if (!acknowledged) {
        console.warn(
          `⚠️ No response for "${cmd}", assuming execution succeeded.`
        );
        resolve(); // Soft fallback
      }
    }, 5000); // 5 seconds

    const onMessage = (msg) => {
      acknowledged = true;
      clearTimeout(timeout);
      client.off("message", onMessage);
      const response = msg.toString().trim();

      if (response === "ok") {
        console.log(`✅ OK received for: "${cmd}"`);
        resolve();
      } else {
        console.error(`❌ Error response for "${cmd}": ${response}`);
        reject(new Error(`Tello error: ${response}`));
      }
    };

    client.once("message", onMessage);

    client.send(cmd, 0, cmd.length, TELLO_PORT, TELLO_IP, (err) => {
      if (err) {
        clearTimeout(timeout);
        client.off("message", onMessage);
        reject(err);
      } else {
        console.log(`➡️ Sent: "${cmd}"`);
      }
    });
  });
}

// async function runCommandSequence(commands) {
//   for (let i = 0; i < commands.length; i++) {
//     const cmd = commands[i];
//     console.log("➡️ Sending:", cmd);
//     try {
//       await sendCommand(cmd); // ✅ Wait for Tello "ok"
//       await delay(getDelayForCommand(cmd)); // Optional wait after
//     } catch (err) {
//       console.error("❌ Command failed:", cmd, err.message);
//       break; // stop sequence if anything fails
//     }
//   }
// }
async function runCommandSequence(commands) {
  for (const cmd of commands) {
    console.log("🚀 Executing:", cmd);
    await sendCommand(cmd);
    await delay(getDelayForCommand(cmd)); // optional delay between commands
  }
}

module.exports = { runCommandSequence };

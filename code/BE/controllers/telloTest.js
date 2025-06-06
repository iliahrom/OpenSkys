// ✅ telloTest.js
const dgram = require("dgram");
const client = dgram.createSocket("udp4");

const TELLO_IP = "192.168.10.1";
const TELLO_PORT = 8889;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sendCommand(cmd) {
  return new Promise((resolve, reject) => {
    let acknowledged = false;

    const timeout = setTimeout(() => {
      if (!acknowledged) {
        console.warn(`⚠️ No response for "${cmd}", assuming it was executed.`);
        resolve(); // Soft resolve even without 'ok'
      }
    }, 5000);

    const onMessage = (msg) => {
      acknowledged = true;
      clearTimeout(timeout);
      client.off("message", onMessage);
      const res = msg.toString().trim();
      console.log("📥 Response:", res);
      if (res === "ok") resolve();
      else reject(new Error(`Drone error: ${res}`));
    };

    client.once("message", onMessage);

    client.send(cmd, 0, cmd.length, TELLO_PORT, TELLO_IP, (err) => {
      if (err) {
        clearTimeout(timeout);
        client.off("message", onMessage);
        reject(err);
      } else {
        console.log("➡️ Sent:", cmd);
      }
    });
  });
}

async function runTestSequence() {
  try {
    console.log(
      "\n🔁 Starting Tello Test Sequence\n--------------------------"
    );

    console.log("Step 1: Sending 'command'");
    await sendCommand("command");
    // await delay(2000); // ⏳ more time to settle

    // console.log("Step 2: Sending 'command' again for safety");
    // await sendCommand("command");
    // await delay(2000);

    console.log("Step 3: Sending 'takeoff'");
    await sendCommand("takeoff");
    await delay(3000);

    console.log("Step 4: Moving forward");
    await sendCommand("forward 30");
    await delay(4000);

    await sendCommand("ccw 90");
    await delay(4000);

    await sendCommand("forward 50");
    await delay(2000);
    console.log("Step 5: Landing");
    await sendCommand("land");
    await delay(5000);

    console.log("✅ Test completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}
client.bind(8889, () => {
  console.log("📡 Listening for Tello responses...");
});
runTestSequence();

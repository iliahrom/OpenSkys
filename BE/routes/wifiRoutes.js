const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

// סריקת כל רשתות WiFi זמינות (Windows בלבד, גמיש יותר בזיהוי SSID)
router.get("/", (req, res) => {
  exec("netsh wlan show networks mode=bssid", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error scanning WiFi:", err);
      return res.status(500).json({ error: "Failed to scan WiFi" });
    }

    const networks = new Set();
    const lines = stdout.split("\n");
    lines.forEach((line) => {
      const clean = line.trim();
      if (clean.startsWith("SSID ")) {
        const parts = clean.split(":");
        if (parts[1]) {
          const ssid = parts[1].trim();
          if (ssid.length > 0) {
            networks.add(ssid);
          }
        }
      }
    });

    res.json({ networks: Array.from(networks) });
  });
});

// התחברות לרשת WiFi לפי שם
router.post("/connect", (req, res) => {
  const { ssid } = req.body;
  if (!ssid) {
    return res.status(400).json({ error: "SSID is required" });
  }

  exec(`netsh wlan connect name="${ssid}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error connecting to WiFi:", err);
      return res.status(500).json({ error: "Failed to connect to WiFi" });
    }

    console.log(`📶 Connected to WiFi: ${ssid}`);
    res.json({ message: `Connected to ${ssid}` });
  });
});

module.exports = router;



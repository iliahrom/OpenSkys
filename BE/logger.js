// ✅ Middleware for logging HTTP requests
// 🔹 This middleware logs each incoming request with its timestamp, method, and URL
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Logs the current timestamp, HTTP method (GET, POST, etc.), and requested URL

  next(); // Calls the next middleware or route handler
};

// ✅ Exporting the logger middleware so it can be used in `app.js`
module.exports = logger;

/*
new Date().toISOString()	Logs the current timestamp in a standard format
${req.method}	Logs the HTTP request method (GET, POST, etc.)
${req.url}	Logs the requested route (e.g., /api/drones)
next()	Ensures the request continues to the next middleware or controller



Postman Requests

Send requests to any endpoint (e.g., GET /api/drones) and check if logs appear in the console.
Possible Exam Tasks

Store logs in a file instead of the console (e.g., using fs.appendFile).
Filter log levels (only log POST, PUT, and DELETE requests).
Improve logging format (e.g., include request headers or IP address).

1️⃣ Store Logs in a File Instead of Console (fs.appendFile)
🔹 This function writes logs to a file instead of printing them to the console.
🔹 Uses fs.appendFile to store logs in server.log.

✅ Modify logger.js
const fs = require("fs");
const path = require("path");

// ✅ Define the log file path
const logFilePath = path.join(__dirname, "server.log");

// ✅ Function to write logs to a file
const writeLogToFile = (message) => {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("❌ Error writing log:", err);
  });
};

// ✅ Middleware for logging HTTP requests
const logger = (req, res, next) => {
  const logMessage = `${req.method} ${req.url} - IP: ${req.ip}`;
  writeLogToFile(logMessage);
  next();
};

module.exports = logger;

✅ Postman Test:

Send any request (e.g., GET /api/drones).
Check server.log for entries.


 Expected Log Entry in server.log:
 [2024-03-05T12:34:56.789Z] GET /api/drones - IP: 127.0.0.1


 2️⃣ Filter Log Levels (Only Log POST, PUT, and DELETE Requests)
🔹 This function logs only modification requests (POST, PUT, DELETE).
🔹 Ignores GET requests to reduce log clutter.

✅ Modify logger.js
const logger = (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const logMessage = `${req.method} ${req.url} - IP: ${req.ip}`;
    writeLogToFile(logMessage);
  }
  next();
};

✅ Postman Test:

Send GET /api/drones → No log entry
Send POST /api/drones → ✅ Log entry is created

Expected Log Entry in server.log:
[2024-03-05T12:34:56.789Z] POST /api/drones - IP: 127.0.0.1

3️⃣ Improve Logging Format (Include Headers and IP Address)
🔹 This function adds request headers for better debugging.
🔹 Logs user agent, authorization token, and IP address.

✅ Modify logger.js
const logger = (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const authHeader = req.headers["authorization"] || "No Auth Token";
    const logMessage = `${req.method} ${req.url} - IP: ${req.ip} - User-Agent: ${userAgent} - Auth: ${authHeader}`;
    writeLogToFile(logMessage);
  }
  next();
};
✅ Postman Test:

Send a POST request with Authorization header.
Check server.log.

 Expected Log Entry in server.log:
 [2024-03-05T12:34:56.789Z] POST /api/drones - IP: 127.0.0.1 - User-Agent: Mozilla/5.0 - Auth: Bearer <token>

*/

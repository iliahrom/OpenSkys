// Middleware for logging HTTP requests
// This middleware logs each incoming request with its timestamp, method, and URL
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Logs the current timestamp, HTTP method (GET, POST, etc.), and requested URL

  next(); // Calls the next middleware or route handler
};

// Exporting the logger middleware so it can be used in `app.js`
module.exports = logger;


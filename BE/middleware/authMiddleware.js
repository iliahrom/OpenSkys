// Middleware to check if the user is authenticated
// This middleware ensures that only logged-in users can access protected routes
// Parameters:
//     - req: Express request object (should contain session info)
//     - res: Express response object
//     - next: Function to pass control to the next middleware/controller

const authMiddleware = (req, res, next) => {
  // Check if the user is logged in (session exists)
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" }); // Return 401 if no session exists
  }
  next(); // Proceed to the next middleware or controller
};

// Middleware to check if the user is an admin
// This middleware ensures that only admin users can access certain routes
// Parameters:
//     - req: Express request object (should contain session + user role)
//     - res: Express response object
//     - next: Function to pass control to the next middleware/controller
const adminMiddleware = (req, res, next) => {
  // Check if the user is logged in and has an "admin" role
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admins only" }); // Return 403 if not an admin
  }
  next(); // Proceed to the next middleware or controller
};

// Exporting both middleware functions so they can be used in routes
module.exports = { authMiddleware, adminMiddleware };

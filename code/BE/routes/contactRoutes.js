const express = require("express"); // Importing Express to define routes
const dbSingleton = require("../dbSingleton"); // Importing the database connection instance

const router = express.Router(); // Create an Express router instance

// ✅ Route to handle contact form submissions
// 🔹 Used in `POST /api/contact`
// 🔹 Saves the user's name, email, and message in the database
router.post("/", (req, res) => {
  const { name, email, message } = req.body; // Extract data from request body

  console.log("📩 Received request:", req.body); // Debugging log

  // ✅ Validate input: Ensure all required fields are provided
  if (!name || !email || !message) {
    console.log("⛔ Missing fields:", { name, email, message }); // Log missing fields
    return res.status(400).json({ error: "All fields are required" }); // Return error response
  }

  const db = dbSingleton.getConnection(); // Get a connection to the database

  // ✅ Insert the contact message into the database
  db.query(
    "INSERT INTO contact (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) {
        console.log("⛔ Database error:", err.message); // Log database errors
        return res.status(500).json({ error: err.message }); // Return error response
      }
      res.status(201).json({ message: "Message saved successfully!" }); // Return success response
    }
  );
});

// ✅ Exporting the router to be used in `app.js`
module.exports = router;















































/*
/api/contact	POST	Saves a contact form message in the database	{ "name": "John", "email": "john@example.com", "message": "Hello!" }

Postman Requests

Test POST /api/contact with different input data.
Test POST /api/contact with missing fields (should return 400 Bad Request).
Test POST /api/contact with invalid email format (if validation is added).


1️⃣ Add Email Format Validation
🔹 This function ensures the email is valid before saving it to the database.
🔹 Uses a regular expression to validate the email format.

✅ Modify contactRoutes.js
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email validation
  return emailRegex.test(email);
};

router.post("/", (req, res) => {
  const { name, email, message } = req.body;

  console.log("📩 Received request:", req.body);

  // ✅ Validate email format
  if (!validateEmail(email)) {
    console.log("⛔ Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!name || !email || !message) {
    console.log("⛔ Missing fields:", { name, email, message });
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = dbSingleton.getConnection();
  db.query(
    "INSERT INTO contact (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err) => {
      if (err) {
        console.log("⛔ Database error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Message saved successfully!" });
    }
  );
});

Postman Test:
POST /api/contact
{
  "name": "John Doe",
  "email": "invalid-email",
  "message": "Hello!"
}
POST /api/contact
{
  "name": "John Doe",
  "email": "invalid-email",
  "message": "Hello!"
}

Expected Response:
{
  "error": "Invalid email format"
}


2️⃣ Retrieve All Contact Messages
🔹 This function fetches all messages from the database.
🔹 Used for admin access to view messages.

✅ Modify contactRoutes.js

router.get("/", (req, res) => {
  const db = dbSingleton.getConnection();
  db.query("SELECT * FROM contact", (err, results) => {
    if (err) {
      console.log("⛔ Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Return all contact messages
  });
});

✅ Postman Test:
GET /api/contact

Expected Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!",
    "created_at": "2024-03-05T12:34:56Z"
  }
]

3️⃣ Implement Rate-Limiting to Prevent Spam
🔹 Limits 5 submissions per 10 minutes per IP to prevent spam.
🔹 Uses express-rate-limit.





*/

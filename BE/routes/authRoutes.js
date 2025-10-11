const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware"); //Import middleware to protect routes
const db = require("../dbSingleton");
const bcrypt = require("bcrypt");
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getSession,
} = require("../controllers/authController"); //Import authentication controllers

const router = express.Router(); // Create an Express router instance

//Route for user registration
// Calls `registerUser` from `authController.js`
// Used in `POST /api/auth/register`
router.post("/register", registerUser);

//Route for user login
// Calls `loginUser` from `authController.js`
// Used in `POST /api/auth/login`
router.post("/login", loginUser);

//Route for user logout
// Calls `logoutUser` from `authController.js`
// Used in `POST /api/auth/logout`
router.post("/logout", logoutUser);

//Route to retrieve the currently logged-in user
// Calls `getCurrentUser` from `authController.js`
// Used in `GET /api/auth/session`
// This does **not** require authentication middleware (used to check session state)
router.get("/session", getCurrentUser);
//Exporting the router to be used in `app.js`

//return the current session user
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json(req.session.user);
});

router.get("/users", async (req, res) => {
  try {
    const connection = db.getConnection(); //Important: get connection first
    const [rows] = await connection
      .promise()
      .query(
        "SELECT id AS id,id_number AS id_number, first_name AS firstName, last_name AS lastName, username, email, role, phone_number, status FROM users"
      );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users from DB:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
//Route to update a user's details
router.post("/users/:id", async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      role,
      status,
      phone_number,
      id_number,
    } = req.body;
    const { id } = req.params;

    const connection = db.getConnection();

    await connection.promise().query(
      `UPDATE users 
       SET username = ?, first_name = ?, last_name = ?, email = ?, role = ?, status = ?,phone_number = ?,id_number = ?
       WHERE id = ?`,
      [
        username,
        firstName,
        lastName,
        email,
        role,
        status,
        phone_number,
        id_number,
        id,
      ]
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});
//Profile Update Route
router.post("/profile", authMiddleware, async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please login again." });
  }

  if (!currentPassword) {
    return res.status(400).json({ error: "Current password is required" });
  }

  try {
    const connection = db.getConnection();

    // Fetch the current user from DB
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    //Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    //Update fields
    const fields = [];
    const values = [];

    if (email && email !== user.email) {
      fields.push("email = ?");
      values.push(email);
    }

    if (newPassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      fields.push("password = ?");
      values.push(hashedNewPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No changes to update" });
    }

    values.push(userId);

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ? LIMIT 1`;

    await connection.promise().query(sql, values);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
module.exports = router;

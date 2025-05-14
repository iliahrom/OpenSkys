const dbSingleton = require("../dbSingleton"); // Importing the database connection instance
const bcrypt = require("bcrypt"); // Importing bcrypt for password hashing

// Function to validate password complexity
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// ✅ This function handles user registration
// 🔹 It validates user input, checks if the username/email already exists,
// 🔹 Hashes the password, and then stores the user in the database
const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    idNumber,
    phoneNumber,
    age,
    birthDate,
    password,
  } = req.body;

  // ✅ Input validation to ensure all fields are provided
  if (
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !idNumber ||
    !phoneNumber ||
    !age ||
    !birthDate ||
    !password
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Validate ID number (must be exactly 9 digits)
  if (idNumber.length !== 9 || isNaN(idNumber)) {
    return res
      .status(400)
      .json({ error: "ID number must be exactly 9 digits" });
  }

  // ✅ Validate phone number (must be exactly 10 digits)
  if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  }

  // ✅ Password validation using regex
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character",
    });
  }

  const db = dbSingleton.getConnection(); // Get a connection to the database

  // ✅ Check if the username or email already exists in the database
  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message }); // Handle database errors
      if (results.length > 0)
        return res
          .status(400)
          .json({ error: "Username or email already exists" });

      // ✅ Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert the new user into the database with the "user" role by default
      db.query(
        "INSERT INTO users (first_name, last_name, username, email, id_number, phone_number, age, birth_date, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')",
        [
          firstName,
          lastName,
          username,
          email,
          idNumber,
          phoneNumber,
          age,
          birthDate,
          hashedPassword,
        ],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "User registered successfully!" });
        }
      );
    }
  );
};

// ✅ This function handles user login
// 🔹 It checks if the provided credentials are correct and then starts a session
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // ✅ Validate that both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  console.log(`🔍 Checking user: ${username}`); // Debugging log

  const db = dbSingleton.getConnection(); // Get a connection to the database

  // ✅ Check if the user exists in the database
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      // ✅ If the user does not exist, return an error
      if (results.length === 0) {
        console.log("⚠ User not found");
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const user = results[0]; // Get the user object from the database
      console.log("✅ User found:", user);

      // ✅ Compare the provided password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password does not match");
        return res.status(400).json({ error: "Invalid credentials" });
      }

      console.log("✅ Login successful!");
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }; // Store user in session
      req.session.save();
      res.json({ message: "Login successful", user: req.session.user });
    }
  );
};

// ✅ This function logs out the user
// 🔹 It destroys the session and clears cookies
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.json({ message: "Logged out successfully" });
  });
};

// ✅ This function retrieves the currently logged-in user
// 🔹 It checks the session and returns the user details
const getCurrentUser = (req, res) => {
  res.json({ user: req.session.user });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser /*deleteById,*/ /*getSession,*/,
};

/*const deleteById = (req, res) => {
  const { id } = req.params;
  const db = dbSingleton.getConnection();
  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "User deleted successfully!" });
  });
};*/

// Example: Get the logged-in user session
/*const getSession = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized. No user session found." });
    }
    res.json({ user: req.user });
};*/

/**
validatePassword(password)	Checks if the password meets security requirements	Used in registerUser
registerUser(req, res)	Registers a new user in the database	POST /api/auth/register
loginUser(req, res)	Authenticates a user and starts a session	POST /api/auth/login
logoutUser(req, res)	Logs out a user and destroys the session	POST /api/auth/logout
getCurrentUser(req, res)	Returns the currently logged-in user	GET /api/auth/session

Test POST /api/auth/register with different inputs (valid and invalid).
Test POST /api/auth/login with correct and incorrect credentials.
Test GET /api/auth/session to verify the logged-in user.
Test POST /api/auth/logout to destroy the session.
 






1️⃣ Role-Based Authentication (Admin Only)
🔹 This function ensures that only admin users can access certain routes.
🔹 It checks if the logged-in user has an "admin" role before allowing access.


const adminOnly = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admins only" });
  }
  next(); // Proceed if the user is an admin
};
✅ Where to Use?

Apply this middleware to admin-only routes, e.g.:
router.delete("/user/:id", adminOnly, deleteUser);

2️⃣ Enhanced Password Validation
🔹 This function adds more security rules to passwords.
🔹 Prevents common patterns (e.g., "password123", "qwerty").
🔹 Ensures at least one uppercase, one lowercase, one number, and one special character.

const enhancedValidatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/; // Min 10 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  
  const commonPasswords = ["password123", "qwerty", "12345678", "letmein"];
  
  if (!passwordRegex.test(password) || commonPasswords.includes(password.toLowerCase())) {
    return false;
  }
  return true;
};

Where to Use?

Modify registerUser
if (!enhancedValidatePassword(password)) {
  return res.status(400).json({ error: "Weak password. Must be at least 10 characters long and include an uppercase letter, lowercase letter, number, and special character." });
}


3️⃣ Implement Email Verification Before Login
🔹 This function prevents users from logging in until they verify their email.
🔹 When registering, it generates a verification token and sends it via email.
🔹 The user must click the link in the email to verify their account.

const crypto = require("crypto"); // To generate unique tokens

const sendVerificationEmail = (email, token) => {
  const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
  console.log(`📩 Email verification link (simulated): ${verificationLink}`);
  // In a real project, send this link via an email service like Nodemailer
};

const registerUserWithEmailVerification = async (req, res) => {
  const { email, password, username } = req.body;
  const db = dbSingleton.getConnection();

  const verificationToken = crypto.randomBytes(32).toString("hex");

  db.query(
    "INSERT INTO users (email, password, username, verified, verification_token) VALUES (?, ?, ?, false, ?)",
    [email, password, username, verificationToken],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      sendVerificationEmail(email, verificationToken);
      res.status(201).json({ message: "User registered. Please verify your email before logging in." });
    }
  );
};

const verifyEmail = (req, res) => {
  const { token } = req.query;
  const db = dbSingleton.getConnection();

  db.query(
    "UPDATE users SET verified = true WHERE verification_token = ?",
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(400).json({ error: "Invalid or expired token" });

      res.json({ message: "Email verified successfully! You can now log in." });
    }
  );
};

✅ Where to Use?

Replace registerUser with registerUserWithEmailVerification.
Add a new route

router.get("/verify-email", verifyEmail);

 */

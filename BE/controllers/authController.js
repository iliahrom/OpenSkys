const dbSingleton = require("../dbSingleton"); // Importing the database connection instance
const bcrypt = require("bcrypt"); // Importing bcrypt for password hashing

// Function to validate password complexity using regex(at least 8 chars, one upper, one lower, one digit, one special char)
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// This function handles user registration
// registerUser(req, res)
// Handles user registration:
//    - Validates fields
//    - Checks for existing username/email
//    - Hashes password
//    - Inserts user into DB
//  Parameters:
//    req.body = { firstName, lastName, username, email, idNumber, phoneNumber, age, birthDate, password }
//    res = Express response object
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

  // Input validation to ensure all fields are provided
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

  // Validate ID number (must be exactly 9 digits)
  if (idNumber.length !== 9 || isNaN(idNumber)) {
    return res
      .status(400)
      .json({ error: "ID number must be exactly 9 digits" });
  }

  // Validate phone number (must be exactly 10 digits)
  if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  }

  // Password validation using regex
  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character",
    });
  }

  const db = dbSingleton.getConnection(); // Get a connection to the database

  // Check if the username or email already exists in the database
  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message }); // Handle database errors
      if (results.length > 0)
        return res
          .status(400)
          .json({ error: "Username or email already exists" });

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database with the "user" role by default
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

// This function handles user login
// loginUser(req, res)
// Authenticates user, checks password, and saves user to session
// Parameters:
//    req.body = { username, password }
//    res = Express response object
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Validate that both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  console.log(`Checking user: ${username}`); // Debugging log

  const db = dbSingleton.getConnection(); // Get a connection to the database

  // Check if the user exists in the database
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      // If the user does not exist, return an error
      if (results.length === 0) {
        console.log("⚠ User not found");
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const user = results[0]; // Get the user object from the database
      console.log("User found:", user);
      //Checks if user is active before allowing login
      if (user.status && user.status.toLowerCase() !== "active") {
        console.log("User is inactive. Access denied.");
        return res.status(403).json({
          error:
            "Access denied. Please contact System Admin at OpenSkys@gmail.com",
        });
      }

      // Compare the provided password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password does not match");
        return res.status(400).json({ error: "Invalid credentials" });
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      console.log("Login successful!");
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

// This function logs out the user
// logoutUser(req, res)
// Destroys user session and clears the cookie
// Parameters: Express request and response
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.json({ message: "Logged out successfully" });
  });
};

// This function retrieves the currently logged-in user
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

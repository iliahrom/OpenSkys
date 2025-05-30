const mysql = require("mysql2"); // Importing MySQL2 library to connect to the MySQL database

let connection; // Variable to store a single database connection instance

const dbSingleton = {
  // ✅ Function to get a database connection (Singleton Pattern)
  // 🔹 Ensures only one database connection is created and reused
  getConnection: () => {
    if (!connection) {
      // Check if a connection already exists
      connection = mysql.createConnection({
        host: "localhost", // Database server hostname
        user: "root", // Database username
        password: "", // Database password (should be stored in environment variables)
        database: "drones_project", // Name of the database
      });

      // ✅ Establish connection and handle potential errors
      connection.connect((err) => {
        if (err) {
          console.error("❌ Error connecting to database:", err); // Log database connection errors
          throw err; // Stop execution if connection fails
        }
        console.log("✅ Connected to MySQL database!"); // Log success if connected
      });

      // ✅ Handle connection errors (e.g., lost connection)
      connection.on("error", (err) => {
        console.error("❌ Database connection error:", err); // Log connection errors
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          connection = null; // Reset connection if lost
        }
      });
    }

    return connection; // Return the existing or newly created connection
  },
};

// ✅ Exporting the database singleton instance so it can be used in other files
module.exports = dbSingleton;



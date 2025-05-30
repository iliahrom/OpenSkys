import React, { useState } from "react"; // ✅ Importing React and useState hook
import axios from "axios"; // ✅ Importing axios to send HTTP requests
import styles from "../styles/Contact.module.css"; // ✅ Importing CSS module for styling

const Contact = () => {
  // ✅ State variables to store user input
  const [name, setName] = useState(""); // Stores the name input
  const [email, setEmail] = useState(""); // Stores the email input
  const [message, setMessage] = useState(""); // Stores the message input
  const [error, setError] = useState(""); // Stores error messages
  const [success, setSuccess] = useState(""); // Stores success messages

  // ✅ Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevents page refresh when submitting the form

    // ✅ Reset error and success messages before new submission
    setError("");
    setSuccess("");

    // ✅ Validate that all fields are filled
    if (!name || !email || !message) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("📤 Sending request...", { name, email, message }); // ✅ Log request data

      // ✅ Send the contact form data to the backend using axios
      const response = await axios.post(
        "http://localhost:3000/api/contact",
        { name, email, message },
        {
          headers: { "Content-Type": "application/json" }, // ✅ Ensures JSON format
          withCredentials: true, // ✅ Allows cookies to be sent with the request
        }
      );

      console.log("✅ Success response:", response.data); // ✅ Log success response
      setSuccess("Message sent successfully!"); // ✅ Show success message

      // ✅ Reset input fields after successful submission
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("❌ Error:", err.response?.data?.error || err.message); // ✅ Log error message

      // ✅ Display error message to the user
      setError(
        err.response?.data?.error || "Message sending failed. Try again later."
      );
    }
  };

  return (
    <div className={styles.contactWrapper}>
      {" "}
      {/* ✅ Main container for the contact form */}
      <h2>Contact Us</h2>
      {/* ✅ Display error message if there's an error */}
      {error && <p className={styles.error}>{error}</p>}
      {/* ✅ Display success message if message was sent successfully */}
      {success && <p className={styles.success}>{success}</p>}
      {/* ✅ Contact form */}
      <form onSubmit={handleSubmit}>
        {/* ✅ Name input field */}
        <div className={styles.inputGroup}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} // ✅ Update state when user types
            required
          />
        </div>

        {/* ✅ Email input field */}
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* ✅ Message input field */}
        <div className={styles.inputGroup}>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {/* ✅ Submit button */}
        <button type="submit" className={styles.submitButton}>
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact; // ✅ Exporting the Contact component to be used in the project

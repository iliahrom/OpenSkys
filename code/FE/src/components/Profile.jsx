import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Profile.module.css";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/session",
        { withCredentials: true }
      );
      setUsername(response.data.user.username);
      setEmail(response.data.user.email);
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response?.data || error.message
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(
        "http://localhost:3000/api/auth/profile",
        {
          email,
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      alert("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <h2>My Profile</h2>

      <form onSubmit={handleSave} className={styles.form}>
        {/* Username Row */}
        <div className={styles.formRow}>
          <label>Username:</label>
          <input  
            type="text"
            value={username}
            disabled
            className={styles.disabledInput}
          />
        </div>

        {/* Email Row */}
        <div className={styles.formRow}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Current Password Row */}
        <div className={styles.formRow}>
          <label>Old Password:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        {/* New Password Row */}
        <div className={styles.formRow}>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button className={styles.saveButton} type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;

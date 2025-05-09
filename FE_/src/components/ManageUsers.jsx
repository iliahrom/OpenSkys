import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ManageUsers.module.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/auth/users");
      console.log("Fetched Users:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    }
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); // 🔵 Start saving
    try {
      await axios.post(
        `http://localhost:3000/api/auth/users/${userToEdit.id}`,
        userToEdit
      );
      alert("User updated successfully!");
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      alert("Failed to update user.");
    } finally {
      setSaving(false); // 🔵 End saving
    }
  };

  const handleChange = (field, value) => {
    setUserToEdit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.manageWrapper}>
      <h2>Users Management</h2>

      {/* Users Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>ID Number</th> {/* ✅ changed header */}
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {user.firstName} {user.lastName}
              </td>
              <td>{user.id_number}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td className={styles.centeredColumn}>{user.role}</td>{" "}
              {/* ⬅ centered */}
              <td className={styles.centeredColumn}>{user.status}</td>{" "}
              {/* ⬅ centered */}
              <td className={styles.centeredColumn}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup Edit Form */}
      {showForm && userToEdit && (
        <div className={styles.popupWrapper}>
          <form className={styles.form} onSubmit={handleSave}>
            <h3>Edit User: {userToEdit.username}</h3>

            {/* Editable ID Number */}
            <input
              type="text"
              value={userToEdit.id_number || ""}
              onChange={(e) => handleChange("id_number", e.target.value)}
              placeholder={userToEdit.id_number || "ID Number"}
            />

            {/* Editable Username */}
            <input
              type="text"
              value={userToEdit.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Username"
              required
            />

            {/* Editable Full Name */}
            <input
              type="text"
              value={`${userToEdit.firstName || ""} ${
                userToEdit.lastName || ""
              }`}
              onChange={(e) => {
                const [firstName, ...lastNameParts] = e.target.value.split(" ");
                const lastName = lastNameParts.join(" ");
                setUserToEdit((prev) => ({
                  ...prev,
                  firstName,
                  lastName,
                }));
              }}
              placeholder="Full Name"
              required
            />

            {/* Editable Email */}
            <input
              type="email"
              value={userToEdit.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email"
              required
            />

            {/* Editable Phone Number */}
            <input
              type="text"
              value={userToEdit.phone_number || ""}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              placeholder="Phone Number"
            />

            {/* Status Radio Buttons */}
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={userToEdit.status === "active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                />
                Active
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={userToEdit.status === "inactive"}
                  onChange={(e) => handleChange("status", e.target.value)}
                />
                Inactive
              </label>

              {/* Role Radio Buttons */}
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={userToEdit.role === "admin"}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
                Admin
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={userToEdit.role === "user"}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
                User
              </label>
            </div>

            <button
              className={styles.saveButton}
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

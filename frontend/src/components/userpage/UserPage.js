import React, { useState, useEffect } from "react";
import { useAuth } from "../authentification/AuthContext";
import axios from "axios";
import "./userPage.css";

function UsersPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${user.id}`);
        setProfile(response.data);
        setFormData({ username: response.data.username, email: response.data.email });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/users/${user.id}`, formData);
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    }
  };

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="user-page-container">
      <div className="user-profile-card">
        <h2>User Profile</h2>
        {isEditing ? (
          <div className="user-edit-form">
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </label>
            <div className="user-actions">
              <button onClick={handleSave} className="save-button">Save</button>
              <button onClick={handleEditToggle} className="cancel-button">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="user-profile-details">
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <div className="user-actions">
              <button onClick={handleEditToggle} className="edit-button">Edit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;

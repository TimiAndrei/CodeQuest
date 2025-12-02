import React, { useState, useEffect } from "react";
import { useAuth } from "../authentification/AuthContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}`
        );
        setProfile(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/friends`
        );
        setFriends(response.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends.");
      }
    };

    if (user) {
      fetchProfile();
      fetchFriends();
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
      const response = await axios.put(
        `http://localhost:8000/users/${user.id}`,
        formData
      );
      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/users/search`, {
        params: { query: searchTerm },
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users.");
    }
  };

  const handleAddFriend = async (friendUsername) => {
    try {
      await axios.post(`http://localhost:8000/users/${user.id}/friends`, null, {
        params: { friend_username: friendUsername },
      });
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/friends`
      );
      setFriends(response.data);
      toast.success("Friend added successfully!");
    } catch (err) {
      console.error("Error adding friend:", err);
      if (err.response && err.response.status === 400) {
        toast.error("You already have that friend.");
      } else {
        toast.error("Failed to add friend.");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
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
      <ToastContainer />
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
              <button onClick={handleSave} className="save-button">
                Save
              </button>
              <button onClick={handleEditToggle} className="cancel-button">
                Cancel
              </button>
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
              <button onClick={handleEditToggle} className="edit-button">
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="friends-section">
        <h3>Friends</h3>
        <ul>
          {friends.map((friend) => (
            <li key={friend.id}>{friend.username}</li>
          ))}
        </ul>
      </div>
      <div className="search-section">
        <h3>Search Users</h3>
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by username"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="search-results">
          <ul>
            {searchResults.map((result) => (
              <li key={result.id}>
                {result.username}{" "}
                <button onClick={() => handleAddFriend(result.username)}>
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;

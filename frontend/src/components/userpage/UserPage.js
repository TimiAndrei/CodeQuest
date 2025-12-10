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
  const [allUsers, setAllUsers] = useState([]);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

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

    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users`);
        setAllUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      }
    };

    if (user) {
      fetchProfile();
      fetchFriends();
      if (user.role === "admin") {
        fetchAllUsers();
      }
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

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/users/search`, {
        params: { query },
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

  const handleDeleteFriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:8000/users/${user.id}/friends`, {
        params: { friend_username: friendId },
      });
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/friends`
      );
      setFriends(response.data);
      toast.success("Friend deleted successfully!");
    } catch (err) {
      console.error("Error deleting friend:", err);
      toast.error("Failed to delete friend.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:8000/users/${userId}`, {
        role: newRole,
      });
      const response = await axios.get(`http://localhost:8000/users`);
      setAllUsers(response.data);
      toast.success("User role updated successfully!");
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role.");
    }
  };

  const filteredAdminUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) &&
      u.id !== user.id
  );

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm]);

  if (loading) {
    return <div className="loading-container"></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="user-page-container">
      <ToastContainer />
      <div className="search-section">
        <h3>Search Users</h3>
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username"
          />
        </div>
        <div className="search-results">
          <ul>
            {searchResults.length === 0 && searchTerm && (
              <li>No user found with searched name</li>
            )}
            {searchResults.map((result) => (
              <li key={result.id}>
                {result.username}
                <button
                  onClick={() => handleAddFriend(result.username)}
                  className="button-add-friend"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="user-page-grid">
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
                <button onClick={handleSave} className="button-save">
                  Save
                </button>
                <button onClick={handleEditToggle} className="button-cancel">
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
                <strong>Role:</strong> {profile.role}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <div className="user-actions">
                <button onClick={handleEditToggle} className="button-edit">
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
              <li key={friend.id}>
                {friend.username}
                <button
                  onClick={() => handleDeleteFriend(friend.username)}
                  className="demote-button"
                >
                  Remove Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {user.role === "admin" && (
        <div className="admin-section">
          <h3>Manage Users</h3>
          <div className="admin-search-bar">
            <input
              type="text"
              value={adminSearchTerm}
              onChange={(e) => setAdminSearchTerm(e.target.value)}
              placeholder="Search by username"
            />
          </div>
          <div className="list-container-challenges">
            <ul className="list-challenges">
              {filteredAdminUsers.map((u) => (
                <li key={u.id} className="list-item-challenges">
                  <span>{u.username}</span>
                  <span>{u.role}</span>
                  <div className="button-container-challenges">
                    <div className="promote-buttons">
                      {u.role === "user" && (
                        <button
                          onClick={() => handleRoleChange(u.id, "expert")}
                          className="promote-button"
                        >
                          Make Expert
                        </button>
                      )}
                      {u.role === "expert" && (
                        <button
                          onClick={() => handleRoleChange(u.id, "admin")}
                          className="promote-button"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                    <div className="demote-buttons">
                      {
                        <button
                          onClick={() =>
                            handleRoleChange(
                              u.id,
                              u.role === "admin" ? "expert" : "user"
                            )
                          }
                          className="demote-button"
                          disabled={u.role === "user"}
                        >
                          Demote
                        </button>
                      }
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;

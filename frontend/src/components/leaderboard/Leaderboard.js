import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { getAllUsersOrderedByPoints } from "../../api/users";
import { useAuth } from "../authentification/AuthContext"; // Import useAuth
import "./leaderboard.css";

function Leaderboard() {
  const { user } = useAuth(); // Get user from useAuth
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const usersPerPage = 5;
  const [filter, setFilter] = useState("Global");
  const [friends, setFriends] = useState([]);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/friends`
      );
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [user.id]);

  useEffect(() => {
    if (filter === "Friends") {
      fetchFriends();
    }
  }, [filter, fetchFriends]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await getAllUsersOrderedByPoints();
        setAllUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let users = allUsers;

    if (filter === "Friends") {
      const friendIds = friends.map((friend) => friend.id);
      users = users.filter((user) => friendIds.includes(user.id));
    }

    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, friends, filter, searchTerm]);

  const startIndex = page * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentPageUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const isLastPage = page + 1 >= totalPages;

  const handleNextPage = () => {
    if (!isLastPage) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <div className="leaderboard-container">
      <div className="grid-layout-leaderboard">
        <div className="grid-item-leaderboard invisible-leaderboard"></div>

        <div className="grid-item-leaderboard middle-leaderboard">
          <div className="main-container-leaderboard">
            <div className="search-bar-leaderboard">
              <input
                type="text"
                placeholder="Search by username..."
                className="search-input-leaderboard"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="filter-container">
                <select
                  name="filter"
                  className="filter-dropdown"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="Global">Global</option>
                  <option value="Friends">Friends</option>
                </select>
              </div>
            </div>

            <div className="list-container-leaderboard">
              <ul className="list-leaderboard">
                {currentPageUsers.map((user, index) => (
                  <li key={user.id} className="list-item-leaderboard">
                    <span className="username">{user.username}</span>
                    <span className="points">Points: {user.score}</span>
                    <span className="position">{startIndex + index + 1}</span>
                  </li>
                ))}
                {currentPageUsers.length < usersPerPage &&
                  Array.from({
                    length: usersPerPage - currentPageUsers.length,
                  }).map((_, idx) => (
                    <li
                      key={`placeholder-${idx}`}
                      className="list-item-placeholder"
                    />
                  ))}
              </ul>
              <div className="pagination-controls">
                <button
                  className="pagination-button"
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <button
                  className="pagination-button"
                  onClick={handleNextPage}
                  disabled={isLastPage}
                >
                  Next
                </button>
              </div>

              <div className="pagination-info">
                Page {page + 1} of {totalPages || 1}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-item-leaderboard invisible-leaderboard"></div>
      </div>
    </div>
  );
}

export default Leaderboard;

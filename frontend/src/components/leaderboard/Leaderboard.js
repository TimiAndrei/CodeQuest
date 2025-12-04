import React, { useState, useEffect } from "react";
import { getAllUsersOrderedByPoints } from "../../api/users";
import "./leaderboard.css";

function Leaderboard() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const usersPerPage = 5;

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

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleItemClick = (username) => {
    alert(`Viewing profile of ${username}`);
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
            </div>

            <div className="list-container-leaderboard">
              <ul className="list-leaderboard">
                {currentPageUsers.map((user, index) => (
                  <li
                    key={user.id}
                    className="list-item-leaderboard"
                    onClick={() => handleItemClick(user.username)}
                  >
                    <span className="username">{user.username}</span>
                    <span className="points">Points: {user.score}</span>
                    <span className="position">
                      {startIndex + index + 1}
                    </span>
                  </li>
                ))}
                {currentPageUsers.length < usersPerPage &&
                  Array.from({ length: usersPerPage - currentPageUsers.length })
                    .map((_, idx) => (
                      <li
                        key={`placeholder-${idx}`}
                        className="list-item-placeholder"
                      />
                    ))
                }
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

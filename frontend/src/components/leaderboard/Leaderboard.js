import React, { useState, useEffect } from "react";
import { getUsersOrderedByPoints } from "../../api/users";
import "./leaderboard.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getUsersOrderedByPoints(page * 5, 5);
        setLeaderboard(data);

        if (data.length < 5) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, [page]);

  useEffect(() => {
    const filtered = leaderboard.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeaderboard(filtered);
  }, [searchTerm, leaderboard]);

  const placeholders = Array.from({
    length: Math.max(5 - filteredLeaderboard.length, 0),
  });

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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="list-container-leaderboard">
              <ul className="list-leaderboard">
                {filteredLeaderboard.map((user, index) => (
                  <li key={user.id} className="list-item-leaderboard">
                    {/* show the leaderboard position */}
                    <span className="username">{user.username}</span>
                    <span className="points">Points: {user.score}</span>
                    <span className="position">{page * 5 + index + 1}</span>

                    <button
                      className="see-profile-button"
                      onClick={() =>
                        alert(`Viewing profile of ${user.username}`)
                      }
                    >
                      See Profile
                    </button>
                  </li>
                ))}
                {placeholders.map((_, index) => (
                  <li
                    key={`placeholder-${index}`}
                    className="list-item-placeholder"
                  ></li>
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
            </div>
          </div>
        </div>
        <div className="grid-item-leaderboard invisible-leaderboard"></div>
      </div>
    </div>
  );
}

export default Leaderboard;

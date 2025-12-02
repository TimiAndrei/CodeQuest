import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChallengesWithPagination } from "../../api/challenges";

import "./challenges.css";

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await getChallengesWithPagination(page * 6, 6);
        setChallenges(data);

        if (data.length < 6) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, [page]);

  useEffect(() => {
    const filtered = challenges.filter((challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.language.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChallenges(filtered);
  }, [searchTerm, challenges]);

  const handleSoloChallengeClick = (id) => {
    navigate(`/soloChallenge/${id}`);
  };

  const placeholders = Array.from({
    length: Math.max(6 - filteredChallenges.length, 0),
  });

  return (
    <div className="challenges-container">
      <div className="grid-layout-challenges">
        <div className="grid-item-challenges invisible-challenges"></div>
        <div className="grid-item-challenges middle-challenges">
          <div className="main-container-challenges">
            <div className="search-bar-challenges">
              <input
                type="text"
                placeholder="Search for challenges..."
                className="search-input-challenges"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="list-container-challenges">
              <ul className="list-challenges">
                {filteredChallenges.map((challenge) => (
                  <li key={challenge.id} className="list-item-challenges">
                    <span>{challenge.title}</span>
                    <span>{challenge.language}</span>
                    <span>{challenge.difficulty}</span>
                    <div className="button-container-challenges">
                      <button
                        className="button-challenges solo-button"
                        onClick={() => handleSoloChallengeClick(challenge.id)}
                      >
                        Solo Challenge
                      </button>
                      <button className="button-challenges friend-button">
                        Challenge a Friend
                      </button>
                    </div>
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
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <button
                  className="pagination-button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={isLastPage}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid-item-challenges invisible-challenges"></div>
      </div>
    </div>
  );
}

export default Challenges;

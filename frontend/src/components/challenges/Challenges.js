import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChallenges } from "../../api/challenges";

import "./challenges.css";

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await getChallenges();
        setChallenges(data);
        setFilteredChallenges(data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    const filtered = challenges.filter((challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChallenges(filtered);
  }, [searchTerm, challenges]);

  const handleSoloChallengeClick = (id) => {
    navigate(`/soloChallenge/${id}`);
  };

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
              </ul>
            </div>
          </div>
        </div>
        <div className="grid-item-challenges invisible-challenges"></div>
      </div>
    </div>
  );
}

export default Challenges;

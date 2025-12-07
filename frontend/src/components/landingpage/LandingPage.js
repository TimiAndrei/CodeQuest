import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./landingPage.css";
import { getChallengesWithPagination } from "../../api/challenges";
import { getResourcesWithPagination } from "../../api/resources";

function LandingPage() {
  const [activeTab, setActiveTab] = useState("challenges");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchFunction =
          activeTab === "challenges"
            ? getChallengesWithPagination
            : getResourcesWithPagination;
        const response = await fetchFunction(page * 5, 5);
        setData(response);

        if (response.length < 5) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activeTab, page]);

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setPage(0);
      setData([]);
    }
  };

  const handleItemClick = (id) => {
    if (activeTab === "challenges") {
      navigate(`/soloChallenge/${id}`);
    } else {
      navigate(`/resource/${id}`);
    }
  };

  const placeholders = Array.from({ length: 5 - data.length });

  return (
    <div className="landing-page-container">
      <div className="grid-layout-landing">
        <div className="grid-item-landing invisible-landing"></div>
        <div className="grid-item-landing middle-landing">
          <div className="card-landing">
            <div className="welcome-message">
              <h1>Welcome to CodeQuest!</h1>
              <p>
                Please log in to experience the full features of the
                application.
              </p>
            </div>
            <div>
              <h2>What's new?</h2>
            </div>
            <div className="tab-buttons">
              <button
                className={`tab-button ${
                  activeTab === "challenges" ? "active" : ""
                }`}
                onClick={() => handleTabChange("challenges")}
                disabled={activeTab === "challenges"}
              >
                Challenges
              </button>
              <button
                className={`tab-button ${
                  activeTab === "resources" ? "active" : ""
                }`}
                onClick={() => handleTabChange("resources")}
                disabled={activeTab === "resources"}
              >
                Resources
              </button>
            </div>
            <div className="content-list">
              <ul className="list-landing">
                {data.map((item) => (
                  <li
                    key={item.id}
                    className="list-item-landing"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span>{item.title}</span>
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
        <div className="grid-item-landing invisible-landing"></div>
      </div>
    </div>
  );
}

export default LandingPage;

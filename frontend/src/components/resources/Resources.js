import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResourcesWithPagination } from "../../api/resources";

import "./resources.css";

function Resources() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResourcesWithPagination(page * 6, 6);
        setResources(data);

        if (data.length < 6) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, [page]);

  useEffect(() => {
    const filtered = resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResources(filtered);
  }, [searchTerm, resources]);

  const handleExploreClick = (id) => {
    navigate(`/resource/${id}`);
  };

  const placeholders = Array.from({
    length: Math.max(6 - filteredResources.length, 0),
  });

  return (
    <div className="resources-container">
      <div className="grid-layout-resources">
        <div className="grid-item-resources invisible-resources"></div>
        <div className="grid-item-resources middle-resources">
          <div className="main-container-resources">
            <div className="search-bar-resources">
              <input
                type="text"
                placeholder="Search for resources..."
                className="search-input-resources"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="list-container-resources">
              <ul className="list-resources">
                {filteredResources.map((resource) => (
                  <li key={resource.id} className="list-item-resources">
                    <span>{resource.title}</span>
                    <div className="button-container-resources">
                      <button
                        className="button-resources explore-button"
                        onClick={() => handleExploreClick(resource.id)}
                      >
                        Explore
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
        <div className="grid-item-resources invisible-resources"></div>
      </div>
    </div>
  );
}

export default Resources;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResources } from "../../api/resources";

import "./resources.css";

function Resources() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
        setFilteredResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const filtered = resources.filter((resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
    setFilteredResources(filtered);
  }, [searchTerm, resources]);

  const handleExploreClick = (id) => {
    navigate(`/resource/${id}`);
  };

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
              </ul>
            </div>
          </div>
        </div>
        <div className="grid-item-resources invisible-resources"></div>
      </div>
    </div>
  );
}

export default Resources;

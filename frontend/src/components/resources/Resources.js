import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllResources,
  addResources,
  deleteResource,
} from "../../api/resources";

import { useAuth } from "../authentification/AuthContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./resources.css";

function Resources() {
  const [allResources, setAllResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    sortBy: "latest",
  });
  const [page, setPage] = useState(0);
  const resourcesPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
  });

  const [isLastPage, setIsLastPage] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        const data = await getAllResources();
        setAllResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchAllResources();
  }, []);

  const filteredSortedResources = useMemo(() => {
    const filtered = allResources.filter((resource) => {
      const lowerTitle = resource.title.toLowerCase();
      const lowerDesc = resource.description.toLowerCase();
      const lowerSearch = searchTerm.toLowerCase();

      return lowerTitle.includes(lowerSearch) || lowerDesc.includes(lowerSearch);
    });
    return filtered.sort((a, b) => {
      if (filter.sortBy === "latest") {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });
  }, [allResources, searchTerm, filter]);

  const startIndex = page * resourcesPerPage;
  const endIndex = startIndex + resourcesPerPage;
  const currentPageResources = filteredSortedResources.slice(startIndex, endIndex);

  useEffect(() => {
    setIsLastPage(endIndex >= filteredSortedResources.length);
  }, [endIndex, filteredSortedResources]);

  const handleItemClick = (id) => {
    navigate(`/resource/${id}`);
  };

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      setAllResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource deleted successfully!");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource.");
    }
  };

  const handleAddResource = async () => {
    const resourceToSubmit = {
      title: newResource.title,
      description: newResource.description,
    };

    try {
      await addResources(resourceToSubmit);
      toast.success("Resource added successfully!");
      setShowModal(false);
      setNewResource({ title: "", description: "" });
      setPage(0);

      const updated = await getAllResources();
      setAllResources(updated);
    } catch (error) {
      console.error("Error adding resources:", error);
      toast.error("Failed to add resource.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
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
                onChange={handleSearch}
              />
              <div className="filter-container">
                <select
                  name="sortBy"
                  className="filter-dropdown"
                  value={filter.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            <div className="list-container-resources">
              <ul className="list-resources">
                {currentPageResources.map((resource) => (
                  <li
                    key={resource.id}
                    className="list-item-resources"
                    onClick={() => handleItemClick(resource.id)}
                  >
                    <span className="resource-title">{resource.title}</span>
                    {user && user.role === "admin" && (
                      <button
                        className="button-resources delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(resource.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </li>
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

            {user && (user.role === "admin" || user.role === "expert") && (
              <div>
                <button onClick={() => setShowModal(true)} className="button-add">
                  Add Resource
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid-item-resources invisible-resources"></div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Resource</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={newResource.title}
                onChange={(e) =>
                  setNewResource((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter description"
                value={newResource.description}
                onChange={(e) =>
                  setNewResource((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddResource}>
            Add Resource
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default Resources;

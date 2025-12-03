import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    reward_points: 0,
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [purchasedResources, setPurchasedResources] = useState([]);
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

      return (
        lowerTitle.includes(lowerSearch) || lowerDesc.includes(lowerSearch)
      );
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
  const currentPageResources = filteredSortedResources.slice(
    startIndex,
    endIndex
  );

  const fetchPurchasedResources = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/purchases`
      );
      setPurchasedResources(
        response.data.map((purchase) => purchase.resource_id)
      );
    } catch (error) {
      console.error("Error fetching purchased resources:", error);
    }
  }, [user.id]);

  useEffect(() => {
    setIsLastPage(endIndex >= filteredSortedResources.length);
  }, [endIndex, filteredSortedResources]);

  useEffect(() => {
    fetchPurchasedResources();
  }, [fetchPurchasedResources]);

  const handleItemClick = (id) => {
    if (purchasedResources.includes(id)) {
      navigate(`/resource/${id}`);
    } else {
      toast.error("You need to buy this resource to access it.");
    }
  };

  const handleDeleteResource = async () => {
    try {
      await deleteResource(selectedResource.id);
      setAllResources((prev) =>
        prev.filter((r) => r.id !== selectedResource.id)
      );
      toast.success("Resource deleted successfully!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource.");
    }
  };

  const handleAddResource = async () => {
    const resourceToSubmit = {
      title: newResource.title,
      description: newResource.description,
      reward_points: newResource.reward_points,
    };

    try {
      await addResources(resourceToSubmit);
      toast.success("Resource added successfully!");
      setShowAddModal(false);
      setNewResource({
        title: "",
        description: "",
        reward_points: 0,
      });
      setPage(0);

      const updated = await getAllResources();
      setAllResources(updated);
    } catch (error) {
      console.error("Error adding resources:", error);
      toast.error("Failed to add resource.");
    }
  };

  const handleBuyResource = async () => {
    if (user.reward_points >= selectedResource.reward_points) {
      try {
        await axios.post("http://localhost:8000/purchases/", {
          user_id: user.id,
          resource_id: selectedResource.id,
        });
        setPurchasedResources([...purchasedResources, selectedResource.id]);
        toast.success("Resource bought successfully!");
        setShowBuyModal(false);
      } catch (error) {
        console.error("Error buying resource:", error);
        toast.error("Failed to buy resource.");
      }
    } else {
      toast.error("You don't have enough reward points to buy this resource.");
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
                    {resource.reward_points > 0 &&
                      !purchasedResources.includes(resource.id) && (
                        <button
                          className="button-resources buy-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResource(resource);
                            setShowBuyModal(true);
                          }}
                        >
                          Buy for {resource.reward_points}
                        </button>
                      )}
                    {user && user.role === "admin" && (
                      <button
                        className="button-resources delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource(resource);
                          setShowDeleteModal(true);
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
                <button
                  onClick={() => setShowAddModal(true)}
                  className="button-add"
                >
                  Add Resource
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid-item-resources invisible-resources"></div>
      </div>

      {/* Add Resource Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
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

            <Form.Group>
              <Form.Label>Reward Points</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter reward points"
                value={newResource.reward_points}
                onChange={(e) =>
                  setNewResource((prev) => ({
                    ...prev,
                    reward_points: parseInt(e.target.value, 10),
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddResource}>
            Add Resource
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Buy Resource Confirmation Modal */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to buy "{selectedResource?.title}" for{" "}
          {selectedResource?.reward_points} reward points?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBuyResource}>
            Buy
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Resource Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedResource?.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteResource}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default Resources;

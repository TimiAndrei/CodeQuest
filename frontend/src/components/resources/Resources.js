import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addResources,
  getResourcesWithPagination,
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
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const navigate = useNavigate();
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
  });
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const fetchResources = async () => {
    try {
      const data = await getResourcesWithPagination(page * 5, 5);

      const filledData = [...data];
      while (filledData.length < 5) {
        filledData.push({
          id: `placeholder-${filledData.length}`,
          title: "",
          description: "",
          isPlaceholder: true,
        });
      }

      setResources(filledData);
      setIsLastPage(data.length < 5);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useEffect(() => {
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

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      setResources(resources.filter((resource) => resource.id !== id));
      setFilteredResources(
        filteredResources.filter((resource) => resource.id !== id)
      );
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
      setNewResource({
        title: "",
        description: "",
      });
      setPage(0);
      fetchResources(); // Reload resources to display the new resource
    } catch (error) {
      console.error("Error adding resources:", error);
      toast.error("Failed to add resource.");
    }
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
                  <li
                    key={resource.id}
                    className={`list-item-resources ${
                      resource.isPlaceholder ? "placeholder" : ""
                    }`}
                  >
                    <span>{resource.title}</span>
                    {!resource.isPlaceholder && (
                      <div className="button-container-resources">
                        <button
                          className="button-resources explore-button"
                          onClick={() => handleExploreClick(resource.id)}
                        >
                          Explore
                        </button>
                        {user && user.role === "admin" && (
                          <button
                            className="button-resources delete-button"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
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
                  onClick={() => setShowModal(true)}
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
                  setNewResource({ ...newResource, title: e.target.value })
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
                  setNewResource({
                    ...newResource,
                    description: e.target.value,
                  })
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

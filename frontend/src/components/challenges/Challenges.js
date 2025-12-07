import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getChallengesWithPagination,
  addChallenge,
  deleteChallenge,
} from "../../api/challenges";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { List, ListItem, ListItemText, Checkbox } from "@mui/material";
import "./challenges.css";

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    input: "",
    output: "",
    difficulty: "",
    language: "",
  });
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [currentChallengeId, setCurrentChallengeId] = useState(null);
  const [filter, setFilter] = useState({
    sortBy: "latest",
    language: "",
    difficulty: "",
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await getChallengesWithPagination(page * 5, 5);
      setChallenges(data);
      setIsLastPage(data.length <= 5);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  }, [page]);

  const fetchFilteredChallenges = useCallback(async () => {
    try {
      const params = {
        sort_by: filter.sortBy,
        ...(filter.language && { language: filter.language }),
        ...(filter.difficulty && { difficulty: filter.difficulty }),
      };
      const response = await axios.get(
        "http://localhost:8000/challenges/filter",
        { params }
      );
      setFilteredChallenges(response.data);
    } catch (error) {
      console.error("Error fetching filtered challenges:", error);
    }
  }, [filter]);

  useEffect(() => {
    fetchChallenges();
  }, [page, fetchChallenges]);

  useEffect(() => {
    fetchFilteredChallenges();
  }, [filter, fetchFilteredChallenges]);

  useEffect(() => {
    setFilteredChallenges(
      challenges.filter(
        (challenge) =>
          challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          challenge.difficulty
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          challenge.language.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, challenges]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/friends`
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const filteredSortedChallenges = useMemo(() => {
    let filtered = [...allChallenges];

    const lowerSearch = searchTerm.toLowerCase();
    if (lowerSearch) {
      filtered = filtered.filter((challenge) => {
        const inTitle = challenge.title.toLowerCase().includes(lowerSearch);
        const inDiff = challenge.difficulty.toLowerCase().includes(lowerSearch);
        const inLang = challenge.language.toLowerCase().includes(lowerSearch);
        return inTitle || inDiff || inLang;
      });
    }

    if (filter.language) {
      filtered = filtered.filter(
        (ch) => ch.language.toLowerCase() === filter.language.toLowerCase()
      );
    }

    if (filter.difficulty) {
      filtered = filtered.filter(
        (ch) => ch.difficulty.toLowerCase() === filter.difficulty.toLowerCase()
      );
    }

    if (filter.sortBy === "latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else {
      filtered.sort((a, b) => a.id - b.id);
    }

    return filtered;
  }, [allChallenges, searchTerm, filter]);

  const startIndex = page * challengesPerPage;
  const endIndex = startIndex + challengesPerPage;
  const currentPageChallenges = filteredSortedChallenges.slice(
    startIndex,
    endIndex
  );
  const totalPages = Math.ceil(
    filteredSortedChallenges.length / challengesPerPage
  );

  useEffect(() => {
    setIsLastPage(endIndex >= filteredSortedChallenges.length);
  }, [endIndex, filteredSortedChallenges]);

  const handleAddChallenge = async () => {
    const challengeToSubmit = {
      title: newChallenge.title,
      description: newChallenge.description,
      input: newChallenge.input,
      output: newChallenge.output,
      difficulty: newChallenge.difficulty,
      language: newChallenge.language,
    };

    try {
      await addChallenge(challengeToSubmit);
      toast.success("Challenge added successfully!");
      setShowModal(false);
      setNewChallenge({
        title: "",
        description: "",
        input: "",
        output: "",
        difficulty: "",
        language: "",
      });
      setPage(0);
      fetchChallenges();
    } catch (error) {
      console.error("Error adding challenge:", error);
      toast.error("Failed to add challenge.");
    }
  };

  const handleDeleteChallenge = async (id) => {
    try {
      await deleteChallenge(id);
      setChallenges(challenges.filter((challenge) => challenge.id !== id));
      setFilteredChallenges(
        filteredChallenges.filter((challenge) => challenge.id !== id)
      );
      toast.success("Challenge deleted successfully!");
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Failed to delete challenge.");
    }
  };

  const openFriendsModal = (challengeId) => {
    setCurrentChallengeId(challengeId);
    setShowFriendsModal(true);
  };

  const handleFriendToggle = (friendUsername) => {
    setSelectedFriends((prev) =>
      prev.includes(friendUsername)
        ? prev.filter((u) => u !== friendUsername)
        : [...prev, friendUsername]
    );
  };


  const handleChallengeFriend = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend to challenge.");
      return;
    }

    try {
      const challenge = challenges.find(
        (challenge) => challenge.id === currentChallengeId
      );
      await Promise.all(
        selectedFriends.map(async (friendUsername) => {
          const userResponse = await axios.get(
            `http://localhost:8000/users/search`,
            {
              params: { query: friendUsername },
            }
          );
          const recipient = userResponse.data[0];
          if (!recipient) {
            throw new Error(`User ${friendUsername} not found`);
          }
          await axios.post(`http://localhost:8000/notifications`, {
            recipient_id: recipient.id,
            message: `You have been challenged to "${challenge.title}" challenge by "${user.username}"!`,
            link: `/soloChallenge/${currentChallengeId}`,
            challenger_username: user.username,
          });
        })
      );
      toast.success("Challenge sent successfully!");
      setShowFriendsModal(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error sending challenge:", error);
      toast.error("Failed to send challenge.");
    }
  };

  const handleFriendToggle = (friendUsername) => {
    setSelectedFriends((prevSelectedFriends) =>
      prevSelectedFriends.includes(friendUsername)
        ? prevSelectedFriends.filter((username) => username !== friendUsername)
        : [...prevSelectedFriends, friendUsername]
    );
  };

  const openFriendsModal = (challengeId) => {
    setCurrentChallengeId(challengeId);
    setShowFriendsModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
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
                <select
                  name="language"
                  className="filter-dropdown"
                  value={filter.language}
                  onChange={handleFilterChange}
                >
                  <option value="">All Languages</option>
                  {Array.from(
                    new Set(allChallenges.map((c) => c.language))
                  ).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                  {/* Add options dynamically based on available languages */}
                  {Array.from(new Set(challenges.map((c) => c.language))).map(
                    (language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="difficulty"
                  className="filter-dropdown"
                  value={filter.difficulty}
                  onChange={handleFilterChange}
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
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
                        onClick={() =>
                          navigate(`/soloChallenge/${challenge.id}`)
                        }
                        onClick={() =>
                          navigate(`/soloChallenge/${challenge.id}`)
                        }
                      >
                        Solo Challenge
                      </button>
                      <button
                        className="button-challenges friend-button"
                        onClick={() => openFriendsModal(challenge.id)}
                      >
                        Challenge a Friend
                      </button>
                      {user && user.role === "admin" && (
                        <button
                          className="button-challenges delete-button"
                          onClick={() => handleDeleteChallenge(challenge.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
              <div className="pagination-info">
                Page {page + 1} of {totalPages || 1}
              </div>
            </div>

            {user && (user.role === "admin" || user.role === "expert") && (
              <div>
                <button
                  onClick={() => setShowModal(true)}
                  className="button-add"
                >
                <button
                  onClick={() => setShowModal(true)}
                  className="button-add"
                >
                  Add Challenge
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="grid-item-challenges invisible-challenges"></div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={newChallenge.title}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                  setNewChallenge({ ...newChallenge, title: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter description"
                value={newChallenge.description}
                onChange={(e) =>
                  setNewChallenge({
                    ...newChallenge,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Input</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter input"
                value={newChallenge.input}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    input: e.target.value,
                  }))
                  setNewChallenge({ ...newChallenge, input: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Output</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter output"
                value={newChallenge.output}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    output: e.target.value,
                  }))
                  setNewChallenge({ ...newChallenge, output: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Difficulty</Form.Label>
              <Form.Control
                as="select"
                value={newChallenge.difficulty}
                onChange={(e) =>
                  setNewChallenge({
                    ...newChallenge,
                    difficulty: e.target.value,
                  })
                }
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter language"
                value={newChallenge.language}
                onChange={(e) =>
                  setNewChallenge({ ...newChallenge, language: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddChallenge}>
            Add Challenge
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showFriendsModal}
        onHide={() => setShowFriendsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Friends to Challenge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <List>
            {friends.map((friend) => (
              <ListItem
                key={friend.id}
                button
                onClick={() => handleFriendToggle(friend.username)}
              >
                <Checkbox checked={selectedFriends.includes(friend.username)} />
                <ListItemText primary={friend.username} />
              </ListItem>
            ))}
          </List>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowFriendsModal(false)}
          >
          <Button
            variant="secondary"
            onClick={() => setShowFriendsModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleChallengeFriend}>
            Challenge Friends
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default Challenges;

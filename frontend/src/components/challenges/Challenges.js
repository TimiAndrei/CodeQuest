import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getAllChallenges,
  addChallenge,
  deleteChallenge,
} from "../../api/challenges";
import { useAuth } from "../authentification/AuthContext";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { List, ListItem, ListItemText, Checkbox } from "@mui/material";
import "./challenges.css";

function Challenges() {
  const [allChallenges, setAllChallenges] = useState([]);
  const [solvedChallenges, setSolvedChallenges] = useState([]);

  const [page, setPage] = useState(0);
  const challengesPerPage = 5;

  const [searchTerm, setSearchTerm] = useState("");

  const [filter, setFilter] = useState({
    sortBy: "latest",
    language: "",
    difficulty: "",
    tag: "",
    solvedStatus: "all",
  });

  const [isLastPage, setIsLastPage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    input: "",
    output: "",
    difficulty: "",
    language: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [currentChallengeId, setCurrentChallengeId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [tags, setTags] = useState([]);
  const [challengeTags, setChallengeTags] = useState({});

  useEffect(() => {
    const fetchSolvedChallenges = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/solved-challenges`
        );
        setSolvedChallenges(response.data.map((challenge) => challenge.id));
      } catch (error) {
        console.error("Error fetching solved challenges:", error);
      }
    };
    fetchSolvedChallenges();
  }, [user]);

  useEffect(() => {
    const fetchSentChallenges = async () => {
      if (filter.solvedStatus === "sent" && user) {
        try {
          const response = await axios.get(
            `http://localhost:8000/users/${user.id}/sent-challenges`
          );
          setAllChallenges(response.data);
        } catch (error) {
          console.error("Error fetching sent challenges:", error);
        }
      } else {
        const fetchAll = async () => {
          try {
            const data = await getAllChallenges();
            setAllChallenges(data);
          } catch (error) {
            console.error("Error fetching challenges:", error);
          }
        };
        fetchAll();
      }
    };
    fetchSentChallenges();
  }, [filter.solvedStatus, user]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/tags/");
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const fetchChallengeTags = useCallback(async () => {
    try {
      const tagsMap = {};
      await Promise.all(
        allChallenges.map(async (challenge) => {
          const response = await axios.get(
            `http://localhost:8000/challenges/${challenge.id}/tags`
          );
          tagsMap[challenge.id] = response.data;
        })
      );
      setChallengeTags(tagsMap);
    } catch (error) {
      console.error("Error fetching challenge tags:", error);
    }
  }, [allChallenges]);

  useEffect(() => {
    fetchChallengeTags();
  }, [allChallenges, fetchChallengeTags]);

  const handleTagChange = (e) => {
    const { options } = e.target;
    const selectedTags = [];
    for (const option of options) {
      if (option.selected) {
        selectedTags.push(parseInt(option.value, 10));
      }
    }
    setNewChallenge((prev) => ({ ...prev, tags: selectedTags }));
  };

  const handleAddTag = async () => {
    if (newTag.trim() === "") {
      toast.error("Tag name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/tags/", {
        name: newTag,
      });
      setTags((prevTags) => [...prevTags, response.data]);
      setNewTag("");
      toast.success("Tag added successfully!");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag.");
    }
  };

  const fetchLikes = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/challenges/likes"
      );
      const likesMap = response.data.reduce((acc, item) => {
        acc[item.challenge_id] = item.likes;
        return acc;
      }, {});
      setLikes(likesMap);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getAllChallenges();
        setAllChallenges(data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/friends`
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
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

    if (filter.tag) {
      filtered = filtered.filter(
        (ch) =>
          challengeTags[ch.id] &&
          challengeTags[ch.id].some((tag) => tag.name === filter.tag)
      );
    }

    if (filter.solvedStatus === "solved") {
      filtered = filtered.filter((ch) => solvedChallenges.includes(ch.id));
    } else if (filter.solvedStatus === "unsolved") {
      filtered = filtered.filter((ch) => !solvedChallenges.includes(ch.id));
    }

    if (filter.sortBy === "latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (filter.sortBy === "oldest") {
      filtered.sort((a, b) => a.id - b.id);
    } else if (filter.sortBy === "mostLiked") {
      filtered.sort((a, b) => (likes[b.id] || 0) - (likes[a.id] || 0));
    }

    return filtered;
  }, [
    allChallenges,
    searchTerm,
    filter,
    likes,
    challengeTags,
    solvedChallenges,
  ]);

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
      tags: newChallenge.tags, // Include tags in the challenge submission
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
        tags: [], // Reset tags
      });
      setPage(0);

      const updated = await getAllChallenges();
      setAllChallenges(updated);
    } catch (error) {
      console.error("Error adding challenge:", error);
      toast.error("Failed to add challenge.");
    }
  };

  const handleDeleteChallenge = async (id) => {
    try {
      await deleteChallenge(id);
      setAllChallenges((prev) => prev.filter((ch) => ch.id !== id));
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
      const challenge = allChallenges.find((c) => c.id === currentChallengeId);
      if (!challenge) throw new Error("Challenge not found.");

      await Promise.all(
        selectedFriends.map(async (friendUsername) => {
          // Fetch the recipient's user data
          const userResponse = await axios.get(
            `http://localhost:8000/users/search`,
            { params: { query: friendUsername } }
          );
          const recipient = userResponse.data[0];
          if (!recipient) {
            throw new Error(`User ${friendUsername} not found`);
          }

          // Fetch notifications for the recipient
          const existingNotifications = await axios.get(
            `http://localhost:8000/users/${recipient.id}/notifications`
          );

          // Check if a notification for this challenge already exists
          const alreadySent = existingNotifications.data.some(
            (notification) =>
              notification.link === `/soloChallenge/${currentChallengeId}` &&
              notification.recipient_id === recipient.id
          );

          if (alreadySent) {
            toast.info(`Challenge already sent to ${friendUsername}.`);
            return;
          }

          // Send the challenge notification
          await axios.post(`http://localhost:8000/notifications`, {
            recipient_id: recipient.id,
            message: `You have been challenged to "${challenge.title}" challenge by "${user.username}"!`,
            link: `/soloChallenge/${currentChallengeId}`,
            challenger_username: user.username,
            challenge_id: currentChallengeId,
          });

          toast.success(`Challenge sent to ${friendUsername}!`);
        })
      );

      setShowFriendsModal(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error sending challenge:", error);
      toast.error("Failed to send challenge.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    setPage(0);
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
                onChange={handleSearchChange}
              />

              <div className="filter-container">
                <select
                  name="solvedStatus"
                  className="filter-dropdown"
                  value={filter.solvedStatus}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Challenges</option>
                  <option value="solved">Solved Challenges</option>
                  <option value="unsolved">Unsolved Challenges</option>
                  <option value="sent">Sent Challenges</option>
                </select>
                <select
                  name="sortBy"
                  className="filter-dropdown"
                  value={filter.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostLiked">Most Liked</option>
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

                <select
                  name="tag"
                  className="filter-dropdown"
                  value={filter.tag}
                  onChange={handleFilterChange}
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="list-container-challenges">
              <ul className="list-challenges">
                {currentPageChallenges.map((challenge, index) => (
                  <li
                    key={`${challenge.id}-${
                      challenge.isSent
                        ? "sent"
                        : challenge.isReceived
                        ? "received"
                        : "normal"
                    }-${index}`}
                    className={`list-item-challenges ${
                      solvedChallenges.includes(challenge.id) ? "solved" : ""
                    }`}
                  >
                    <span>{challenge.title}</span>
                    <span>{challenge.language}</span>
                    <span>{challenge.difficulty}</span>
                    {challenge.friend_username && (
                      <span>Sent to: {challenge.friend_username}</span>
                    )}
                    <div className="button-container-challenges">
                      <button
                        className="button-challenges solo-button"
                        onClick={() =>
                          navigate(`/soloChallenge/${challenge.id}`)
                        }
                      >
                        Solo Challenge
                      </button>
                      {filter.solvedStatus === "sent" &&
                      challenge.friend_username ? (
                        <button
                          className="button-challenges friend-button"
                          onClick={async () => {
                            try {
                              // Send a reminder notification
                              await axios.post(
                                `http://localhost:8000/notifications`,
                                {
                                  recipient_id: friends.find(
                                    (friend) =>
                                      friend.username ===
                                      challenge.friend_username
                                  )?.id,
                                  message: `Reminder: You have been challenged to "${challenge.title}" by "${user.username}"!`,
                                  link: `/soloChallenge/${challenge.id}`,
                                  challenger_username: user.username,
                                  challenge_id: challenge.id,
                                }
                              );
                              toast.success(
                                `Reminder sent to ${challenge.friend_username}!`
                              );
                            } catch (error) {
                              console.error("Error sending reminder:", error);
                              toast.error("Failed to send reminder.");
                            }
                          }}
                        >
                          Remind Friend
                        </button>
                      ) : (
                        <button
                          className="button-challenges friend-button"
                          onClick={() => openFriendsModal(challenge.id)}
                        >
                          Challenge a Friend
                        </button>
                      )}
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
                  Add Challenge
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid-item-challenges invisible-challenges"></div>
      </div>

      <Modal
        show={showFriendsModal}
        onHide={() => setShowFriendsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Challenge a Friend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select Friends</Form.Label>
              <List>
                {friends.map((friend) => (
                  <ListItem
                    key={friend.id}
                    button
                    onClick={() => handleFriendToggle(friend.username)}
                  >
                    <Checkbox
                      checked={selectedFriends.includes(friend.username)}
                    />
                    <ListItemText primary={friend.username} />
                  </ListItem>
                ))}
              </List>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowFriendsModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleChallengeFriend}>
            Challenge
          </Button>
        </Modal.Footer>
      </Modal>

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
                  setNewChallenge((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
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
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Difficulty</Form.Label>
              <Form.Control
                as="select"
                value={newChallenge.difficulty}
                onChange={(e) =>
                  setNewChallenge((prev) => ({
                    ...prev,
                    difficulty: e.target.value,
                  }))
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
                  setNewChallenge((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Add New Tag</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button
                className="tag-button"
                variant="primary"
                onClick={handleAddTag}
              >
                Add Tag
              </Button>
            </Form.Group>

            <Form.Group>
              <Form.Label>Tags</Form.Label>
              <Form.Control
                className="tag-select"
                as="select"
                multiple
                value={newChallenge.tags}
                onChange={handleTagChange}
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Form.Control>
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

      <ToastContainer />
    </div>
  );
}

export default Challenges;

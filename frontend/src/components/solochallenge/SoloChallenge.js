import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "./solochallenge.css";
import axios from "axios";
import { getChallenge, submitCode } from "../../api/challenges";
import { useAuth } from "../authentification/AuthContext";
import api from "../../api/apiInstance";
import { Editor } from "@monaco-editor/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SoloChallenge() {
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState("");
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [users, setUsers] = useState({});
  const [commentFilter, setCommentFilter] = useState("latest");

  const [challengeLikes, setChallengeLikes] = useState(0);
  const [userChallengeLike, setUserChallengeLike] = useState(false);

  const fetchChallengeLikes = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/challenges/like/${id}`
      );
      setChallengeLikes(response.data.length);
      setUserChallengeLike(
        response.data.some((like) => like.user_id === user.id)
      );
    } catch (error) {
      console.error("Error fetching challenge likes:", error);
    }
  }, [id, user.id]);

  const handleLikeChallenge = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/challenges/like`,
        {
          user_id: user.id,
          challenge_id: id,
        }
      );
      setChallengeLikes((prevLikes) =>
        userChallengeLike ? prevLikes - 1 : prevLikes + 1
      );
      setUserChallengeLike((prevUserLike) => !prevUserLike);
      if (userChallengeLike) {
        toast.success("Challenge unliked!");
      } else {
        toast.success("Challenge liked!");
      }
    } catch (error) {
      console.error("Error liking/unliking challenge:", error);
    }
  };

  useEffect(() => {
    fetchChallengeLikes();
  }, [fetchChallengeLikes]);

  const filteredSortedComments = useMemo(() => {
    const sortedComments = [...comments];
    if (commentFilter === "latest") {
      sortedComments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (commentFilter === "oldest") {
      sortedComments.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (commentFilter === "mostLiked") {
      sortedComments.sort((a, b) => (likes[b.id] || 0) - (likes[a.id] || 0));
    }
    return sortedComments;
  }, [comments, commentFilter, likes]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const challengeData = await getChallenge(id);
        setChallenge(challengeData);

        const initialCode = await getTextStart(
          challengeData.language,
          parseInt(id, 10),
          user.id
        );
        setCode(initialCode);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch challenge:", err);
        setError("Challenge not found or an error occurred.");
        setLoading(false);
      }
    };

    const fetchRecommendedResources = async () => {
      try {
        const response = await api.get(
          `/challenges/${id}/recommended-resources`
        );
        setRecommendedResources(response.data);
      } catch (err) {
        console.error("Failed to fetch recommended resources:", err);
      }
    };

    fetchChallenge();
    fetchRecommendedResources();
  }, [id, user.id]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const handleSubmit = async () => {
    const challengeId = parseInt(id, 10);
    const languageId = getLanguageId(challenge.language);
    const stdin = challenge.input;
    const expectedOutput = challenge.output;

    try {
      const result = await submitCode(
        challengeId,
        code,
        languageId,
        stdin,
        expectedOutput,
        user.id // Pass the user ID
      );
      console.log("API Response:", result);

      if (result?.stdout) {
        if (result.points_awarded) {
          const timeTaken = formatTime();
          toast.success(
            `Congratulations! You have solved the problem in ${timeTaken} and have been awarded ${result.points_awarded} points.`
          );
          setTime(0); // Reset the timer
          setIsRunning(false); // Stop the timer
        }
        if (result.badge_awarded) {
          toast.success(
            `Congratulations! You have been awarded the badge: ${result.badge_awarded}`
          );
        }
      } else {
        toast.error("No output or an error occurred.");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error(error.response?.data?.detail || "Submission failed.");
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getTextStart = async (language, challengeId, userId) => {
    try {
      const response = await api.get(`/users/challenges/`, {
        params: { user_id: userId },
      });
      const userChallenges = response.data;

      const userChallenge = userChallenges.find(
        (uc) => uc.challenge_id === challengeId
      );

      if (userChallenge) {
        return userChallenge.solution;
      }
    } catch (err) {
      console.error("Failed to fetch user challenges:", err);
    }

    switch (language?.toUpperCase()) {
      case "JAVA":
        return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      case "PYTHON":
        return `def main():\n    # Write your code here\n\nif __name__ == "__main__":\n    main()`;
      case "C++":
        return `#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      case "JAVASCRIPT":
        return `function main() {\n    // Write your code here\n}\n\nmain();`;
      default:
        return "// Start coding here...";
    }
  };

  const getLanguageId = (language) => {
    switch (language?.toUpperCase()) {
      case "PYTHON":
        return 71;
      case "JAVASCRIPT":
        return 63;
      case "JAVA":
        return 62;
      case "C++":
        return 54;
      default:
        return 71; // Default to Python
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/challenges/${id}/comments`
      );
      setComments(response.data);
      const userIds = response.data.map((comment) => comment.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      const usersResponse = await Promise.all(
        uniqueUserIds.map((userId) =>
          axios.get(`http://localhost:8000/users/${userId}`)
        )
      );
      const usersMap = {};
      uniqueUserIds.forEach((userId, index) => {
        usersMap[userId] = usersResponse[index].data;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [id]);

  const fetchLikes = useCallback(async () => {
    try {
      const likesMap = {};
      const userLikesMap = {};
      await Promise.all(
        comments.map(async (comment) => {
          const response = await axios.get(
            `http://localhost:8000/comments/${comment.id}/likes`
          );
          likesMap[comment.id] = response.data.length;
          userLikesMap[comment.id] = response.data.some(
            (like) => like.user_id === user.id
          );
        })
      );
      setLikes(likesMap);
      setUserLikes(userLikesMap);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [comments, user.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (comments.length > 0) {
      fetchLikes();
    }
  }, [comments, fetchLikes]);
  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const createdCommentResponse = await axios.post(
        `http://localhost:8000/comments/`,
        {
          user_id: user.id,
          comment: newComment,
        }
      );
      const createdComment = createdCommentResponse.data;

      await axios.post(`http://localhost:8000/challenges/${id}/comments`, {
        challenge_id: id,
        comment_id: createdComment.id,
      });

      setComments([...comments, createdComment]);
      setNewComment("");

      // Update the users state to include the current user's data
      setUsers((prevUsers) => ({
        ...prevUsers,
        [user.id]: user,
      }));

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  const handleEditComment = async (commentId) => {
    if (editingCommentText.trim() === "") {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/comments/${commentId}`,
        {
          comment: editingCommentText,
        }
      );
      const updatedComment = response.data;

      setComments(
        comments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );
      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success("Comment edited successfully!");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to edit comment.");
    }
  };

  const handleEditButtonClick = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(commentText);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8000/comments/${commentId}`);
      setComments(comments.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(`http://localhost:8000/comments/like`, {
        user_id: user.id,
        comment_id: commentId,
      });
      const liked = response.data;
      setLikes((prevLikes) => ({
        ...prevLikes,
        [commentId]: userLikes[commentId]
          ? (prevLikes[commentId] || 0) - 1
          : (prevLikes[commentId] || 0) + 1,
      }));
      setUserLikes((prevUserLikes) => ({
        ...prevUserLikes,
        [commentId]: !prevUserLikes[commentId],
      }));
      if (userLikes[commentId]) {
        toast.success("Comment unliked!");
      } else {
        toast.success("Comment liked!");
      }
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
    }
  };

  const getCommentLikes = (commentId) => {
    return likes[commentId] || 0;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="solo-challenge-container">
      <div className="grid-layout-solo">
        <div className="grid-item-solo left-solo">
          <div className="card-solo">
            <h3>{challenge.title}</h3>
            <p>
              <strong>Difficulty:</strong> {challenge.difficulty}
            </p>
            <p>
              <strong>Language:</strong> {challenge.language}
            </p>
            <p>{challenge.description}</p>
          </div>
          <div className="recommended-resources">
            <h3>Recommended Resources</h3>
            <ul>
              {recommendedResources.map((resource) => (
                <li key={resource.id}>
                  <Link to={`/resource/${resource.id}`}>{resource.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <button className="like-button" onClick={handleLikeChallenge}>
            Like ({challengeLikes})
          </button>
        </div>
        <div className="grid-item-solo right-solo">
          <div className="timer-container">
            <button
              onClick={toggleTimer}
              className={`timer-button ${isRunning ? "pause" : "start"}`}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <p className="timer-time">{formatTime()}</p>
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>

          <Editor
            height="550px"
            language={challenge.language.toLowerCase()}
            theme="vs-dark"
            value={code}
            onChange={(newValue) => setCode(newValue)}
            options={{
              readOnly: !isRunning,
            }}
          />
        </div>
      </div>
      <div className="challenge-comments-section">
        <div className="challenge-comments-header">
          <h3>Comments</h3>
          <div className="filter-container">
            <h5>Sort by: </h5>
            <select
              name="commentSortBy"
              className="filter-dropdown"
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="mostLiked">Most Liked</option>
            </select>
          </div>
        </div>
        {filteredSortedComments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <p>
              <strong>{users[comment.user_id]?.username}</strong> -{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <p>{comment.comment}</p>
            <div className="comment-actions">
              <button
                className="like-button"
                onClick={() => handleLikeComment(comment.id)}
              >
                Like ({getCommentLikes(comment.id)})
              </button>
              {user.id === comment.user_id && (
                <>
                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEditButtonClick(comment.id, comment.comment)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </>
              )}
              {user.role === "admin" && user.id !== comment.user_id && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
            {editingCommentId === comment.id && (
              <div className="edit-comment">
                <textarea
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                />
                <div className="edit-comment-buttons">
                  <button
                    className="save-button"
                    onClick={() => handleEditComment(comment.id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button className="add-button" onClick={handleAddComment}>
            Add Comment
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
export default SoloChallenge;

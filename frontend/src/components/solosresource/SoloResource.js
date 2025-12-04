import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./soloresource.css";

function SoloResource() {
  const { id } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [users, setUsers] = useState({});
  const [resourceLikes, setResourceLikes] = useState(0);
  const [userResourceLike, setUserResourceLike] = useState(false);
  const [commentFilter, setCommentFilter] = useState("latest");

  const fetchResource = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/resources/${id}`);
      setResource(response.data);
    } catch (error) {
      console.error("Error fetching resource:", error);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/resources/${id}/comments`
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

  const fetchResourceLikes = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/resources/like/${id}`
      );
      setResourceLikes(response.data.length);
      setUserResourceLike(
        response.data.some((like) => like.user_id === user.id)
      );
    } catch (error) {
      console.error("Error fetching resource likes:", error);
    }
  }, [id, user.id]);

  useEffect(() => {
    fetchResource();
    fetchComments();
    fetchResourceLikes();
  }, [fetchResource, fetchComments, fetchResourceLikes]);

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

      await axios.post(`http://localhost:8000/resources/${id}/comments`, {
        resource_id: id,
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

  const handleLikeResource = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/resources/like`,
        {
          user_id: user.id,
          resource_id: id,
        }
      );
      setResourceLikes((prevLikes) =>
        userResourceLike ? prevLikes - 1 : prevLikes + 1
      );
      setUserResourceLike((prevUserLike) => !prevUserLike);
      if (userResourceLike) {
        toast.success("Resource unliked!");
      } else {
        toast.success("Resource liked!");
      }
    } catch (error) {
      console.error("Error liking/unliking resource:", error);
    }
  };

  const getCommentLikes = (commentId) => {
    return likes[commentId] || 0;
  };

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

  if (!resource) {
    return <div>Loading...</div>;
  }

  return (
    <div className="soloresource-details-container">
      <ToastContainer />
      <div className="soloresource-card">
        <h2>{resource.title}</h2>
        <p>{resource.description}</p>
        <button onClick={handleLikeResource}>Like ({resourceLikes})</button>
      </div>
      <div className="comments-section">
        <div className="resource-comments-header">
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
    </div>
  );
}

export default SoloResource;

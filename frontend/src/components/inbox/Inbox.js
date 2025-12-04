import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Wheel from "../wheel/Wheel";
import "./inbox.css";

function Inbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardTimer, setRewardTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const rewards = [
    "5 points",
    "10 points",
    "15 points",
    "20 points",
    "25 points",
    "50 points",
    "75 points",
    "100 points",
    "5 points",
    "10 points",
  ];
  const segColors = [
    "#1a1a1a", // Dark gray
    "#333333", // Medium gray
    "#0d1b2a", // Dark blue
    "#1b263b", // Medium blue
    "#1a1a1a", // Dark gray
    "#333333", // Medium gray
    "#0d1b2a", // Dark blue
    "#1b263b", // Medium blue
    "#1a1a1a", // Dark gray
    "#333333", // Medium gray
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/notifications`
      );
      console.log("Fetched notifications:", response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user.id]);

  const fetchRewardTimer = useCallback(async () => {
    if (user.role === "admin") {
      setRewardTimer(0);
      setRemainingTime(0);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/reward-timer`
      );
      const timerInSeconds = Math.floor(response.data.timer * 3600);
      setRewardTimer(timerInSeconds);
      setRemainingTime(timerInSeconds);
    } catch (error) {
      console.error("Error fetching reward timer:", error);
    }
  }, [user.id, user.role]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchRewardTimer();
    }
  }, [user, fetchNotifications, fetchRewardTimer]);

  useEffect(() => {
    if (user.role !== "admin") {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user.role]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:8000/notifications/${notificationId}`
      );
      const updatedNotifications = notifications.filter(
        (n) => n.id !== notificationId
      );
      setNotifications(updatedNotifications);
      toast.success("Notification deleted successfully!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  const handleDailyRewardClick = () => {
    setShowRewardModal(true);
  };

  const onFinished = async (winner) => {
    const reward = parseInt(winner.split(" ")[0]);
    toast.success(`Congratulations! You got ${reward} reward points!`);
    setShowRewardModal(false);

    // Update reward points in the backend
    try {
      await axios.post(`http://localhost:8000/users/${user.id}/reward`, {
        points: reward,
      });
      if (user.role !== "admin") {
        fetchRewardTimer();
      }
    } catch (error) {
      console.error("Error updating reward points:", error);
      toast.error("Failed to update reward points.");
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  const sortedNotifications = [...notifications].sort((a, b) => a.id - b.id);

  return (
    <div className="inbox-container">
      <div className="grid-layout-inbox">
        <div className="grid-item-inbox invisible-inbox"></div>
        <div className="grid-item-inbox middle-inbox">
          <div className="main-container-inbox">
            <div className="card-inbox">
              <div className="card-text-inbox">
                <h3>Inbox</h3>
              </div>
              <div className="inner-card-inbox">
                <ul className="notifications-list">
                  <li className="notification-item">
                    <span className="notification-message">
                      {remainingTime > 0 && user.role !== "admin"
                        ? `Next reward available in ${formatTime(
                            remainingTime
                          )}`
                        : "Daily Reward Available! Click to spin the wheel."}
                    </span>
                    {remainingTime <= 0 || user.role === "admin" ? (
                      <button
                        className="button-inbox reward-button"
                        onClick={handleDailyRewardClick}
                      >
                        Claim Reward
                      </button>
                    ) : null}
                  </li>
                  {sortedNotifications.map((notification) => (
                    <li key={notification.id} className="notification-item">
                      <span className="notification-message">
                        {notification.message}
                      </span>
                      <div className="button-container-inbox">
                        <a
                          href={notification.link}
                          className="button-inbox accept-button"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                        >
                          Accept
                        </a>
                        <button
                          className="button-inbox reject-button"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="grid-item-inbox invisible-inbox"></div>
      </div>
      <ToastContainer />

      {/* Daily Reward Modal */}
      <Modal
        show={showRewardModal}
        onHide={() => setShowRewardModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Daily Reward</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="wheel-container">
            <Wheel
              segments={rewards}
              segColors={segColors}
              onFinished={onFinished}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRewardModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Inbox;

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Wheel from "../wheel/Wheel";
import "./inbox.css";

function Inbox({ updateNotifications }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardTimer, setRewardTimer] = useState(null);

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
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${user.id}/reward-timer`
      );
      setRewardTimer(response.data.timer);
    } catch (error) {
      console.error("Error fetching reward timer:", error);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchRewardTimer();
    }
  }, [user, fetchNotifications, fetchRewardTimer]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:8000/notifications/${notificationId}`
      );
      const updatedNotifications = notifications.filter(
        (n) => n.id !== notificationId
      );
      setNotifications(updatedNotifications);
      updateNotifications(updatedNotifications); // Update notifications in NavBar
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
      fetchRewardTimer();
    } catch (error) {
      console.error("Error updating reward points:", error);
      toast.error("Failed to update reward points.");
    }
  };

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
                  {notifications.map((notification) => (
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
                  <li className="notification-item">
                    <span className="notification-message">
                      {rewardTimer !== null && rewardTimer > 0
                        ? rewardTimer >= 1
                          ? `Next reward available in ${rewardTimer.toFixed(
                              2
                            )} hours`
                          : `Next reward available in ${(
                              rewardTimer * 60
                            ).toFixed(0)} minutes`
                        : "Daily Reward Available! Click to spin the wheel."}
                    </span>
                    {rewardTimer !== null && rewardTimer <= 0 && (
                      <button
                        className="button-inbox reward-button"
                        onClick={handleDailyRewardClick}
                      >
                        Claim Reward
                      </button>
                    )}
                  </li>
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

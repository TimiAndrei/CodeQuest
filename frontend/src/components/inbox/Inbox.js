import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./inbox.css";

function Inbox({ updateNotifications }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/notifications`
        );
        console.log("Fetched notifications:", response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

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
                      <span>{notification.message}</span>
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
    </div>
  );
}

export default Inbox;

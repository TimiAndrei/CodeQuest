import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./navbar.css";

function NavBar() {
  const [click, setClick] = useState(false);
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const handleClick = () => setClick(!click);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/users/${user.id}/notifications`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.length;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <img
            src="/logo_cq.png"
            alt="CodeQuest Logo"
            className="nav-logo-image"
          />
        </NavLink>

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          {user && (
            <li className="nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Dashboard
              </NavLink>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <NavLink
                to="/challenges"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Challenges
              </NavLink>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <NavLink
                to="/resources"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Resources
              </NavLink>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Leaderboard
              </NavLink>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Profile
              </NavLink>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                <i className="fas fa-envelope"></i> Inbox
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </NavLink>
            </li>
          )}
          {user && (
            <>
              <li className="nav-item">
                <span className="nav-links">{user.username.toUpperCase()}</span>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-links active logout-link"
                      : "nav-links logout-link"
                  }
                  onClick={logout}
                >
                  Logout
                </NavLink>
              </li>
            </>
          )}
          {!user && (
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-links active" : "nav-links"
                }
                onClick={handleClick}
              >
                Login
              </NavLink>
            </li>
          )}
        </ul>

        <div className="nav-icon" onClick={handleClick}>
          <span className="icon">{click ? "✖" : "☰"}</span>
        </div>
      </div>
      <ToastContainer />
    </nav>
  );
}

export default NavBar;

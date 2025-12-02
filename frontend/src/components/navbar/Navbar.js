import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../authentification/AuthContext";
import "./navbar.css";

function NavBar() {
  const [click, setClick] = useState(false);
  const { user, logout } = useAuth();

  const handleClick = () => setClick(!click);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <span className="logo-text">CodeQuest</span>
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
            <>
              <li className="nav-item">
                <span className="nav-links">{user.username.toUpperCase()}</span>
              </li>
              <li className="nav-item">
              <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-links active logout-link" : "nav-links logout-link"
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
    </nav>
  );
}

export default NavBar;

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

function NavBar() {
  const [click, setClick] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const handleClick = () => setClick(!click);

  // useEffect(() => { for later
  //   const userRole = sessionStorage.getItem("userRole");
  //   setShowLink(userRole === "ADMINISTRATOR");
  // }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <span className="logo-text">CodeQuest</span>
        </NavLink>

        <ul className={click ? "nav-menu active" : "nav-menu"}>

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
          <li className="nav-item">
            {window.innerWidth > 960 && (
              <span>{sessionStorage.getItem("username")}</span>
            )}
          </li>

        </ul>
        <div className="nav-icon" onClick={handleClick}>
          <span className="icon">{click ? "✖" : "☰"}</span>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

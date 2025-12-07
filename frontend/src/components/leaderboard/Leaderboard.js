import React, { useState, useEffect } from "react";
import { getUsers } from "../../api/users";
import "./leaderboard.css";

function Leaderboard() {

    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getUsers();
                console.log(data);

                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        fetchLeaderboard();
    }
    , []);
    return (
    <div className="leaderboard-container">
      <div className="grid-layout-leaderboard">
        <div className="grid-item-leaderboard invisible-leaderboard"></div>
        <div className="grid-item-leaderboard middle-leaderboard">
          <div className="main-container-leaderboard">
          {leaderboard.map((user) => (
                  <li key={user.id} className="list-item-leaderboard">
                    <span>{user.username}</span>
                    <span>{user.points}</span>
                  </li>
                ))}

            <div className="list-container-leaderboard">
              <ul className="list-leaderboard">
              
              </ul>
            </div>
          </div>
        </div>
        <div className="grid-item-leaderboard invisible-leaderboard"></div>
      </div>
    </div>
  );
}

export default Leaderboard;

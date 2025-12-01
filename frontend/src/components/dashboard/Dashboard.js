import React from "react";
import "./dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="grid-layout">

        <div className="grid-item invisible"></div>
        <div className="grid-item middle">
          <div className="main-container">
            <div className="card">
            <div className="card-text">
                <h3>Progress</h3>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: "30%" }}></div>
              </div>


            <div className="card-text">
                <h3>Badges</h3>
            </div>
            <div className="inner-card">
                <div className="icon">
                    <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="icon">
                    <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="icon">
                    <FontAwesomeIcon icon={faTrophy} />
                </div>
            </div>
              <div className="card-text">
                <h3>Current Level :  Dragulici warrior</h3>
               
              </div>
              <div className="bottom-text">
                <p>You need nrChallanges for lvl up </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-item invisible"></div>
      </div>
    </div>
  );
}

export default Dashboard;

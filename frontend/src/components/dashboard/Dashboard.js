import React from "react";
import "./dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="grid-layout-dashboard">
        <div className="grid-item-dashboard invisible-dashboard"></div>
        <div className="grid-item-dashboard middle-dashboard">
          <div className="main-container-dashboard">
            <div className="card-dashboard">
              <div className="card-text-dashboard">
                <h3>Progress</h3>
              </div>
              <div className="progress-bar-dashboard">
                <div className="progress-dashboard" style={{ width: "30%" }}></div>
              </div>
              <div className="card-text-dashboard">
                <h3>Badges</h3>
              </div>
              <div className="inner-card-dashboard">
                <div className="icon-dashboard">
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="icon-dashboard">
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="icon-dashboard">
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
              </div>
              <div className="card-text-dashboard">
                <h3>Current Level : Dragulici warrior</h3>
              </div>
              <div className="bottom-text-dashboard">
                <p>You need nrChallanges for lvl up</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid-item-dashboard invisible-dashboard"></div>
      </div>
    </div>
  );
}

export default Dashboard;

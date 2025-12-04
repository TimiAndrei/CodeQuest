import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuth } from "../authentification/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rank, setRank] = useState("");
  const [progress, setProgress] = useState(0);
  const [maxScore, setMaxScore] = useState(100); // Add maxScore state
  const [totalChallenges, setTotalChallenges] = useState(0); // Add totalChallenges state

  useEffect(() => {
    const fetchUserBadgesAndScore = async () => {
      try {
        const badgesResponse = await axios.get(
          `http://localhost:8000/users/${user.id}/badges`
        );
        setBadges(badgesResponse.data);

        const userResponse = await axios.get(
          `http://localhost:8000/users/${user.id}`
        );
        console.log("User Response:", userResponse.data); // Log the API response
        const userScore = userResponse.data.score;
        const userRewardPoints = userResponse.data.reward_points;
        setScore(userScore);
        setRewardPoints(userRewardPoints);
        console.log("Reward Points:", userRewardPoints); // Log the reward points

        if (userScore <= 50) {
          setRank("Beginner");
          setProgress((userScore / 50) * 100);
          setMaxScore(50); // Set maxScore for Beginner
        } else if (userScore <= 150) {
          setRank("Intermediate");
          setProgress(((userScore - 50) / (150 - 50)) * 100);
          setMaxScore(150); // Set maxScore for Intermediate
        } else if (userScore <= 300) {
          setRank("Master");
          setProgress(((userScore - 150) / (300 - 150)) * 100);
          setMaxScore(300); // Set maxScore for Master
        } else if (userScore <= 500) {
          setRank("Expert");
          setProgress(((userScore - 300) / (500 - 300)) * 100);
          setMaxScore(500); // Set maxScore for Expert
        } else {
          setRank("Legend");
          setProgress(100);
          setMaxScore(userScore); // Set maxScore for Legend
        }

        const challengesResponse = await axios.get(
          `http://localhost:8000/users/challenges/`,
          { params: { user_id: user.id } }
        );
        setTotalChallenges(challengesResponse.data.length);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserBadgesAndScore();
    }
  }, [user]);

  if (loading) {
    return <div className="loading-container"></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="grid-layout-dashboard">
        <div className="grid-item-dashboard invisible-dashboard"></div>
        <div className="grid-item-dashboard middle-dashboard">
          <div className="main-container-dashboard">
            <div className="card-dashboard">
              <div className="card-text-dashboard">
                <h3>Your Rank: {rank}</h3>
                <p>Score: {score}</p>
                <p>Total Challenges: {totalChallenges}</p> {/* Add this line */}
                <p>Reward points: {rewardPoints}</p>
              </div>
              <div
                className="progress-bar-dashboard"
                title={`${score}/${maxScore}`}
              >
                <div
                  className="progress-dashboard"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="card-text-dashboard">
                <h3>Badges</h3>
              </div>
              <div className="inner-card-dashboard">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <div key={badge.id} className="icon-dashboard">
                      <FontAwesomeIcon icon={faTrophy} />
                      <span>{badge.title}</span>
                    </div>
                  ))
                ) : (
                  <p>No badges earned yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

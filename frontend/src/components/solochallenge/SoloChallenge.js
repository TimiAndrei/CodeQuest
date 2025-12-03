import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./solochallenge.css";
import { getChallenge, submitCode } from "../../api/challenges";
import { useAuth } from "../authentification/AuthContext";
import api from "../../api/apiInstance";
import { Editor } from "@monaco-editor/react";

function SoloChallenge() {
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [recommendedResources, setRecommendedResources] = useState([]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const challengeData = await getChallenge(id);
        setChallenge(challengeData);
        setCode(getTextStart(challengeData.language));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch challenge:", err);
        setError("Challenge not found or an error occurred.");
        setLoading(false);
      }
    };

    const fetchRecommendedResources = async () => {
      try {
        const response = await api.get(
          `/challenges/${id}/recommended-resources`
        );
        setRecommendedResources(response.data);
      } catch (err) {
        console.error("Failed to fetch recommended resources:", err);
      }
    };

    fetchChallenge();
    fetchRecommendedResources();
  }, [id]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const handleSubmit = async () => {
    const challengeId = parseInt(id, 10);
    const languageId = getLanguageId(challenge.language);
    const stdin = challenge.input;
    const expectedOutput = challenge.output;

    try {
      const result = await submitCode(
        challengeId,
        code,
        languageId,
        stdin,
        expectedOutput,
        user.id // Pass the user ID
      );
      console.log("API Response:", result);

      if (result?.stdout) {
        setOutput(result.stdout);
        if (result.points_awarded) {
          const timeTaken = formatTime();
          alert(
            `Congratulations! You have solved the problem in ${timeTaken} and have been awarded ${result.points_awarded} points.`
          );
          setTime(0); // Reset the timer
          setIsRunning(false); // Stop the timer
        }
        if (result.badge_awarded) {
          alert(
            `Congratulations! You have been awarded the badge: ${result.badge_awarded}`
          );
        }
      } else {
        setOutput("No output or an error occurred.");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      alert(error.response?.data?.detail || "Submission failed.");
      setOutput("Error submitting code.");
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getTextStart = (language) => {
    switch (language?.toUpperCase()) {
      case "JAVA":
        return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      case "PYTHON":
        return `def main():\n    # Write your code here\n\nif __name__ == "__main__":\n    main()`;
      case "C++":
        return `#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      case "JAVASCRIPT":
        return `function main() {\n    // Write your code here\n}\n\nmain();`;
      default:
        return "// Start coding here...";
    }
  };

  const getLanguageId = (language) => {
    switch (language?.toUpperCase()) {
      case "PYTHON":
        return 71;
      case "JAVASCRIPT":
        return 63;
      case "JAVA":
        return 62;
      case "C++":
        return 54;
      default:
        return 71; // Default to Python
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="solo-challenge-container">
      <div className="grid-layout-solo">
        <div className="grid-item-solo left-solo">
          <div className="card-solo">
            <h3>{challenge.title}</h3>
            <p>
              <strong>Difficulty:</strong> {challenge.difficulty}
            </p>
            <p>
              <strong>Language:</strong> {challenge.language}
            </p>
            <p>{challenge.description}</p>
          </div>
          <div className="recommended-resources">
            <h3>Recommended Resources</h3>
            <ul>
              {recommendedResources.map((resource) => (
                <li key={resource.id}>
                  <Link to={`/resource/${resource.id}`}>{resource.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid-item-solo right-solo">
          <div className="language-display">
            <i className="fa-solid fa-code"></i> {challenge.language}
          </div>
          <div className="timer-container">
            <button
              onClick={toggleTimer}
              className={`timer-button ${isRunning ? "pause" : "start"}`}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <p className="timer-time">{formatTime()}</p>
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
          </div>

          <Editor
            height="400px"
            language={challenge.language.toLowerCase()}
            theme="vs-dark"
            value={code}
            onChange={(newValue) => setCode(newValue)}
            options={{
              readOnly: !isRunning,
            }}
          />
          {output && (
            <div className="output-container">
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SoloChallenge;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./solochallenge.css";
import { getChallenge } from "../../api/challenges";

function SoloChallenge() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const challengeData = await getChallenge(id);
        setChallenge(challengeData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch challenge:", err);
        setError("Challenge not found or an error occurred.");
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleSubmit = () => {
    alert("Code submitted!");
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="solo-challenge-container">Loading...</div>;
  }

  if (error) {
    return <div className="solo-challenge-container">{error}</div>;
  }

  const getTextStart = (language) =>{
    let returnString = "";
    console.log("Return string" + returnString)
    console.log(language + " Lang")

    console.log(    language.toUpperCase()
      + " Lang")
    switch(language.toUpperCase()){
      case "JAVA":
        returnString = "public class Main {\n" +
        "    public static void main(String[] args) {\n" +
        "        // Write your code here\n" +
        "    }\n" +
        "}";
        return returnString
      case "PYTHON":
        console.log(returnString)
        returnString = "def main():\n" +
        "    # Write your code here\n" +
        "\n" +
        "if __name__ == \"__main__\":\n" +
        "    main()";
        return returnString
        
      case "GO":
        returnString = "package main\n" +
        "\n" +
        "import \"fmt\"\n" +
        "\n" +
        "func main() {\n" +
        "    // Write your code here\n" +
        "}";
        return returnString
      case "C":
        returnString = "#include <stdio.h>\n" +
        "\n" +
        "int main() {\n" +
        "    // Write your code here\n" +
        "    return 0;\n" +
        "}";
        return returnString

      case "C++":
        returnString = "#include <iostream>\n" +
        "\n" +
        "int main() {\n" +
        "    // Write your code here\n" +
        "    return 0;\n" +
        "}";
        return returnString
      case "JAVASCRIPT":
        returnString = "function main() {\n" +
        "    // Write your code here\n" +
        "}\n" +
        "\n" +
        "main();";
        return returnString
      default :
        returnString = "Will be implemented"
        return returnString
    }
  }
  return (
    <div className="solo-challenge-container">
      <div className="grid-layout-solo">
        <div className="grid-item-solo left-solo">
          <div className="card-solo">
            <h3>Challenge Details</h3>
            <p>
              <strong>Difficulty:</strong> {challenge.difficulty}
            </p>
            <p>
              <strong>Language:</strong> {challenge.language}
            </p>
            <p>
              <strong>Description:</strong> {challenge.description}
            </p>
          </div>
          <div className="card-solo">
            <h3>Expected Output</h3>
            <p>{challenge.output}</p>
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
            <button onClick={handleSubmit}  className="submit-button">
              Submit
            </button>
          </div>

          <textarea
            name="postContent"
            defaultValue = {getTextStart(challenge.language)}
            rows={20}
            cols={80}
          />
        </div>
      </div>
    </div>
  );
}

export default SoloChallenge;

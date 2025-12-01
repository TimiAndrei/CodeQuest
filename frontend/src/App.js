import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UsersPage from "./components/user/UsersPage";
import Navbar from "./components/navbar/Navbar";
import Dashboard from "./components/dashboard/Dashboard.js";
//not implemented yet
import Challenges from "./components/challenges/Challenges";
// import Leaderboard from "./components/leaderboard/Leaderboard";
function App() {
  return (
    <div className="App">
      <Router>
        <Navbar /> 
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/challenges" element={<Challenges/>} />
          {/* <Route path="/leaderboard" element={<Leaderboard/>} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;

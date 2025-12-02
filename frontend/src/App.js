import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UsersPage from "./components/user/UsersPage";
import Navbar from "./components/navbar/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import Challenges from "./components/challenges/Challenges";
import SoloChallenge from "./components/solochallenge/SoloChallenge";
import Resources from "./components/resources/Resources";
import SoloResource from "./components/solosresource/SoloResource";
import Leaderboard from "./components/leaderboard/Leaderboard";
import LandingPage from "./components/landingpage/LandingPage";
import { AuthProvider } from "./components/authentification/AuthContext";
import PrivateRoute from "./components/authentification/PrivateRoute";
import LoginPage from "./components/authentification/LoginPage";
function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <PrivateRoute>
                  <Challenges />
                </PrivateRoute>
              }
            />
            <Route
              path="/soloChallenge/:id"
              element={
                <PrivateRoute>
                  <SoloChallenge />
                </PrivateRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <PrivateRoute>
                  <Resources />
                </PrivateRoute>
              }
            />
            <Route
              path="/resource/:id"
              element={
                <PrivateRoute>
                  <SoloResource />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

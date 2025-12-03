import "./App.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import SignUpPage from "./components/authentification/SignUpPage";
import UserPage from "./components/userpage/UserPage";
import Inbox from "./components/inbox/Inbox";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
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
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <PrivateRoute>
                  <Inbox />
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

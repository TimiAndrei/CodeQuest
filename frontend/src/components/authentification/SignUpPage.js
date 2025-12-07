import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./loginPage.css";

function SignUpPage() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signUp({ username, email, password });
      setSuccess("Account created successfully! You can now log in.");
      setError("");
    } catch (err) {
      setError("Failed to create account. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-box">
        <h1 className="login-page-title">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="login-page-form-group">
            <label className="login-page-form-label">Username</label>
            <input
              type="text"
              className="login-page-form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="login-page-form-group">
            <label className="login-page-form-label">Email</label>
            <input
              type="email"
              className="login-page-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-page-form-group">
            <label className="login-page-form-label">Password</label>
            <input
              type="password"
              className="login-page-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-page-form-group">
            <label className="login-page-form-label">Confirm Password</label>
            <input
              type="password"
              className="login-page-form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-page-error-message">{error}</p>}
          {success && <p className="login-page-success-message">{success}</p>}
          <button type="submit" className="login-page-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;

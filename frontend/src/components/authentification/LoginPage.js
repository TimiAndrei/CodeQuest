import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./loginPage.css";

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-box">
        <h1 className="login-page-title">Login</h1>
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
            <label className="login-page-form-label">Password</label>
            <input
              type="password"
              className="login-page-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-page-error-message">{error}</p>}
          <button type="submit" className="login-page-button">Login</button>
        </form>
        <p>
  Don't have an account? <a href="/signup">Sign up here</a>.
</p>

      </div>
    </div>
  );
}

export default LoginPage;

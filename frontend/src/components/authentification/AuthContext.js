import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    JSON.parse(localStorage.getItem("isAuthenticated")) || false
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    localStorage.setItem("user", JSON.stringify(user));
  }, [isAuthenticated, user]);

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:8000/login/", {
        username,
        password,
      });
      setIsAuthenticated(true);
      setUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      throw new Error("Invalid credentials");
    }
  };

  const signUp = async ({ username, email, password }) => {
    try {
      const response = await axios.post("http://localhost:8000/users/", {
        username,
        email,
        password,
        role: "user",
      });
      setIsAuthenticated(true);
      setUser(response.data);
      navigate("/dashboard");
    } catch (err) {
      throw new Error("Failed to sign up");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

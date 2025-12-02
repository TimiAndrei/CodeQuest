import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

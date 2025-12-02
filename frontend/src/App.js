import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UsersPage from "./pages/UsersPage";


function App() {
  return (
    <div className="App">
   <Router>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;

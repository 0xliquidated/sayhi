import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App.jsx";
import Testnets from "./Testnets.jsx";
import "./App.css"; // Ensure this import is present

function AppRouter() {
  return (
    <BrowserRouter>
      <div>
        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/testnets" className="nav-link">Testnets</Link>
            </li>
          </ul>
        </nav>
        {/* Routed Pages */}
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/testnets" element={<Testnets />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
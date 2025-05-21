import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App.jsx";
import Testnets from "./Testnets.jsx";
import "./App.css";

function AppRouter() {
  const [theme, setTheme] = useState(() => {
    // Load the saved theme from localStorage, default to "main"
    return localStorage.getItem("theme") || "main";
  });

  // Apply the theme to the body class on mount and when theme changes
  useEffect(() => {
    document.body.className = ""; // Clear existing classes
    if (theme === "windows") {
      document.body.classList.add("windows-theme");
    } else if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else if (theme === "cyber") {
      document.body.classList.add("cyber-theme");
    } else if (theme === "sunrise") {
      document.body.classList.add("sunrise-theme");
    } else if (theme === "oceans") {
      document.body.classList.add("oceans-theme");
    } else if (theme === "vibe") {
      document.body.classList.add("vibe-theme");
    }
    // Save the theme to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

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
        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-column">
              <h3>Placeholder</h3>
            </div>
            <div className="footer-column">
              <h3>Menu</h3>
              <ul>
                <li><Link to="/" className="footer-link">Home</Link></li>
                <li><Link to="/testnets" className="footer-link">Testnets</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Theme</h3>
              <select className="theme-select" value={theme} onChange={handleThemeChange}>
                <option value="main">Main</option>
                <option value="windows">Windows</option>
                <option value="dark">Dark</option>
                <option value="cyber">Cyber</option>
                <option value="sunrise">Sunrise</option>
                <option value="oceans">Oceans</option>
                <option value="vibe">Vibe</option>
              </select>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
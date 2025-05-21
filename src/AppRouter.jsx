import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App.jsx";
import Testnets from "./Testnets.jsx";
import "./App.css";

const THEMES = {
  main: "",
  windows: "windows-theme",
  dark: "dark-theme",
  cyber: "cyber-theme",
  sunrise: "sunrise-theme",
  oceans: "oceans-theme",
  vibe: "vibe-theme",
  rainbows: "rainbows-theme"
};

function AppRouter() {
  const [theme, setTheme] = useState(() => {
    // Load the saved theme from localStorage, default to "main"
    return localStorage.getItem("theme") || "main";
  });

  // Apply the theme to the body class on mount and when theme changes
  useEffect(() => {
    document.body.className = THEMES[theme] || "";
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
                {Object.keys(THEMES).map(themeName => (
                  <option key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
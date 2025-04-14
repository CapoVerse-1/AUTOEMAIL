import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="app-navbar">
          <div className="app-logo">
            <h1>Email Campaign Tool</h1>
          </div>
          <ul className="nav-links">
            <li><a href="/settings">Settings</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </nav>
        
        <main className="app-content">
          <Routes>
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/settings" replace />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>© 2025 Email Campaign Tool. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

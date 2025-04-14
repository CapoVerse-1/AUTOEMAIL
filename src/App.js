import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Header />
          <div className="main-container">
            <Sidebar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

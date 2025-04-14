import React, { useState, useContext } from 'react';
import { FaBell, FaUser, FaSearch, FaEllipsisH, FaEnvelope, FaCog, FaSignOutAlt, FaQuestion } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import '../styles/Header.css';

const Header = () => {
  const { user } = useAppContext();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <FaEnvelope />
          <span>Email Tool</span>
        </div>

        <div className="header-search">
          <FaSearch />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <button 
          className="header-action"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        
        {showNotifications && (
          <div className="dropdown">
            <div className="dropdown-item">
              <strong>Your campaign "Sales Outreach" has completed</strong>
            </div>
            <div className="dropdown-item">
              <strong>New email template has been added</strong>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item">
              <strong>View all notifications</strong>
            </div>
          </div>
        )}

        <div className="header-user" onClick={() => setShowUserDropdown(!showUserDropdown)}>
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Admin'}</div>
          </div>
          <FaEllipsisH />
        </div>
        
        {showUserDropdown && (
          <div className="dropdown">
            <a href="#profile" className="dropdown-item">
              <FaUser />
              <span>Profile</span>
            </a>
            <a href="#settings" className="dropdown-item">
              <FaCog />
              <span>Settings</span>
            </a>
            <a href="#help" className="dropdown-item">
              <FaQuestion />
              <span>Help</span>
            </a>
            <div className="dropdown-divider"></div>
            <a href="#logout" className="dropdown-item">
              <FaSignOutAlt />
              <span>Sign out</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 
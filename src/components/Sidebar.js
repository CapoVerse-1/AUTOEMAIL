import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome,
  FaProjectDiagram, 
  FaFileAlt, 
  FaCog
} from 'react-icons/fa';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaProjectDiagram />
              <span>Projects</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/templates" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaFileAlt />
              <span>Templates</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaCog />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 
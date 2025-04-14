import React from 'react';

const Projects = () => {
  return (
    <div className="projects-container">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage your email projects</p>
      </div>
      
      <div className="projects-content">
        <div className="projects-grid">
          {/* Project cards will be displayed here */}
          <div className="empty-state">
            <h2>No projects yet</h2>
            <p>Create your first project to get started with email automation</p>
            <button className="btn btn-primary">
              Create New Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 
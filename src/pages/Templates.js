import React from 'react';

const Templates = () => {
  return (
    <div className="templates-container">
      <div className="page-header">
        <h1>Email Templates</h1>
        <p>Manage your email templates</p>
      </div>
      
      <div className="templates-content">
        <div className="templates-grid">
          {/* Template cards will be displayed here */}
          <div className="empty-state">
            <h2>No templates yet</h2>
            <p>Create your first template to streamline your email generation</p>
            <button className="btn btn-primary">
              Create New Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  
  // State for project profiles
  const [profiles, setProfiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  
  // New project state
  const [newProject, setNewProject] = useState({
    id: '',
    name: '',
    useCase: '',
    businessDetails: '',
    tempEmail: '',
    greeting: '',
    outro: '',
    customPrompt: '',
    isActive: false
  });
  
  // Load saved profiles from local storage on component mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('projectProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
  }, []);
  
  // Save profiles to local storage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('projectProfiles', JSON.stringify(profiles));
    }
  }, [profiles]);
  
  // Handle input changes for the new project
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open popup and reset new project state
  const handleAddProject = () => {
    setNewProject({
      id: Date.now().toString(),
      name: '',
      useCase: '',
      businessDetails: '',
      tempEmail: '',
      greeting: '',
      outro: '',
      customPrompt: '',
      isActive: false
    });
    setCurrentStep(1);
    setProgressPercent(0);
    setShowPopup(true);
  };
  
  // Handle next step in the wizard
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1 && !newProject.name) {
      alert('Please enter a project name');
      return;
    }
    
    if (currentStep === 2 && !newProject.useCase) {
      alert('Please describe your use case');
      return;
    }
    
    if (currentStep === 3 && !newProject.businessDetails) {
      alert('Please provide your business details');
      return;
    }
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Calculate progress percentage (6 steps total)
    const progress = Math.min(Math.floor((nextStep - 1) * 100 / 6), 100);
    setProgressPercent(progress);
  };
  
  // Handle previous step in the wizard
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Calculate progress percentage
      const progress = Math.floor((prevStep - 1) * 100 / 6);
      setProgressPercent(progress);
    }
  };
  
  // Skip optional step
  const handleSkipStep = () => {
    handleNextStep();
  };
  
  // Create the new project
  const handleCreateProject = () => {
    // Add the new project to profiles
    setProfiles(prev => [...prev, newProject]);
    
    // Close the popup
    setShowPopup(false);
  };
  
  // Toggle project active status
  const toggleProjectActive = (id) => {
    setProfiles(prev => 
      prev.map(profile => {
        // Deactivate all projects first
        if (profile.id === id) {
          return { ...profile, isActive: !profile.isActive };
        } else {
          return { ...profile, isActive: false };
        }
      })
    );
    
    // Store active project in localStorage
    const activeProject = profiles.find(p => p.id === id);
    if (activeProject) {
      localStorage.setItem('activeProjectSettings', JSON.stringify(activeProject));
    }
  };
  
  // Delete a project
  const handleDeleteProject = (id, e) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProfiles(prev => prev.filter(profile => profile.id !== id));
    }
  };
  
  // Go to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="wizard-step">
            <h3>What's your project name?</h3>
            <input 
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Project name"
              className="wizard-input"
            />
          </div>
        );
      case 2:
        return (
          <div className="wizard-step">
            <h3>Describe your use case</h3>
            <textarea 
              name="useCase"
              value={newProject.useCase}
              onChange={handleInputChange}
              placeholder="Describe your email campaign's purpose..."
              className="wizard-textarea"
            />
          </div>
        );
      case 3:
        return (
          <div className="wizard-step">
            <h3>Tell us about your business</h3>
            <textarea 
              name="businessDetails"
              value={newProject.businessDetails}
              onChange={handleInputChange}
              placeholder="Provide details about your business..."
              className="wizard-textarea"
            />
          </div>
        );
      case 4:
        return (
          <div className="wizard-step">
            <h3>Template Email (Optional)</h3>
            <textarea 
              name="tempEmail"
              value={newProject.tempEmail}
              onChange={handleInputChange}
              placeholder="Optional sample email that guides the AI..."
              className="wizard-textarea"
            />
          </div>
        );
      case 5:
        return (
          <div className="wizard-step">
            <h3>Standard Messages</h3>
            <label>Greeting</label>
            <input 
              type="text"
              name="greeting"
              value={newProject.greeting}
              onChange={handleInputChange}
              placeholder="e.g., Hello,"
              className="wizard-input"
            />
            <label>Outro</label>
            <input 
              type="text"
              name="outro"
              value={newProject.outro}
              onChange={handleInputChange}
              placeholder="e.g., Best regards,"
              className="wizard-input"
            />
          </div>
        );
      case 6:
        return (
          <div className="wizard-step">
            <h3>Custom ChatGPT Instructions</h3>
            <textarea 
              name="customPrompt"
              value={newProject.customPrompt}
              onChange={handleInputChange}
              placeholder="Give specific instructions to ChatGPT (e.g., tone, style, points to emphasize...)"
              className="wizard-textarea"
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="settings-dashboard">
      <div className="dashboard-header">
        <h1>Project Settings</h1>
        <button className="add-project-button" onClick={handleAddProject}>
          <span>+</span> Add Project
        </button>
      </div>
      
      {profiles.length === 0 ? (
        <div className="empty-projects">
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {profiles.map(profile => (
            <div key={profile.id} className="project-card">
              <div className="project-card-header">
                <h3>{profile.name}</h3>
                <button 
                  className="delete-project-button"
                  onClick={(e) => handleDeleteProject(profile.id, e)}
                >
                  ×
                </button>
              </div>
              <div className="project-card-content">
                <p className="project-description">{profile.useCase.substring(0, 80)}...</p>
                <div className="project-toggle">
                  <span>Active</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={profile.isActive}
                      onChange={() => toggleProjectActive(profile.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {profiles.some(p => p.isActive) && (
        <div className="dashboard-actions">
          <button className="go-dashboard-button" onClick={goToDashboard}>
            Go to Dashboard
          </button>
        </div>
      )}
      
      {/* Add Project Wizard Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="wizard-popup">
            <button className="close-popup" onClick={() => setShowPopup(false)}>×</button>
            
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            
            <div className="wizard-content">
              {renderStepContent()}
            </div>
            
            <div className="wizard-actions">
              {currentStep > 1 && (
                <button className="wizard-back-button" onClick={handlePrevStep}>
                  Back
                </button>
              )}
              
              {currentStep < 6 && (
                <button className="wizard-next-button" onClick={handleNextStep}>
                  Next
                </button>
              )}
              
              {currentStep >= 4 && currentStep < 6 && (
                <button className="wizard-skip-button" onClick={handleSkipStep}>
                  Skip
                </button>
              )}
              
              {currentStep === 6 && (
                <button className="wizard-create-button" onClick={handleCreateProject}>
                  Create Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 
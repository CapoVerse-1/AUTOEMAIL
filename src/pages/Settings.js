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
  
  // Total number of steps in the wizard
  const totalSteps = 6;
  
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
    
    // Calculate progress percentage
    const progress = Math.min(Math.floor((nextStep - 1) * 100 / totalSteps), 100);
    setProgressPercent(progress);
    
    // If we've reached the last step, create the project
    if (nextStep > totalSteps) {
      handleCreateProject();
    }
  };
  
  // Handle previous step in the wizard
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Calculate progress percentage
      const progress = Math.floor((prevStep - 1) * 100 / totalSteps);
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
    
    // Set the new project as active
    toggleProjectActive(newProject.id);
  };
  
  // Toggle project active status
  const toggleProjectActive = (id) => {
    const updatedProfiles = profiles.map(profile => ({
      ...profile,
      isActive: profile.id === id
    }));
    
    setProfiles(updatedProfiles);
    
    // Store active project in localStorage
    const activeProject = profiles.find(p => p.id === id) || 
                         (newProject.id === id ? newProject : null);
    
    if (activeProject) {
      localStorage.setItem('activeProjectSettings', JSON.stringify({
        ...activeProject,
        isActive: true
      }));
    }
  };
  
  // Delete a project
  const handleDeleteProject = (id, e) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      
      // If the deleted project was active, clear the active project
      const deletedProject = profiles.find(p => p.id === id);
      if (deletedProject && deletedProject.isActive) {
        localStorage.removeItem('activeProjectSettings');
      }
    }
  };
  
  // Go to dashboard
  const goToDashboard = () => {
    // Check if there's an active project
    const activeProject = profiles.find(p => p.isActive);
    if (!activeProject) {
      alert('Please activate a project before proceeding to the dashboard.');
      return;
    }
    
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
              rows={4}
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
              rows={4}
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
              rows={5}
            />
            <p className="hint-text">This step is optional. You can skip it if you don't have a template email.</p>
          </div>
        );
      case 5:
        return (
          <div className="wizard-step">
            <h3>Standard Messages</h3>
            <div className="input-group">
              <label>Greeting</label>
              <input 
                type="text"
                name="greeting"
                value={newProject.greeting}
                onChange={handleInputChange}
                placeholder="e.g., Hello,"
                className="wizard-input"
              />
            </div>
            <div className="input-group">
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
              rows={5}
            />
            <p className="hint-text">These instructions will guide the AI in generating personalized emails.</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="settings-container">
      <h1>Project Settings</h1>
      
      <div className="settings-content">
        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects</h2>
            <button className="add-project-btn" onClick={handleAddProject}>
              + New Project
            </button>
          </div>
          
          <div className="projects-list">
            {profiles.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Create your first project to get started.</p>
              </div>
            ) : (
              profiles.map(profile => (
                <div 
                  key={profile.id} 
                  className={`project-card ${profile.isActive ? 'active' : ''}`}
                  onClick={() => toggleProjectActive(profile.id)}
                >
                  <div className="project-info">
                    <h3>{profile.name}</h3>
                    <p>{profile.useCase}</p>
                    {profile.isActive && (
                      <span className="active-badge">Active</span>
                    )}
                  </div>
                  <button 
                    className="delete-project-btn"
                    onClick={(e) => handleDeleteProject(profile.id, e)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="dashboard-link">
          <button className="dashboard-btn" onClick={goToDashboard}>
            Go to Dashboard
          </button>
          <p>Manage your emails and company data in the dashboard.</p>
        </div>
      </div>
      
      {showPopup && (
        <div className="popup-overlay">
          <div className="project-popup">
            <button className="close-popup" onClick={() => setShowPopup(false)}>×</button>
            
            <div className="popup-header">
              <h2>Create New Project</h2>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="step-indicator">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            
            <div className="popup-content">
              {renderStepContent()}
            </div>
            
            <div className="popup-actions">
              {currentStep > 1 && (
                <button className="prev-btn" onClick={handlePrevStep}>
                  Back
                </button>
              )}
              
              {currentStep === 4 && (
                <button className="skip-btn" onClick={handleSkipStep}>
                  Skip
                </button>
              )}
              
              <button 
                className="next-btn" 
                onClick={handleNextStep}
              >
                {currentStep === totalSteps ? 'Create Project' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 
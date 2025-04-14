import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  
  // State for project settings
  const [projectSettings, setProjectSettings] = useState({
    useCase: '',
    businessDetails: '',
    tempEmail: '',
    greeting: '',
    outro: '',
    customPrompt: ''
  });
  
  // State for saved project profiles
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save current project settings as a profile
  const saveProfile = () => {
    const newProfile = {
      id: Date.now().toString(),
      name: projectSettings.useCase || `Project ${profiles.length + 1}`,
      ...projectSettings
    };
    
    // Add to profiles
    setProfiles(prev => [...prev, newProfile]);
    
    // TODO: Save to Supabase database
    
    // Set as active profile
    setActiveProfile(newProfile.id);
    
    alert('Project profile saved successfully!');
  };
  
  // Load a saved profile
  const loadProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setProjectSettings(profile);
      setActiveProfile(profile.id);
    }
  };
  
  // Activate the current project settings
  const activateProject = () => {
    // Check if all required fields are filled
    if (!projectSettings.useCase || !projectSettings.businessDetails) {
      alert('Please fill in all required fields before activating the project.');
      return;
    }
    
    // TODO: Store in local storage or database
    localStorage.setItem('activeProjectSettings', JSON.stringify(projectSettings));
    
    // Navigate to main page
    navigate('/dashboard');
  };
  
  return (
    <div className="settings-container">
      <h1>Project Settings</h1>
      <p>Configure your project settings to customize email generation</p>
      
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="useCase">Use Case Description *</label>
          <textarea 
            id="useCase"
            name="useCase"
            value={projectSettings.useCase}
            onChange={handleInputChange}
            placeholder="Describe your email campaign's purpose..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="businessDetails">Business Details *</label>
          <textarea 
            id="businessDetails"
            name="businessDetails"
            value={projectSettings.businessDetails}
            onChange={handleInputChange}
            placeholder="Provide details about your business..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tempEmail">Template Email (Optional)</label>
          <textarea 
            id="tempEmail"
            name="tempEmail"
            value={projectSettings.tempEmail}
            onChange={handleInputChange}
            placeholder="Optional sample email that guides the AI..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="greeting">Standard Greeting</label>
          <input 
            type="text"
            id="greeting"
            name="greeting"
            value={projectSettings.greeting}
            onChange={handleInputChange}
            placeholder="e.g., Hello,"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="outro">Standard Outro</label>
          <input 
            type="text"
            id="outro"
            name="outro"
            value={projectSettings.outro}
            onChange={handleInputChange}
            placeholder="e.g., Best regards,"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="customPrompt">Custom ChatGPT Prompt Instructions</label>
          <textarea 
            id="customPrompt"
            name="customPrompt"
            value={projectSettings.customPrompt}
            onChange={handleInputChange}
            placeholder="Give specific instructions to ChatGPT (e.g., tone, style, points to emphasize...)"
          />
        </div>
        
        <div className="button-group">
          <button 
            className="save-button"
            onClick={saveProfile}
          >
            Save as Profile
          </button>
          
          <button 
            className="activate-button"
            onClick={activateProject}
          >
            Activate Project
          </button>
        </div>
      </div>
      
      {profiles.length > 0 && (
        <div className="saved-profiles">
          <h2>Saved Profiles</h2>
          <div className="profiles-list">
            {profiles.map(profile => (
              <div 
                key={profile.id} 
                className={`profile-item ${activeProfile === profile.id ? 'active' : ''}`}
                onClick={() => loadProfile(profile.id)}
              >
                <h3>{profile.name}</h3>
                <p>{profile.useCase.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 
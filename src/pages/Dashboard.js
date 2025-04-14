import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import companyDataFields from '../data/companyDataFields';
import ExcelImporter from '../components/ExcelImporter';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // States
  const [cards, setCards] = useState([]);
  const [projectSettings, setProjectSettings] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  
  // Load project settings from localStorage on component mount
  useEffect(() => {
    const settings = localStorage.getItem('activeProjectSettings');
    if (!settings) {
      // Redirect to settings if no active project is found
      alert('Please set up and activate a project first.');
      navigate('/settings');
      return;
    }
    
    try {
      setProjectSettings(JSON.parse(settings));
    } catch (error) {
      console.error('Error parsing project settings:', error);
      alert('Error loading project settings. Please set up a new project.');
      navigate('/settings');
    }
  }, [navigate]);
  
  // Handle manual card addition
  const addCard = () => {
    const newCard = {
      id: Date.now().toString(),
      email: '',
      companyName: '',
      companyDescription: '',
      contactPerson: '',
      generatedEmail: null,
      isLoading: false,
      isSent: false
    };
    
    setCards(prev => [...prev, newCard]);
  };
  
  // Open Excel importer popup
  const openExcelImporter = () => {
    setShowImporter(true);
  };
  
  // Handle imported data from Excel
  const handleImportedData = (rows) => {
    // Transform rows to cards
    const newCards = rows.map(row => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      email: row['email'] || '',
      companyName: row['company name'] || '',
      companyDescription: row['company description'] || '',
      contactPerson: row['contact person'] || '',
      generatedEmail: null,
      isLoading: false,
      isSent: false
    }));
    
    setCards(prev => [...prev, ...newCards]);
    alert(`Successfully imported ${newCards.length} company records.`);
  };
  
  // Generate emails for all cards
  const generateEmails = async () => {
    if (!projectSettings) {
      alert('Please set up and activate a project first.');
      navigate('/settings');
      return;
    }
    
    if (cards.length === 0) {
      alert('Please add at least one company card before generating emails.');
      return;
    }
    
    setIsGenerating(true);
    
    // Clone the current cards
    const updatedCards = [...cards];
    
    // Process each card sequentially
    for (let i = 0; i < updatedCards.length; i++) {
      // Skip already generated emails unless they're being regenerated
      if (updatedCards[i].generatedEmail && !updatedCards[i].isLoading) continue;
      
      updatedCards[i].isLoading = true;
      setCards([...updatedCards]);
      
      try {
        // API call to generate email
        // This would typically be a real API call to your backend 
        // For now, we'll simulate it with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate a response
        const generatedEmail = `Dear ${updatedCards[i].contactPerson || 'Team'},\n\nI hope this email finds you well. I recently came across ${updatedCards[i].companyName} and was impressed by your work in ${updatedCards[i].companyDescription}.\n\nI would love to discuss potential collaboration opportunities with you.\n\nBest regards,\nYour Name`;
        
        // Update the card with the generated email
        updatedCards[i].generatedEmail = generatedEmail;
        updatedCards[i].isLoading = false;
        
      } catch (error) {
        console.error('Error generating email:', error);
        updatedCards[i].isLoading = false;
        updatedCards[i].error = error.message;
      }
      
      // Update the state with the latest changes
      setCards([...updatedCards]);
    }
    
    setIsGenerating(false);
  };
  
  // Update a specific card
  const updateCard = (id, data) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...data } : card
    ));
  };
  
  // Delete a card
  const deleteCard = (id) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };
  
  // Handle card edits
  const editCardEmail = (id, newContent) => {
    updateCard(id, { generatedEmail: newContent });
  };
  
  return (
    <div className="dashboard-container">
      <h1>Email Dashboard</h1>
      
      {projectSettings && (
        <div className="project-info">
          <h2>Active Project: {projectSettings.useCase || projectSettings.name}</h2>
        </div>
      )}
      
      <div className="actions-bar">
        <button className="action-button" onClick={addCard}>Add Card Manually</button>
        <button className="action-button" onClick={openExcelImporter}>Import Excel</button>
        <button 
          className={`action-button ${isGenerating ? 'loading' : ''}`}
          onClick={generateEmails}
          disabled={isGenerating || cards.length === 0}
        >
          {isGenerating ? 'Generating...' : 'Generate Emails'}
        </button>
      </div>
      
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating personalized emails...</p>
        </div>
      )}
      
      <div className="cards-container">
        {cards.length === 0 ? (
          <div className="empty-state">
            <p>No company cards yet. Add cards manually or import from Excel.</p>
          </div>
        ) : (
          cards.map(card => (
            <div key={card.id} className="card">
              <div className="card-header">
                <h3>{card.companyName || 'Untitled Company'}</h3>
                <button onClick={() => deleteCard(card.id)} className="delete-button">×</button>
              </div>
              
              <div className="card-content">
                <div className="company-info">
                  <p><strong>Email:</strong> {card.email}</p>
                  <p><strong>Description:</strong> {card.companyDescription}</p>
                  {card.contactPerson && (
                    <p><strong>Contact:</strong> {card.contactPerson}</p>
                  )}
                </div>
                
                {card.isLoading ? (
                  <div className="card-loading">
                    <div className="loading-spinner"></div>
                    <p>Generating email...</p>
                  </div>
                ) : card.generatedEmail ? (
                  <div className="email-content">
                    <h4>Generated Email</h4>
                    <textarea
                      value={card.generatedEmail}
                      onChange={(e) => editCardEmail(card.id, e.target.value)}
                      className="email-editor"
                    />
                    <div className="email-actions">
                      <button 
                        onClick={() => {
                          updateCard(card.id, { isLoading: true, generatedEmail: null });
                          // In a real app, this would trigger a new API call
                          setTimeout(() => {
                            const newEmail = `New email for ${card.companyName}...\n\nThis is a regenerated email sample.`;
                            updateCard(card.id, { isLoading: false, generatedEmail: newEmail });
                          }, 1000);
                        }}
                        className="regenerate-button"
                      >
                        Regenerate
                      </button>
                      <button 
                        onClick={() => {
                          alert(`Email would be sent to ${card.email}`);
                          updateCard(card.id, { isSent: true });
                        }}
                        className="send-button"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-email">
                    <p>No email generated yet. Click "Generate Emails" to create email drafts.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Excel Importer Popup */}
      {showImporter && (
        <ExcelImporter 
          onClose={() => setShowImporter(false)}
          onImport={handleImportedData}
        />
      )}
    </div>
  );
};

export default Dashboard; 
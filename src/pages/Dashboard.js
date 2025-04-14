import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

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
  
  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate required columns
        const requiredColumns = ['email', 'company name', 'company description'];
        const columnCheck = requiredColumns.every(col => 
          rows.length > 0 && Object.keys(rows[0]).some(header => 
            header.toLowerCase() === col
          )
        );
        
        if (!columnCheck) {
          alert('Invalid Excel format. Please ensure your file includes the columns: email, company name, company description');
          return;
        }
        
        // Transform to cards
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
        
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Error processing the Excel file. Please check the format and try again.');
      }
    };
    
    reader.readAsArrayBuffer(file);
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
        const response = await fetch('http://localhost:3001/api/generate-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectSettings,
            companyData: {
              email: updatedCards[i].email,
              companyName: updatedCards[i].companyName,
              companyDescription: updatedCards[i].companyDescription,
              contactPerson: updatedCards[i].contactPerson
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update the card with the generated email
        updatedCards[i].generatedEmail = data.email;
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
    updateCard(id, { generatedEmail: { ...cards.find(c => c.id === id).generatedEmail, body: newContent } });
  };
  
  return (
    <div className="dashboard-container">
      <h1>Email Dashboard</h1>
      
      {projectSettings && (
        <div className="project-info">
          <h2>Active Project: {projectSettings.useCase}</h2>
        </div>
      )}
      
      <div className="actions-bar">
        <button onClick={addCard}>Add Card Manually</button>
        <label className="file-input-button">
          Import Excel
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </label>
        <button 
          onClick={generateEmails}
          disabled={isGenerating || cards.length === 0}
          className={isGenerating ? 'loading' : ''}
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
                    <div className="loading-spinner small"></div>
                    <p>Generating email...</p>
                  </div>
                ) : card.error ? (
                  <div className="card-error">
                    <p>Error: {card.error}</p>
                    <button onClick={() => updateCard(card.id, { isLoading: true, error: null })}>
                      Retry
                    </button>
                  </div>
                ) : card.generatedEmail ? (
                  <div className="email-preview">
                    <h4>Subject: {card.generatedEmail.subject}</h4>
                    <textarea
                      value={card.generatedEmail.body}
                      onChange={(e) => editCardEmail(card.id, e.target.value)}
                      rows={5}
                    />
                    
                    <div className="card-actions">
                      <button 
                        onClick={() => updateCard(card.id, { isLoading: true })}
                        className="regenerate-button"
                      >
                        Regenerate
                      </button>
                      
                      <button 
                        onClick={() => {
                          // Send email logic will be implemented later
                          alert(`Email would be sent to ${card.email}`);
                        }}
                        className="send-button"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import companyDataFields from '../data/companyDataFields';

const Dashboard = ({ projectSettings, setProjectSettings }) => {
  const navigate = useNavigate();
  
  const goToSettings = () => {
    navigate('/settings');
  };

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);
  const [error, setError] = useState(null);

  // Load project settings from local storage
  useEffect(() => {
    const storedSettings = localStorage.getItem('projectSettings');
    if (storedSettings) {
      setProjectSettings(JSON.parse(storedSettings));
    }
  }, []);

  // Add a blank card
  const addCard = () => {
    const newCard = {
      id: uuidv4(),
      companyData: {
        companyName: '',
        industry: '',
        website: '',
        productDescription: '',
        mainPainPoint: '',
        targetAudience: '',
        competitorAdvantages: '',
        uniqueSellingPoints: '',
      },
      email: null,
      isGenerating: false,
      error: null,
    };
    setCards([...cards, newCard]);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length === 0) {
          setError('The uploaded Excel file contains no data.');
          setIsLoading(false);
          return;
        }

        // Process and validate data
        const newCards = json.map(row => {
          const companyData = {};
          companyDataFields.forEach(field => {
            companyData[field.id] = row[field.label] || '';
          });
          
          return {
            id: uuidv4(),
            companyData,
            email: null,
            isGenerating: false,
            error: null,
          };
        });
        
        setCards([...cards, ...newCards]);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        setError('There was an error processing the Excel file. Please make sure it\'s a valid .xlsx file with the correct format.');
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('There was an error reading the file.');
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Generate emails for all cards
  const generateEmails = async () => {
    if (!projectSettings?.apiKey) {
      setError('API key is not set. Please configure it in Settings.');
      return;
    }
    
    setIsGeneratingEmails(true);
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (!card.email) {
        // Update state to show this card is generating
        setCards(prevCards => {
          const updatedCards = [...prevCards];
          updatedCards[i] = {
            ...updatedCards[i],
            isGenerating: true,
            error: null
          };
          return updatedCards;
        });
        
        try {
          const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an assistant that writes personalized, convincing cold emails to potential clients. 
                Use the following information to create a compelling email:
                Project: ${projectSettings.projectName}
                Industry: ${projectSettings.industry}
                Your company: ${projectSettings.companyName}
                Your name: ${projectSettings.userName}
                Your role: ${projectSettings.userRole}
                Main service: ${projectSettings.mainService}
                Key benefits: ${projectSettings.keyBenefits}
                Style: ${projectSettings.emailStyle}
                
                The email should be convincing but not pushy, personalized to the recipient's company and industry, and should focus on how your service can solve their specific pain points.
                Keep the email under 200 words.
                Don't use obvious template language.
                End with a clear, low-pressure call to action.
                Format with proper line breaks, paragraphs, etc.`
              },
              {
                role: "user",
                content: `Generate a personalized cold email to ${card.companyData.companyName} with these details:
                - Company: ${card.companyData.companyName}
                - Industry: ${card.companyData.industry}
                - Website: ${card.companyData.website}
                - Product/Service: ${card.companyData.productDescription}
                - Pain point: ${card.companyData.mainPainPoint}
                - Target audience: ${card.companyData.targetAudience}
                - Competitor advantages: ${card.companyData.competitorAdvantages}
                - Unique selling points: ${card.companyData.uniqueSellingPoints}`
              }
            ],
            temperature: 0.7,
            max_tokens: 600,
          }, {
            headers: {
              'Authorization': `Bearer ${projectSettings.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          const generatedEmail = response.data.choices[0].message.content.trim();
          
          // Update the card with the generated email
          setCards(prevCards => {
            const updatedCards = [...prevCards];
            updatedCards[i] = {
              ...updatedCards[i],
              email: generatedEmail,
              isGenerating: false
            };
            return updatedCards;
          });
        } catch (error) {
          console.error("Error generating email:", error);
          // Update the card with the error
          setCards(prevCards => {
            const updatedCards = [...prevCards];
            updatedCards[i] = {
              ...updatedCards[i],
              isGenerating: false,
              error: "Failed to generate email. Please try again."
            };
            return updatedCards;
          });
        }
      }
    }
    
    setIsGeneratingEmails(false);
  };

  // Delete a card
  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  // Update email content
  const updateEmail = (id, content) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, email: content } : card
    ));
  };

  // Regenerate a specific email
  const regenerateEmail = async (card, index) => {
    if (!projectSettings?.apiKey) {
      setError('API key is not set. Please configure it in Settings.');
      return;
    }
    
    // Update state to show this card is generating
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      updatedCards[index] = {
        ...updatedCards[index],
        isGenerating: true,
        error: null
      };
      return updatedCards;
    });
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant that writes personalized, convincing cold emails to potential clients. 
            Use the following information to create a compelling email:
            Project: ${projectSettings.projectName}
            Industry: ${projectSettings.industry}
            Your company: ${projectSettings.companyName}
            Your name: ${projectSettings.userName}
            Your role: ${projectSettings.userRole}
            Main service: ${projectSettings.mainService}
            Key benefits: ${projectSettings.keyBenefits}
            Style: ${projectSettings.emailStyle}
            
            The email should be convincing but not pushy, personalized to the recipient's company and industry, and should focus on how your service can solve their specific pain points.
            Keep the email under 200 words.
            Don't use obvious template language.
            End with a clear, low-pressure call to action.
            Format with proper line breaks, paragraphs, etc.`
          },
          {
            role: "user",
            content: `Generate a personalized cold email to ${card.companyData.companyName} with these details:
            - Company: ${card.companyData.companyName}
            - Industry: ${card.companyData.industry}
            - Website: ${card.companyData.website}
            - Product/Service: ${card.companyData.productDescription}
            - Pain point: ${card.companyData.mainPainPoint}
            - Target audience: ${card.companyData.targetAudience}
            - Competitor advantages: ${card.companyData.competitorAdvantages}
            - Unique selling points: ${card.companyData.uniqueSellingPoints}`
          }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }, {
        headers: {
          'Authorization': `Bearer ${projectSettings.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const generatedEmail = response.data.choices[0].message.content.trim();
      
      // Update the card with the generated email
      setCards(prevCards => {
        const updatedCards = [...prevCards];
        updatedCards[index] = {
          ...updatedCards[index],
          email: generatedEmail,
          isGenerating: false
        };
        return updatedCards;
      });
    } catch (error) {
      console.error("Error regenerating email:", error);
      // Update the card with the error
      setCards(prevCards => {
        const updatedCards = [...prevCards];
        updatedCards[index] = {
          ...updatedCards[index],
          isGenerating: false,
          error: "Failed to regenerate email. Please try again."
        };
        return updatedCards;
      });
    }
  };

  // Check if all required fields are filled
  const hasCompletedCompanyData = () => {
    return cards.length > 0 && cards.every(card => 
      card.companyData.companyName && card.companyData.industry
    );
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        
        {projectSettings?.projectName && (
          <div className="active-project">
            <div className="project-badge">Active</div>
            <div className="project-name">{projectSettings.projectName}</div>
            <button className="change-project-button" onClick={goToSettings}>
              Change
            </button>
          </div>
        )}
      </div>
      
      <div className="actions-bar">
        <button 
          className="action-button add-company-button"
          onClick={addCard}
        >
          <span className="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          Add Company
        </button>
        
        <label className="action-button import-button">
          <span className="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </span>
          Import Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        
        <button
          className="action-button generate-button"
          onClick={generateEmails}
          disabled={isGeneratingEmails || !hasCompletedCompanyData() || !projectSettings?.apiKey}
        >
          <span className="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </span>
          Generate Emails
        </button>
      </div>
      
      {error && (
        <div className="global-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="cards-container">
        {cards.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <line x1="9" y1="15" x2="13" y2="15"></line>
            </svg>
            <p>No companies added yet. Add a company or import from Excel to get started.</p>
            <button className="action-button empty-action" onClick={addCard}>
              <span className="action-icon">+</span>
              Add First Company
            </button>
          </div>
        ) : (
          cards.map((card, index) => (
            <div key={card.id} className="card">
              <div className="card-header">
                <h3>{card.companyData.companyName || 'New Company'}</h3>
                <button className="delete-button" onClick={() => deleteCard(card.id)}>×</button>
              </div>
              <div className="card-content">
                <div className="company-info">
                  <p><strong>Industry:</strong> {card.companyData.industry || 'Not specified'}</p>
                  {card.companyData.website && <p><strong>Website:</strong> {card.companyData.website}</p>}
                  {card.companyData.productDescription && <p><strong>Product:</strong> {card.companyData.productDescription}</p>}
                </div>
                
                {card.isGenerating ? (
                  <div className="card-loading">
                    <div className="loading-spinner small"></div>
                    <p>Generating email...</p>
                  </div>
                ) : card.error ? (
                  <div className="card-error">
                    <p>{card.error}</p>
                    <button onClick={() => regenerateEmail(card, index)}>Try Again</button>
                  </div>
                ) : card.email ? (
                  <div className="email-preview">
                    <h4>Generated Email</h4>
                    <textarea
                      value={card.email}
                      onChange={(e) => updateEmail(card.id, e.target.value)}
                      rows={8}
                    />
                    <div className="card-actions">
                      <button className="regenerate-button" onClick={() => regenerateEmail(card, index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                          <path d="M23 4v6h-6"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        Regenerate
                      </button>
                      <button className="send-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-email-state">
                    <p>Click "Generate Emails" to create an email for this company.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
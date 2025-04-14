const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Generate an email draft using the project settings and company data
 * @param {Object} projectSettings - The project settings including greeting, outro, etc.
 * @param {Object} companyData - The company data for which to generate an email
 * @returns {Promise<Object>} The generated email
 */
export const generateEmail = async (projectSettings, companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectSettings, companyData }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating email:', error);
    throw error;
  }
};

/**
 * Send an email using the Gmail API
 * @param {Object} emailData - The email data including recipient, subject, and body
 * @returns {Promise<Object>} The response from the API
 */
export const sendEmail = async (emailData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Check the health status of the API
 * @returns {Promise<Object>} The health status
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
}; 
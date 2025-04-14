import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AppContext = createContext();

// Sample data for development
const sampleProjects = [
  {
    id: '1',
    name: 'Marketing Campaign',
    description: 'Email campaign for product launch',
    createdAt: '2023-08-10T14:00:00Z',
    templateId: 'template1',
    status: 'active',
    lastRun: '2023-08-15T09:30:00Z',
    stats: {
      sent: 120,
      opened: 85,
      clicked: 42,
      replied: 15
    }
  },
  {
    id: '2',
    name: 'Sales Outreach',
    description: 'Contacting potential clients',
    createdAt: '2023-07-22T10:15:00Z',
    templateId: 'template2',
    status: 'paused',
    lastRun: '2023-08-01T11:45:00Z',
    stats: {
      sent: 75,
      opened: 50,
      clicked: 28,
      replied: 10
    }
  },
  {
    id: '3',
    name: 'Event Invitations',
    description: 'Sending invites for company webinar',
    createdAt: '2023-08-05T09:20:00Z',
    templateId: 'template3',
    status: 'completed',
    lastRun: '2023-08-12T15:30:00Z',
    stats: {
      sent: 200,
      opened: 145,
      clicked: 88,
      replied: 32
    }
  }
];

const sampleTemplates = [
  {
    id: 'template1',
    name: 'Product Launch',
    subject: 'Introducing our new product',
    body: 'Hello {{name}},\n\nWe are excited to announce our new product {{product}}...',
    variables: ['name', 'product']
  },
  {
    id: 'template2',
    name: 'Sales Pitch',
    subject: 'Opportunity for {{company}}',
    body: 'Dear {{name}},\n\nI came across {{company}} and thought our services might be a good fit...',
    variables: ['name', 'company']
  },
  {
    id: 'template3',
    name: 'Event Invitation',
    subject: 'You\'re invited! {{event}} webinar',
    body: 'Hi {{name}},\n\nYou\'re invited to our upcoming {{event}} webinar on {{date}}...',
    variables: ['name', 'event', 'date']
  }
];

// Provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState(null);

  // Initialize with sample data for development
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we'll use the sample data with a slight delay to simulate loading
    const timer = setTimeout(() => {
      setProjects(sampleProjects);
      setTemplates(sampleTemplates);
      setUser({
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Set the current project
  const selectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project);
  };

  // Create a new project
  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft',
      stats: { sent: 0, opened: 0, clicked: 0, replied: 0 },
      ...projectData
    };
    
    setProjects([...projects, newProject]);
    return newProject;
  };

  // Update a project
  const updateProject = (projectId, projectData) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, ...projectData } : project
    );
    
    setProjects(updatedProjects);
    
    // Update current project if it was the one that got updated
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject({ ...currentProject, ...projectData });
    }
  };

  // Delete a project
  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    
    // Clear current project if it was the one that got deleted
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
    }
  };

  // Create a new template
  const createTemplate = (templateData) => {
    const newTemplate = {
      id: Date.now().toString(),
      ...templateData
    };
    
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  // Update a template
  const updateTemplate = (templateId, templateData) => {
    const updatedTemplates = templates.map(template => 
      template.id === templateId ? { ...template, ...templateData } : template
    );
    
    setTemplates(updatedTemplates);
  };

  // Delete a template
  const deleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(updatedTemplates);
  };

  // Value object to be provided to consumers
  const value = {
    user,
    setUser,
    projects,
    templates,
    loading,
    currentProject,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 
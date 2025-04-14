/**
 * Defines the structure for company data used in the application
 * These fields align with the required Excel import structure
 */

const companyDataFields = {
  required: [
    { id: 'email', label: 'Email', placeholder: 'company@example.com' },
    { id: 'companyName', label: 'Company Name', placeholder: 'Company Name' },
    { id: 'companyDescription', label: 'Company Description', placeholder: 'Brief description of the company' }
  ],
  optional: [
    { id: 'contactPerson', label: 'Contact Person', placeholder: 'Contact Person (Optional)' }
  ]
};

export default companyDataFields; 
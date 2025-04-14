import React, { useState, useRef } from 'react';
import { FaFileExcel, FaUpload } from 'react-icons/fa';

const ExcelImporter = ({ onImport, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Sample data for Excel template
  const sampleData = [
    { email: 'example@company.com', 'company name': 'Example Company', 'company description': 'A brief description of what the company does', 'contact person': 'John Doe' },
    { email: 'another@business.com', 'company name': 'Another Business', 'company description': 'This company specializes in XYZ services', 'contact person': 'Jane Smith' }
  ];
  
  // Generate and download a sample Excel file
  const downloadSampleExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
    
    // Generate and save file
    XLSX.writeFile(workbook, 'email_tool_sample_template.xlsx');
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };
  
  const validateAndSetFile = (file) => {
    // Check if the file is an Excel file
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (validTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid Excel file (.xls or .xlsx)');
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImportClick = () => {
    if (selectedFile) {
      // Here you would add the actual logic to read and process the Excel file
      // For now, we're just passing the file back to the parent component
      onImport(selectedFile);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Logic to download the template file would go here
    // For now, just show an alert
    alert('Template download functionality will be implemented later');
  };

  return (
    <div className="excel-importer">
      <h2>Import Contact Data</h2>
      
      <div 
        className={`drag-area ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="icon">
          {selectedFile ? <FaUpload /> : <FaFileExcel />}
        </div>
        <h3>{selectedFile ? 'File Selected' : 'Drag & Drop'}</h3>
        <p>
          {selectedFile 
            ? selectedFile.name 
            : 'Drag and drop your Excel file here, or click to browse'}
        </p>
        <input 
          type="file"
          className="file-input"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xls,.xlsx"
        />
        {!selectedFile && <button className="browse-btn">Browse Files</button>}
      </div>
      
      <div className="template-link">
        <button onClick={handleDownloadTemplate}>
          Download Excel Template
        </button>
      </div>
      
      <div className="importer-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="import-btn" 
          onClick={handleImportClick}
          disabled={!selectedFile}
        >
          Import Data
        </button>
      </div>
    </div>
  );
};

export default ExcelImporter; 
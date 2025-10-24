import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ApiTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [scholarships, setScholarships] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing API connection...');
      
      // Test scholarships endpoint
      const response = await apiService.getScholarships();
      console.log('Scholarships response:', response);
      
      if (response.success) {
        setScholarships(response.data.slice(0, 3));
        setStatus(`✅ API Connected! Found ${response.data.length} scholarships`);
      } else {
        setStatus(`⚠️ API responded but no data found`);
      }
    } catch (error) {
      console.error('API Connection Error:', error);
      setStatus(`❌ API Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ddd', margin: '20px', borderRadius: '8px' }}>
      <h3>API Connection Test</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>API URL:</strong> {API_BASE_URL}</p>
      
      {scholarships.length > 0 && (
        <div>
          <h4>Sample Scholarships:</h4>
          <ul>
            {scholarships.map(s => (
              <li key={s._id}>
                <strong>{s.title}</strong> - ID: {s._id}
                <br />
                <button 
                  onClick={() => {
                    console.log(`Navigating to /scholarships/${s._id}`);
                    window.location.href = `/scholarships/${s._id}`;
                  }}
                  style={{ margin: '5px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Test Link
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
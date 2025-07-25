import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  console.log('NotFoundPage is rendering'); // Debug log

  // Simple inline styles that will definitely work
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#667eea',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: 'white'
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    color: '#333'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#e5e7eb',
    margin: '0 0 20px 0',
    letterSpacing: '-2px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '10px',
    textDecoration: 'none',
    display: 'inline-block'
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>404</h1>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1f2937' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.5' }}>
          The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>
        
        <div>
          <button 
            style={buttonStyle}
            onClick={() => navigate('/dashboard')}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            Go to Dashboard
          </button>
          
          <button 
            style={{...buttonStyle, backgroundColor: 'transparent', color: '#667eea', border: '2px solid #667eea'}}
            onClick={() => window.history.back()}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            Go Back
          </button>
        </div>
        
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            <strong>ResQHub</strong> - Lost & Found Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
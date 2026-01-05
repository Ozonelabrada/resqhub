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

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea'
  };

  // Navigation handlers
  const handlePrimaryNavigation = () => {
    navigate('/'); // Public home page
  };

  const handleSecondaryNavigation = () => {
    window.history.back();
  };

  // Content
  const getContextContent = () => {
    return {
      title: 'Page Not Found',
      description: 'The page you\'re looking for doesn\'t exist. It might have been moved or deleted.',
      primaryButton: 'Go to Home',
      secondaryButton: 'Go Back',
      badge: 'SHERRA'
    };
  };

  const content = getContextContent();

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Context Badge */}
        <div style={{ 
          display: 'inline-block', 
          padding: '4px 12px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: '600', 
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {content.badge}
        </div>

        <h1 style={titleStyle}>404</h1>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1f2937' }}>
          {content.title}
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.5' }}>
          {content.description}
        </p>
        
        <div>
          <button 
            style={buttonStyle}
            onClick={handlePrimaryNavigation}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a67d8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            {content.primaryButton}
          </button>
          
          <button 
            style={secondaryButtonStyle}
            onClick={handleSecondaryNavigation}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            {content.secondaryButton}
          </button>
        </div>

        {/* Additional helpful links */}
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
            Helpful Links:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{ ...secondaryButtonStyle, fontSize: '14px', padding: '8px 16px' }}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              style={{ ...secondaryButtonStyle, fontSize: '14px', padding: '8px 16px' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            <strong>SHERRA</strong> - Lost & Found Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
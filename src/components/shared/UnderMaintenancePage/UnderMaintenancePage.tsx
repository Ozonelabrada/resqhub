import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';

const UnderMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 10;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  // Inline styles to ensure rendering
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '1rem' : '2rem',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: isMobile ? '90%' : '600px',
    width: '100%',
    padding: isMobile ? '1.5rem' : '2rem',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    textAlign: 'center',
    backgroundColor: 'white'
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '6rem',
    height: '6rem',
    margin: '0 auto 1rem auto',
    backgroundColor: '#fed7aa',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: '#fff7ed',
    padding: '1rem',
    borderRadius: '8px',
    margin: '1rem 0',
    textAlign: 'left'
  };

  const statusGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Maintenance Icon */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={iconContainerStyle}>
            <i 
              className="pi pi-wrench" 
              style={{ 
                fontSize: isMobile ? '2.5rem' : '3rem',
                color: '#ea580c',
                animation: 'pulse 2s infinite'
              }}
            ></i>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '1rem',
              height: '1rem',
              backgroundColor: '#ea580c',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.25rem' : '1.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Under Maintenance
          </h2>
          
          <p style={{ 
            color: '#6b7280', 
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            We're currently performing some maintenance to improve your ResQHub experience. 
            This page will be available soon!
          </p>
          
          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progress</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              value={progress} 
              showValue={false}
              style={{ height: '8px' }}
            />
          </div>
          
          {/* ResQHub themed message */}
          <div style={infoBoxStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#c2410c',
              marginBottom: '0.5rem'
            }}>
              <i className="pi pi-cog"></i>
              <span style={{ fontWeight: '600' }}>What we're working on:</span>
            </div>
            <ul style={{ 
              color: '#ea580c', 
              fontSize: '0.875rem',
              margin: '0.5rem 0 0 0',
              paddingLeft: '1rem'
            }}>
              <li>Enhancing search functionality</li>
              <li>Improving mobile experience</li>
              <li>Adding new features</li>
              <li>Optimizing performance</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={buttonContainerStyle}>
          <Button 
            label="Go to Dashboard" 
            icon="pi pi-home"
            onClick={handleGoHome}
            className="p-button-lg"
            style={{ 
              borderRadius: '12px',
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto'
            }}
          />
          <Button 
            label="Refresh Page" 
            icon="pi pi-refresh"
            onClick={() => window.location.reload()}
            outlined
            className="p-button-lg"
            style={{ 
              borderRadius: '12px',
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto'
            }}
          />
        </div>

        {/* Status Info */}
        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={statusGridStyle}>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.25rem',
                color: '#059669',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%'
                }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Core Services</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Operational</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.25rem',
                color: '#d97706',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>This Feature</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Under Maintenance</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.25rem',
                color: '#2563eb',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>ETA</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Coming Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default UnderMaintenancePage;
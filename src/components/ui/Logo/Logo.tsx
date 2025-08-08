import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  className = '',
  onClick 
}) => {
  // Size mapping
  const getSizeValues = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    
    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'large':
        return { width: 64, height: 64 };
      default: // medium
        return { width: 48, height: 48 };
    }
  };

  const { width, height } = getSizeValues();

  // Use your uploaded logo image
  const LogoImage = () => (
    <img 
      src="/assets/images/logo/resqhub-logo.png" // Replace with your actual filename
      alt="ResQHub Logo"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );

  const LogoText = () => (
    <span
      style={{
        fontSize: `${width * 0.6}px`,
        fontWeight: 'bold',
        color: '#ffffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '-0.02em'
      }}
    >
      ResQHub
    </span>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <LogoImage />;
      case 'text':
        return <LogoText />;
      case 'full':
      default:
        return (
          <div className="flex align-items-center gap-2">
            <LogoImage />
            <LogoText />
          </div>
        );
    }
  };

  return (
    <div
      className={`inline-flex align-items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ userSelect: 'none' }}
    >
      {renderLogo()}
    </div>
  );
};

export default Logo;
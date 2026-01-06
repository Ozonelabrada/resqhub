import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  onClick?: () => void;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  className = '',
  onClick,
  light = false
}) => {
  const getSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  const pixelSize = getSize();

  const LogoIcon = () => (
    <div className="relative flex items-center justify-center" style={{ width: pixelSize, height: pixelSize }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full drop-shadow-sm transition-colors",
          light ? "text-white" : "text-teal-600"
        )}
      >
        <path
          d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 21l-5.2-5.2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 7.5a1.5 1.5 0 0 1 1.5 1.5M10.5 10.5c-0.8 0-1.5-0.7-1.5-1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={light ? "text-emerald-300" : "text-orange-500"}
        />
      </svg>
      {/* Heart overlay simplified as part of the path or separate */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
         <svg viewBox="0 0 24 24" fill="currentColor" className={cn(
           "w-1/3 h-1/3 animate-pulse transition-colors",
           light ? "text-white/80" : "text-emerald-500"
         )}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
         </svg>
      </div>
    </div>
  );

  const LogoText = () => (
    <span
      className={cn(
        "font-black tracking-tight transition-colors",
        light ? "text-white" : "text-slate-900"
      )}
      style={{
        fontSize: `${pixelSize * 0.5}px`,
      }}
    >
      SHE<span className={light ? "text-emerald-300" : "text-teal-600"}>RRA</span>
    </span>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <LogoIcon />;
      case 'text':
        return <LogoText />;
      case 'full':
      default:
        return (
          <div className="flex items-center gap-1.5">
            <LogoIcon />
            <LogoText />
          </div>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center ${onClick ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''} ${className}`}
      onClick={onClick}
      style={{ userSelect: 'none' }}
    >
      {renderLogo()}
    </div>
  );
};

export default Logo;

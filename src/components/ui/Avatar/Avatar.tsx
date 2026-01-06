import React from 'react';

export interface AvatarProps {
  icon?: string;
  image?: string;
  label?: string;
  size?: 'normal' | 'large' | 'xlarge' | 'xl';
  shape?: 'square' | 'circle';
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: any) => void;
  children?: React.ReactNode;
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  icon,
  image,
  label,
  size = 'normal',
  shape = 'circle',
  className = '',
  style,
  onClick,
  children,
  src,
  alt
}) => {
  const sizeClasses = {
    normal: 'w-8 h-8 text-sm',
    large: 'w-12 h-12 text-lg',
    xl: 'w-24 h-24 text-2xl',
    xlarge: 'w-16 h-16 text-xl'
  };

  const currentImage = src || image;

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded';

  const baseClasses = `inline-flex items-center justify-center bg-teal-600 text-white font-medium ${sizeClasses[size as keyof typeof sizeClasses] || 'w-10 h-10'} ${shapeClasses} ${className}`;

  if (currentImage) {
    return (
      <img
        src={currentImage}
        alt={alt || label || 'Avatar'}
        className={`${baseClasses} object-cover`}
        style={style}
        onClick={onClick}
      />
    );
  }

  if (children) {
    return (
      <div 
        className={baseClasses}
        style={style}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  if (icon) {
    return (
      <div
        className={baseClasses}
        style={style}
        onClick={onClick}
      >
        <i className={icon}></i>
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={style}
      onClick={onClick}
    >
      {label ? label.charAt(0).toUpperCase() : '?'}
    </div>
  );
};
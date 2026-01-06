import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  centerContent?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  centerContent = false
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const classes = `
    mx-auto px-4 sm:px-6 lg:px-8
    ${sizeClasses[size]}
    ${centerContent ? 'flex items-center justify-center min-h-screen' : ''}
    ${className}
  `.trim();

  return <div className={classes}>{children}</div>;
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackToHomeButtonProps {
  isDirty?: boolean;
  className?: string;
}

export const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({ isDirty, className }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/');
  };

  return (
    <Button
      variant="default"
      onClick={handleNavigate}
      className={`bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 ${className}`}
      aria-label="Back to FindrHub home"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to FindrHub</span>
    </Button>
  );
};

import React from 'react';
import { Card, Button } from '@/components/ui';

interface OperationCardItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  onClick: () => void;
  disabled: boolean;
}

export const OperationCardItem: React.FC<OperationCardItemProps> = ({
  icon,
  title,
  subtitle,
  description,
  buttonText,
  buttonColor,
  onClick,
  disabled,
}) => {
  const getBgClass = (): string => {
    if (buttonColor === 'bg-green-600') return 'bg-green-50 border-green-200';
    if (buttonColor === 'bg-red-600') return 'bg-red-50 border-red-200';
    if (buttonColor === 'bg-blue-600') return 'bg-blue-50 border-blue-200';
    return 'bg-purple-50 border-purple-200';
  };

  return (
    <Card className={`p-6 border-2 ${getBgClass()}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Button onClick={onClick} disabled={disabled} className={`w-full ${buttonColor} hover:brightness-110`}>
        {buttonText}
      </Button>
    </Card>
  );
};

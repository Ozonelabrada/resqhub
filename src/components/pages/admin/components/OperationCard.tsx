import React from 'react';
import { Card, Button } from '@/components/ui';

interface OperationCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  onClick: () => void;
  disabled: boolean;
}

export const OperationCard: React.FC<OperationCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  buttonText,
  buttonColor,
  onClick,
  disabled,
}) => (
  <Card className={`p-6 border-2 bg-${buttonColor.split('-')[2]}-50 border-${buttonColor.split('-')[2]}-200`}>
    <div className="flex items-center gap-3 mb-4">
      <span className={`${buttonColor}`}>{icon}</span>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <Button onClick={onClick} disabled={disabled} className={`w-full ${buttonColor} hover:brightness-110`}>
      {icon}
      {buttonText}
    </Button>
  </Card>
);

export const OperationCardsGrid: React.FC<{
  operations: OperationCardProps[];
}> = ({ operations }) => (
  <Card className="p-8 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Credit Operations</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {operations.map((op, idx) => (
        <OperationCard key={idx} {...op} />
      ))}
    </div>
  </Card>
);

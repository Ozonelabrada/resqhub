import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {items.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index !== items.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    {item.icon || <span className="text-white text-sm">•</span>}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
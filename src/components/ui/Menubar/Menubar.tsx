import React from 'react';
import type { MenuItem } from '../Menu';
import { ChevronDown } from 'lucide-react';

export interface MenubarProps {
  model?: MenuItem[];
  start?: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Menubar: React.FC<MenubarProps> = ({
  model = [],
  start,
  end,
  className = '',
  style
}) => {
  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.items) {
      // Submenu - for simplicity, just render as button with dropdown
      return (
        <div key={index} className="relative group">
          <button className="flex items-center px-4 py-2 hover:bg-teal-500/10 rounded-xl transition-colors text-sm font-bold text-slate-100 hover:text-white">
            {item.icon && (
              <span className="flex-shrink-0">
                {typeof item.icon === 'string' ? <i className={`${item.icon} mr-2`}></i> : item.icon}
              </span>
            )}
            <span>{item.label}</span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </button>
          <div className="absolute top-full left-0 bg-white border border-slate-100 rounded-2xl shadow-2xl hidden group-hover:block z-50 min-w-[200px] py-1 mt-1">
            {item.items.map((subItem, subIndex) => (
              <div
                key={subIndex}
                className="flex items-center px-4 py-3 hover:bg-teal-50 cursor-pointer whitespace-nowrap text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
                onClick={subItem.command}
              >
                {subItem.icon && (
                  <span className="flex-shrink-0">
                    {typeof subItem.icon === 'string' ? <i className={`${subItem.icon} mr-2`}></i> : subItem.icon}
                  </span>
                )}
                <span>{subItem.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <button
        key={index}
        className="flex items-center px-4 py-2 hover:bg-teal-500/10 rounded-xl transition-colors text-sm font-bold text-slate-100 hover:text-white"
        onClick={item.command}
      >
        {item.icon && (
          <span className="flex-shrink-0">
            {typeof item.icon === 'string' ? <i className={`${item.icon} mr-2`}></i> : item.icon}
          </span>
        )}
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div
      className={`flex items-center justify-between bg-teal-600 text-white border-b border-teal-700 px-6 py-3 sticky top-0 z-50 shadow-md ${className}`}
      style={style}
    >
      <div className="flex items-center">
        {start}
      </div>
      <div className="flex items-center space-x-4">
        {model.map((item, index) => renderMenuItem(item, index))}
      </div>
      <div className="flex items-center">
        {end}
      </div>
    </div>
  );
};
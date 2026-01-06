import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  command?: () => void;
  separator?: boolean;
  items?: MenuItem[];
}

export interface MenuProps {
  model: MenuItem[];
  popup?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface MenuRef {
  toggle: (event: any) => void;
}

export const Menu = forwardRef<MenuRef, MenuProps>(({ model, popup = false, className = '', style }, ref) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    toggle: (event: any) => {
      if (popup) {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
        setVisible(!visible);
      }
    }
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  const handleItemClick = (item: MenuItem) => {
    if (item.command) {
      item.command();
    }
    if (popup) {
      setVisible(false);
    }
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.separator) {
      return <hr key={index} className="my-1 border-gray-300" />;
    }

    return (
      <div
        key={index}
        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        onClick={() => handleItemClick(item)}
      >
        {item.icon && (
          <span className="flex-shrink-0">
            {typeof item.icon === 'string' ? <i className={`${item.icon} mr-2`}></i> : item.icon}
          </span>
        )}
        <span>{item.label}</span>
      </div>
    );
  };

  if (!visible && popup) return null;

  return (
    <div
      ref={menuRef}
      className={`bg-white border border-gray-300 rounded shadow-lg ${popup ? 'absolute z-[110]' : ''} ${className}`}
      style={popup ? { ...style, top: position.top, left: position.left } : style}
    >
      {model.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
});
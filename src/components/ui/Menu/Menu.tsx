import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';

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
        
        // Initial positioning
        let top = rect.bottom + window.scrollY;
        let left = rect.left + window.scrollX;

        // Give a tiny delay for visibility to be set before measuring
        setVisible(!visible);
        
        // We'll adjust in useEffect if needed, or just set it here
        // Set slightly better defaults for the profile dropdown (right-aligned)
        if (rect.left > window.innerWidth / 2) {
          left = rect.right + window.scrollX - 220; // estimate menu width
        }

        setPosition({ top, left });
      }
    }
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (visible && menuRef.current) {
      // Final adjustment if it overflows
      const rect = menuRef.current.getBoundingClientRect();
      const overflowX = rect.right - window.innerWidth;
      const overflowY = (rect.bottom + window.scrollY) - (window.innerHeight + window.scrollY);

      if (overflowX > 0) {
        setPosition(prev => ({ ...prev, left: prev.left - overflowX - 10 }));
      }
      if (overflowY > 0) {
        setPosition(prev => ({ ...prev, top: prev.top - rect.height - 40 })); // Show above if overflows bottom
      }
      
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

  const menuContent = (
    <div
      ref={menuRef}
      className={`bg-white border border-gray-100 rounded-lg shadow-xl ${popup ? 'fixed z-[9999]' : ''} ${className}`}
      style={popup ? { 
        ...style, 
        top: position.top - window.scrollY, 
        left: position.left - window.scrollX,
        minWidth: '220px'
      } : style}
    >
      <div className="py-1">
        {model.map((item, index) => renderMenuItem(item, index))}
      </div>
    </div>
  );

  if (popup) {
    return createPortal(menuContent, document.body);
  }

  return menuContent;
});
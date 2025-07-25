import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';

const PublicLayout = () => {
  const navigate = useNavigate();

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Search Items',
      icon: 'pi pi-search',
      command: () => navigate('/search')
    },
    {
      label: 'Report Item',
      icon: 'pi pi-plus-circle',
      command: () => navigate('/report')
    },
    {
      label: 'How It Works',
      icon: 'pi pi-question-circle',
      command: () => navigate('/how-it-works')
    }
  ];

  const start = (
    <div className="flex align-items-center gap-2">
      <button
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        onClick={() => navigate('/')}
        className="flex align-items-center gap-2"
      >
        <i className="pi pi-shield text-primary text-2xl"></i>
        <span className="text-xl font-bold text-primary">ResQHub</span>
      </button>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <Button
        label="Emergency Report"
        icon="pi pi-exclamation-triangle"
        className="p-button-danger p-button-sm"
        onClick={() => navigate('/report?emergency=true')}
      />
      <Button
        label="Admin Login"
        icon="pi pi-sign-in"
        className="p-button-outlined p-button-sm"
        onClick={() => navigate('/admin/login')}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-column">
      {/* Public Header */}
      <Menubar
        model={items}
        start={start}
        end={end}
        className="w-full shadow-2 border-none"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1rem'
        }}
      />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8fafc' }}>
        <Outlet />
      </div>

      {/* Public Footer */}
      <footer 
        className="w-full p-4 text-center"
        style={{ 
          backgroundColor: '#1e293b', 
          color: '#f1f5f9' 
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-shield text-primary"></i>
              <span className="font-semibold">ResQHub</span>
              <span className="text-sm opacity-75">- Reuniting Communities</span>
            </div>
            
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-gray-300 hover:text-white no-underline">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white no-underline">
                Terms of Service
              </a>
              <a href="/contact" className="text-gray-300 hover:text-white no-underline">
                Contact Us
              </a>
            </div>
            
            <div className="text-sm opacity-75">
              © 2025 ResQHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Logo } from '../../../../ui';

interface HeroSectionProps {
  isAuthenticated: boolean;
  userData: any;
  isBelowDesktop: boolean;
  onShowAccountMenu: (event: React.MouseEvent) => void;
  onShowGuestMenu: (event: React.MouseEvent) => void;
  onReportAction: (type: 'lost' | 'found') => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  userData,
  isBelowDesktop,
  onShowAccountMenu,
  onShowGuestMenu,
  onReportAction
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative"
      style={{
        background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
        color: 'white',
        paddingTop: '2rem',
        paddingBottom: '3rem'
      }}
    >
      {/* Navigation */}
      <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} mb-6`}>
        <div className="flex align-items-center justify-content-between">
          <Logo
            size={isBelowDesktop ? 'small' : 'medium'}
            variant="full"
            onClick={() => navigate('/')}
          />

          {isAuthenticated ? (
            <div className="flex align-items-center gap-3">
              <div className="text-right">
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Welcome back,</div>
                <div className="font-semibold text-white">{userData?.email}</div>
              </div>

              {/* Account Avatar with Dropdown */}
              <div className="relative">
                <div
                  className="w-3rem h-3rem border-circle bg-white flex align-items-center justify-content-center cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={onShowAccountMenu}
                >
                  <i className="pi pi-user text-blue-600"></i>
                </div>
              </div>
            </div>
          ) : (
            isBelowDesktop ? (
              <div className="relative">
                <Button
                  icon="pi pi-bars"
                  className="p-button-rounded p-button-text p-button-sm"
                  aria-label="Menu"
                  onClick={onShowGuestMenu}
                  style={{
                    color: 'white',
                    fontSize: '1.5rem'
                  }}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  label="Sign In"
                  icon="pi pi-sign-in"
                  onClick={() => navigate('/signin')}
                  className="p-button-outlined p-button-sm"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <Button
                  label="Admin"
                  icon="pi pi-shield"
                  onClick={() => navigate('/admin/login')}
                  className="p-button-text p-button-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                />
              </div>
            )
          )}
        </div>

        {/* Hero Content */}
        <div className="mb-6 text-center">
          {isAuthenticated ? (
            <>
              <h2 className={`${isBelowDesktop ? 'text-2xl' : 'text-4xl'} font-bold mb-3 text-white`}>
                Welcome to Your Community Hub! 🏠
              </h2>
              <p className={`${isBelowDesktop ? 'text-lg' : 'text-xl'} mb-4`}
                 style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Help make your neighborhood safer by reporting and finding lost items
              </p>
            </>
          ) : (
            <>
              <h1 className={`${isBelowDesktop ? 'text-3xl' : 'text-5xl'} font-bold mb-4 text-white`}>
                Find What's Lost, Return What's Found 🔍
              </h1>
              <p className={`${isBelowDesktop ? 'text-lg' : 'text-xl'} mb-6`}
                 style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Join thousands of community members helping reunite people with their belongings
              </p>
            </>
          )}

          {/* Quick Action Buttons */}
          <div className={`flex gap-3 mb-6 justify-content-center ${isBelowDesktop ? 'flex-column w-full' : ''}`}>
            <Button
              label="Report Lost Item"
              icon="pi pi-minus-circle"
              className={`p-button-lg ${isBelowDesktop ? 'w-full' : ''}`}
              style={{
                backgroundColor: '#cda710ff',
                borderColor: '#7e6b6bff',
                color: 'white',
                boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)'
              }}
              onClick={() => onReportAction('lost')}
            />
            <Button
              label="Report Found Item"
              icon="pi pi-plus-circle"
              className={`p-button-lg ${isBelowDesktop ? 'w-full' : ''}`}
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a',
                color: 'white',
                boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)'
              }}
              onClick={() => onReportAction('found')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
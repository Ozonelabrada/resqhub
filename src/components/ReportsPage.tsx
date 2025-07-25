import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`${isMobile ? 'p-2 pb-20' : 'p-4'}`} style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 mb-2`}>
          Reports
        </h1>
        <p className="text-gray-600">
          Generate and view detailed reports on lost and found activities.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="mb-4">
            <div className="w-5rem h-5rem mx-auto mb-3 bg-blue-100 border-round-3xl flex align-items-center justify-content-center">
              <i className="pi pi-chart-bar text-blue-500" style={{ fontSize: '2.5rem' }}></i>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Advanced Reports Coming Soon!
          </h3>
          
          <p className="text-gray-600 line-height-3 mb-4">
            We're working on comprehensive reporting features that will help you analyze 
            lost and found data with powerful insights and analytics.
          </p>

          <div className="bg-blue-50 border-round p-3 mb-4">
            <h4 className="text-blue-700 mb-2">Planned Features:</h4>
            <div className="text-left">
              <div className="flex align-items-center gap-2 mb-2 text-blue-600">
                <i className="pi pi-check-circle text-xs"></i>
                <span className="text-sm">Monthly activity reports</span>
              </div>
              <div className="flex align-items-center gap-2 mb-2 text-blue-600">
                <i className="pi pi-check-circle text-xs"></i>
                <span className="text-sm">Success rate analytics</span>
              </div>
              <div className="flex align-items-center gap-2 mb-2 text-blue-600">
                <i className="pi pi-check-circle text-xs"></i>
                <span className="text-sm">Location-based insights</span>
              </div>
              <div className="flex align-items-center gap-2 mb-2 text-blue-600">
                <i className="pi pi-check-circle text-xs"></i>
                <span className="text-sm">Custom report generation</span>
              </div>
              <div className="flex align-items-center gap-2 text-blue-600">
                <i className="pi pi-check-circle text-xs"></i>
                <span className="text-sm">Export capabilities</span>
              </div>
            </div>
          </div>

          <div className={`flex ${isMobile ? 'flex-column' : ''} gap-3`}>
            <Button 
              label="Back to Dashboard" 
              icon="pi pi-arrow-left"
              onClick={() => navigate('/dashboard')}
              className={`${isMobile ? 'w-full' : 'flex-1'}`}
              outlined
            />
            <Button 
              label="Get Notified" 
              icon="pi pi-bell"
              className={`${isMobile ? 'w-full' : 'flex-1'}`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
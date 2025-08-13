import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useAuth } from '../../../../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { userData: user } = useAuth() ?? {};

  // Placeholder migration handler
  const handleMigrate = () => {
    // You can replace this with your actual migration logic
    alert('Migration started! (This is a placeholder. Implement your migration logic here.)');
  };

  return (
    <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Card className="p-4 shadow-2" style={{ maxWidth: 480, width: '100%' }}>
        <h2 className="text-2xl font-bold text-primary mb-3">Settings</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Account</h3>
          <div className="mb-2">
            <span className="font-medium text-gray-700">User:</span>
            <span className="ml-2">{user?.email || user?.name || 'Not signed in'}</span>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Migrations</h3>
          <p className="text-gray-600 mb-3">
            Run database or data migrations and manage advanced configurations.
          </p>
          <Button
            label="Run Migration"
            icon="pi pi-refresh"
            className="p-button-warning"
            onClick={handleMigrate}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Other Configurations</h3>
          <p className="text-gray-600 mb-3">
            (Add more configuration options here as needed.)
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useAuth } from '../../../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { userData: user } = useAuth() ?? {};

  if (!user) {
    return (
      <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Card className="p-4" style={{ maxWidth: 400 }}>
          <div className="flex flex-column align-items-center gap-3">
            <Avatar icon="pi pi-user" size="xlarge" style={{ backgroundColor: '#3B82F6', color: 'white' }} />
            <h2 className="text-xl font-bold">Not Signed In</h2>
            <p className="text-gray-600 text-center">Please sign in to view your profile.</p>
            <Button label="Sign In" icon="pi pi-sign-in" className="p-button-primary" onClick={() => window.location.href = '/signin'} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Card className="p-4 shadow-2" style={{ maxWidth: 480, width: '100%' }}>
        <div className="flex flex-column align-items-center gap-3">
          <Avatar
            icon="pi pi-user"
            size="xlarge"
            style={{ backgroundColor: '#3B82F6', color: 'white', width: 80, height: 80, fontSize: 36 }}
            shape="circle"
          />
          <h2 className="text-2xl font-bold text-primary mb-1">{user.name || user.fullName || 'User'}</h2>
          <span className="text-gray-600">{user.email}</span>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Profile Details</h3>
          <div className="grid">
            <div className="col-12 md:col-6 mb-2">
              <span className="font-medium text-gray-700">Full Name:</span>
              <div>{user.fullName || user.name || '-'}</div>
            </div>
            <div className="col-12 md:col-6 mb-2">
              <span className="font-medium text-gray-700">Email:</span>
              <div>{user.email || '-'}</div>
            </div>
            {user.phone && (
              <div className="col-12 md:col-6 mb-2">
                <span className="font-medium text-gray-700">Phone:</span>
                <div>{user.phone}</div>
              </div>
            )}
            {user.createdAt && (
              <div className="col-12 md:col-6 mb-2">
                <span className="font-medium text-gray-700">Joined:</span>
                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-content-end mt-4 gap-2">
          <Button label="Edit Profile" icon="pi pi-pencil" className="p-button-outlined" onClick={() => window.location.href = '/settings'} />
          <Button label="My Reports" icon="pi pi-file" className="p-button-secondary" onClick={() => window.location.href = '/hub'} />
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
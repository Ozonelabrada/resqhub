import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const Header: React.FC = () => {
  const auth = useAuth();
  const { isAuthenticated, userData } = auth || {};

  return (
    <header className="header" style={{ padding: 12, background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <strong>SHERRA</strong>
      </div>
      <div>
        {isAuthenticated ? (
          <span style={{ color: '#059669', fontWeight: 600 }}>
            Logged in as: {userData?.email || userData?.name || 'User'}
            {userData?.role && ` (${userData.role})`}
          </span>
        ) : (
          <span style={{ color: '#b91c1c', fontWeight: 600 }}>
            Not logged in
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
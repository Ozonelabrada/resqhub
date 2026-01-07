import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Logo } from '../../ui';

const Header: React.FC = () => {
  const auth = useAuth();
  const { isAuthenticated, userData } = auth || {};

  const navigate = useNavigate();

  return (
    <header className="header flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div>
        <Logo size="small" variant="full" />
      </div>
      <div>
        {isAuthenticated ? (
          <div
            className="flex items-center gap-3 cursor-pointer"
            role="link"
            tabIndex={0}
            onClick={() => navigate('/hub')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/hub'); }}
            aria-label="Open your hub"
          >
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Authenticated</div>
              <div className="text-sm font-bold text-slate-700">{userData?.name || userData?.email?.split('@')[0]}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-bold">
              {(userData?.name || userData?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
            Guest Mode
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Search } from 'lucide-react';
import { Button, Logo } from '../../../../ui';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="hero-wrapper relative overflow-hidden min-h-[700px] flex flex-col">
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-wrapper {
          background: linear-gradient(-45deg, #0d9488, #059669, #ea580c, #0d9488);
          background-size: 400% 400%;
          animation: gradientShift 18s ease infinite;
        }
      `}</style>

      {/* Subtle Illustration - Connected Circles in Background */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 opacity-10 pointer-events-none text-white">
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="300" cy="300" r="299" stroke="currentColor" strokeWidth="2" />
          <circle cx="300" cy="300" r="230" stroke="currentColor" strokeWidth="2" />
          <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 opacity-10 pointer-events-none text-white">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="199" stroke="currentColor" strokeWidth="2" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="2" />
          <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between w-full max-w-7xl mx-auto py-8 px-6 md:px-12">
        <Logo size={isBelowDesktop ? 'small' : 'medium'} variant="full" onClick={() => navigate('/')} light />
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-full border border-white/20 shadow-sm backdrop-blur-md">
              <div className="text-right hidden sm:block pl-3 pr-1">
                <div className="text-[10px] uppercase font-bold text-white/70 leading-tight">Member</div>
                <div className="text-sm font-bold text-white leading-tight">{userData?.email?.split('@')[0]}</div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all text-teal-600"
                onClick={onShowAccountMenu}
              >
                <User size={20} />
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm font-bold px-6 rounded-full backdrop-blur-md"
              onClick={onShowGuestMenu}
            >
              <LogIn size={18} className="mr-2" />
              {t('home.hero.sign_in')}
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Body */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center px-6 pb-20">
        
        {/* Main Brand Identifier */}
        <div className="max-w-5xl space-y-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
            {t('home.hero.title')} <br/>
            <span className="text-yellow-300">
               {t('home.hero.subtitle')}
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 max-w-2xl leading-relaxed font-medium">
            {t('home.hero.description')}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
            <form 
              onSubmit={handleSearchSubmit}
              className="relative group h-16 md:h-20"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-teal-400 to-emerald-400 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
              <div className="relative h-full flex items-center bg-white rounded-2xl overflow-hidden px-4 md:px-6 shadow-2xl">
                <Search className="text-teal-600 w-6 h-6 md:w-8 md:h-8" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('home.hero.search_placeholder')}
                  className="flex-1 h-full bg-transparent border-none focus:ring-0 text-slate-800 text-lg md:text-xl font-medium px-4 md:px-6 outline-none"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="hidden md:flex bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 font-bold"
                >
                  Search
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  className="md:hidden bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl"
                >
                  <Search size={20} />
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <Button
              size="lg"
              onClick={() => onReportAction('lost')}
              className="group relative w-full sm:w-56 h-16 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 font-black text-xl group-hover:text-white transition-colors duration-300">
                {t('home.hero.i_lost')}
              </span>
            </Button>
            
            <Button
              size="lg"
              onClick={() => onReportAction('found')}
              className="group relative w-full sm:w-56 h-16 bg-white hover:bg-teal-50 text-teal-700 border-2 border-teal-100 rounded-2xl shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
               <div className="absolute inset-0 bg-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <span className="relative z-10 font-black text-xl group-hover:text-white transition-colors duration-300">
                {t('home.hero.i_found')}
              </span>
            </Button>
          </div>
          
          <div className="pt-12 flex items-center gap-12 text-white/60">
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">5k+</span>
               <span className="text-[10px] uppercase font-bold tracking-widest">Items Found</span>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">12k</span>
               <span className="text-[10px] uppercase font-bold tracking-widest">Active Users</span>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">100%</span>
               <span className="text-[10px] uppercase font-bold tracking-widest">Community</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
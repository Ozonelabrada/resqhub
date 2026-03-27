import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Apple, Download, Smartphone, Monitor } from 'lucide-react';
import { Button, Logo } from '../../../../ui';
import { APP_STORE_CONFIG } from '../../../../../constants/appStoreConfig';

interface HeroSectionProps {
  isAuthenticated: boolean;
  userData: any;
  isBelowDesktop: boolean;
  onReportAction: (type: 'lost' | 'found') => void;
  onGetStartedAction: () => void;
  onSearchAction: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  userData,
  isBelowDesktop,
  onReportAction,
  onGetStartedAction,
  onSearchAction
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadTab, setDownloadTab] = useState<'mobile' | 'desktop'>('mobile');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchAction(searchQuery.trim());
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .hero-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #0d4f4f 20%, #1e1b4b 35%, #134e4a 55%, #1e3a8a 75%, #0f172a 100%);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
          position: relative;
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        .glow-animation {
          animation: glow 4s ease-in-out infinite;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Animated Background Orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl glow-animation"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/12 rounded-full blur-3xl glow-animation" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-teal-600/8 rounded-full blur-3xl glow-animation" style={{ animationDelay: '4s' }}></div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
        backgroundSize: '60px 60px'
      }}></div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between w-full py-6 px-6 md:px-12">
        <Logo size={isBelowDesktop ? 'small' : 'medium'} variant="full" onClick={() => navigate('/')} light />
        <div className="flex-1"></div>
      </nav>

      {/* Hero Body */}
      <div className="relative z-10 w-full flex flex-col items-center text-center px-6 py-16 md:py-20 pb-24 flex-grow">
        
        {/* Main Brand Identifier */}
        <div className="w-full space-y-8 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>
            {t('home.hero.badge') || 'Connecting Communities'}
          </div>

          {/* Main Title with Modern Typography */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1]">
              {t('home.hero.title')} <br/>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {t('home.hero.subtitle')}
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium">
            {t('home.hero.description')}
          </p>

          {/* Search Bar - Modern Enhanced */}
          <div className="w-full max-w-3xl mt-12">
            <form 
              onSubmit={handleSearchSubmit}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition duration-500 opacity-75"></div>
              <div className="relative flex items-center bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden px-6 md:px-8 py-4 md:py-5 border border-white/10 hover:border-teal-400/30 transition-all shadow-2xl">
                <Search className="text-teal-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('home.hero.search_placeholder')}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white text-lg md:text-xl font-medium px-4 md:px-6 outline-none placeholder-white/40"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="hidden md:flex bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg hover:shadow-teal-500/50 transition-all"
                >
                  Search
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  className="md:hidden bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white p-2 rounded-lg"
                >
                  <Search size={20} />
                </Button>
              </div>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="pt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
            <Button
              size="lg"
              onClick={onGetStartedAction}
              aria-label="Get Started"
              className="group relative w-full sm:min-w-[240px] h-14 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-xl hover:shadow-teal-500/50 hover:-translate-y-1 transition-all font-bold text-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Download App Card - Enhanced */}
          <div className="pt-8 w-full max-w-2xl">
            <div className="glass-effect rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-teal-500/20 transition-all border-teal-400/10 hover:border-teal-400/30">
              <div className="space-y-5">
                {/* Header */}
                <div className="space-y-3 text-center">
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    {t('home.hero.available_mobile')}
                  </h3>
                  <p className="text-white/70 text-sm md:text-base font-medium">
                    {t('home.hero.get_the_app')}
                  </p>

                  {/* Tabs */}
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setDownloadTab('mobile')}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        downloadTab === 'mobile'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Smartphone size={16} />
                      {t('home.hero.mobile')}
                    </button>
                    <button
                      onClick={() => setDownloadTab('desktop')}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        downloadTab === 'desktop'
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Monitor size={16} />
                      {t('home.hero.desktop')}
                    </button>
                  </div>
                </div>

                {/* Mobile Downloads */}
                {downloadTab === 'mobile' && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-in fade-in duration-200">
                    <a
                      href={APP_STORE_CONFIG.mobile.android.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105 active:scale-95"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.5 2c-.826 0-1.5.674-1.5 1.5v17c0 .826.674 1.5 1.5 1.5h17c.826 0 1.5-.674 1.5-1.5v-17c0-.826-.674-1.5-1.5-1.5h-17zm0 1h17c.278 0 .5.222.5.5v17c0 .278-.222.5-.5.5h-17c-.278 0-.5-.222-.5-.5v-17c0-.278.222-.5.5-.5zm1.5 2.5h14v11h-14v-11z"/>
                      </svg>
                      <span>{t('home.hero.download_google_play')}</span>
                    </a>

                    <a
                      href={APP_STORE_CONFIG.mobile.ios.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Apple size={18} />
                      <span>{t('home.hero.download_app_store')}</span>
                    </a>
                  </div>
                )}

                {/* Desktop Downloads */}
                {downloadTab === 'desktop' && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-in fade-in duration-200">
                    <a
                      href={APP_STORE_CONFIG.desktop.windows.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/50 transition-all hover:scale-105 active:scale-95"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 3h8v8H2V3zm10 0h10v8H12V3zM2 13h8v8H2v-8zm10 0h10v8H12v-8z"/>
                      </svg>
                      <span>{t('home.hero.download_windows')}</span>
                    </a>

                    <a
                      href={APP_STORE_CONFIG.desktop.macos.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <Apple size={18} />
                      <span>{t('home.hero.download_macos')}</span>
                    </a>
                  </div>
                )}

                {/* Footer Text */}
                <p className="text-center text-xs text-white/50 pt-3 font-medium">
                  {downloadTab === 'mobile' 
                    ? t('home.hero.available_on_platforms')
                    : t('home.hero.available_on_desktop')
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Stats Section - Modern Dashboard Style */}
          <div className="pt-16 w-full">
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass-effect rounded-xl p-4 md:p-6 border-white/10 hover:border-teal-400/30 transition-all">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">5k+</div>
                <div className="text-[11px] md:text-xs uppercase font-bold text-white/60 tracking-wider mt-2">Items Found</div>
              </div>
              <div className="glass-effect rounded-xl p-4 md:p-6 border-white/10 hover:border-emerald-400/30 transition-all">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">12k</div>
                <div className="text-[11px] md:text-xs uppercase font-bold text-white/60 tracking-wider mt-2">Active Users</div>
              </div>
              <div className="glass-effect rounded-xl p-4 md:p-6 border-white/10 hover:border-teal-400/30 transition-all">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">100%</div>
                <div className="text-[11px] md:text-xs uppercase font-bold text-white/60 tracking-wider mt-2">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
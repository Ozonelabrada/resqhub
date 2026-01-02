import React, { useEffect, useState } from 'react';
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
  const [scene, setScene] = useState(1);

  // Central Icon Story Loop (8s cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev % 3) + 1);
    }, 2666); // Roughly 8s total cycle (2s per scene + pause)
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-wrapper relative overflow-hidden min-h-[600px] flex flex-col">
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatIcon {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.25; }
          90% { opacity: 0.25; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .hero-wrapper {
          background: linear-gradient(-45deg, #4A90E2, #50C878, #FFB347, #4A90E2);
          background-size: 400% 400%;
          animation: gradientShift 18s ease infinite;
        }
        .drifting-icon {
          position: absolute;
          bottom: -50px;
          animation: floatIcon 20s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid white;
          animation: typing 2.5s steps(40, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: white } }
      `}</style>

      {/* Floating Decorative Icons */}
      {!isBelowDesktop && (
        <>
          <span className="drifting-icon text-4xl" style={{ left: '10%', animationDelay: '0s' }}>🎒</span>
          <span className="drifting-icon text-3xl" style={{ left: '25%', animationDelay: '5s' }}>📱</span>
          <span className="drifting-icon text-4xl" style={{ left: '60%', animationDelay: '2s' }}>🔑</span>
          <span className="drifting-icon text-3xl" style={{ left: '85%', animationDelay: '8s' }}>💼</span>
        </>
      )}

      {/* Navigation */}
      <nav className={`relative z-50 flex items-center justify-between py-6 ${isBelowDesktop ? 'px-6' : 'px-12'}`}>
        <Logo size={isBelowDesktop ? 'small' : 'medium'} variant="full" onClick={() => navigate('/')} />
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-full border border-white/20">
              <div className="text-right hidden sm:block pl-2">
                <div className="text-[10px] uppercase font-bold text-white/70">Account</div>
                <div className="text-sm font-semibold">{userData?.email?.split('@')[0]}</div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
                onClick={onShowAccountMenu}
              >
                <i className="pi pi-user text-blue-600"></i>
              </div>
            </div>
          ) : (
            <Button 
              label={isBelowDesktop ? "" : "Sign In"} 
              icon="pi pi-user" 
              className="p-button-rounded p-button-text text-white bg-white/10 border-white/30"
              onClick={onShowGuestMenu}
            />
          )}
        </div>
      </nav>

      {/* Hero Body */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pb-20 max-w-5xl mx-auto">
        
        {/* Central Icon Story */}
        <div className="h-32 mb-8 flex items-center justify-center">
          {scene === 1 && (
            <div className="animate-pulse text-6xl drop-shadow-lg">🔍😟</div>
          )}
          {scene === 2 && (
            <div className="animate-bounce text-6xl drop-shadow-lg">📱✨</div>
          )}
          {scene === 3 && (
            <div className="animate-bounce text-6xl drop-shadow-lg">🤝💖</div>
          )}
        </div>

        <h1 className={`${isBelowDesktop ? 'text-3xl' : 'text-6xl'} font-black mb-6 tracking-tight text-white`}>
          Reuniting You With <br/>
          <span className="text-yellow-300 typewriter mx-auto inline-block">What Matters.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed font-medium">
          A platform connecting people who lost items with those who found them. 
          Promoting <span className="underline decoration-green-300">accountability</span> and 
          <span className="underline decoration-orange-300"> honesty</span> in our community.
        </p>

        {/* CTA Buttons */}
        <div className={`flex gap-4 w-full justify-center ${isBelowDesktop ? 'flex-col' : ''}`}>
          <Button
            label="I Lost Something"
            icon="pi pi-exclamation-circle"
            onClick={() => onReportAction('lost')}
            className="p-button-lg px-8 py-4 bg-[#E74C3C] border-none rounded-xl shadow-xl hover:-translate-y-1 transition-all"
          />
          <Button
            label="I Found Something"
            icon="pi pi-heart-fill"
            onClick={() => onReportAction('found')}
            className="p-button-lg px-8 py-4 bg-[#27AE60] border-none rounded-xl shadow-xl hover:-translate-y-1 transition-all"
          />
          <Button
            label="Search Database"
            icon="pi pi-search"
            onClick={() => navigate('/search')}
            className="p-button-lg px-8 py-4 bg-[#4A90E2] border-none rounded-xl shadow-xl hover:-translate-y-1 transition-all"
          />
        </div>
      </div>

      {/* Bottom Wave Decor */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-[#F8F9FA]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.23,74.37,123.06,87.74,182.91,92.83,243.38,98,282.13,67.68,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
import React from 'react';
import { Smartphone, Zap, Lock, Bell, Wifi, Apple } from 'lucide-react';
import { Container } from '../../../../ui';
import { useTranslation } from 'react-i18next';
import { InstallButton } from '../../../../features';
import { useInstallPrompt } from '../../../../../hooks/useInstallPrompt';
import { APP_STORE_CONFIG } from '../../../../../constants/appStoreConfig';

interface MobileInstallSectionProps {
  isBelowDesktop?: boolean;
}

const MobileInstallSection: React.FC<MobileInstallSectionProps> = ({ isBelowDesktop }) => {
  const { t } = useTranslation();
  const { canInstall, isInstalled } = useInstallPrompt();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[120px]"></div>
      </div>

      <Container size="full" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300 text-blue-700 text-sm font-bold">
                <Smartphone size={16} className="text-blue-600" />
                {t('home.mobile.badge')}
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {t('home.mobile.title')} <br />
                <span className="text-blue-600">{t('home.mobile.title_highlight')}</span>
              </h2>

              <p className="text-slate-600 text-lg font-medium leading-relaxed">
                {t('home.mobile.description')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t('home.mobile.feature_1_title')}</p>
                  <p className="text-sm text-slate-600">{t('home.mobile.feature_1_desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wifi size={20} className="text-cyan-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t('home.mobile.feature_2_title')}</p>
                  <p className="text-sm text-slate-600">{t('home.mobile.feature_2_desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t('home.mobile.feature_3_title')}</p>
                  <p className="text-sm text-slate-600">{t('home.mobile.feature_3_desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock size={20} className="text-cyan-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t('home.mobile.feature_4_title')}</p>
                  <p className="text-sm text-slate-600">{t('home.mobile.feature_4_desc')}</p>
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="space-y-4 pt-4">
              {/* PWA Install Option */}
              {canInstall && !isInstalled && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('home.mobile.install_options')}</p>
                  <InstallButton
                    variant="primary"
                    size="lg"
                    className="w-full px-6 py-4 text-base font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105"
                  />
                </div>
              )}

              {/* Native App Store Downloads */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('home.mobile.download_native_app')}</p>
                <div className="flex gap-3">
                  {/* Google Play Button */}
                  <a
                    href={APP_STORE_CONFIG.android.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.609 22.186a1.5 1.5 0 0 1-2.131-2.131L9.53 12 1.478 3.945A1.5 1.5 0 0 1 3.609 1.814zm16.026 9.186l-6.12-7.05a1.5 1.5 0 0 0-2.368 1.862L14.47 12l-3.323 3.188a1.5 1.5 0 0 0 2.368 1.862l6.12-7.05z"/>
                    </svg>
                    <span>Google Play</span>
                  </a>

                  {/* Apple App Store Button */}
                  <a
                    href={APP_STORE_CONFIG.ios.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Apple size={18} />
                    <span>App Store</span>
                  </a>
                </div>
              </div>

              {/* Alternative Text */}
              <p className="text-xs text-slate-500 text-center pt-2">
                {t('home.mobile.available_on_platforms')}
              </p>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-72 h-96">
              {/* Phone mockup background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] shadow-2xl border-8 border-slate-800 overflow-hidden">
                {/* Phone screen content */}
                <div className="w-full h-full bg-white p-6 flex flex-col items-center justify-center text-center space-y-6">
                  <Smartphone size={64} className="text-blue-600 animate-bounce" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">FindrHub Mobile</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      {t('home.mobile.phone_subtitle')}
                    </p>
                  </div>

                  {/* App features list */}
                  <div className="w-full space-y-2 text-xs text-slate-600 mt-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Offline Access</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
                      <span>Push Notifications</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>Lightning Fast</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
                      <span>Secure & Safe</span>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-3xl"></div>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-[3rem] blur-2xl"></div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MobileInstallSection;

import React from 'react';
import { Heart, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Card, Container, Grid, Button } from '../../../../ui';
import { useAuth } from '../../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface CallToActionSectionProps {
  isBelowDesktop: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ isBelowDesktop }) => {
  const { openSignUpModal, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="bg-slate-900 py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[120px]"></div>
      </div>

      <Container size="full" className="relative z-10">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          <div className="p-12 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-bold mb-8">
              <Heart size={16} className="text-orange-500" />
              {t('home.cta.badge')}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              {t('home.cta.title_part1')} <br/>
              <span className="text-teal-400">{t('home.cta.title_part2')}</span> 🤝
            </h2>
            
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              {t('home.cta.subtitle')}
            </p>

            {!isAuthenticated && (
              <div className="mb-20">
                <Button 
                  onClick={() => openSignUpModal()}
                  className="px-12 py-8 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xl font-black shadow-2xl shadow-teal-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  {t('home.cta.button')}
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </div>
            )}

            <Grid cols={3} gap={8} className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-teal-400 border border-white/10">
                  <ShieldCheck size={32} />
                </div>
                <div className="text-white font-bold">{t('home.cta.feature_1')}</div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                  <Users size={32} />
                </div>
                <div className="text-white font-bold">{t('home.cta.feature_2')}</div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-rose-400 border border-white/10">
                  <Heart size={32} />
                </div>
                <div className="text-white font-bold">{t('home.cta.feature_3')}</div>
              </div>
            </Grid>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default CallToActionSection;


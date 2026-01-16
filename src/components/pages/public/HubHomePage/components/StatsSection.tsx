import React from 'react';
import { Package, CheckCircle2, FileText, MapPin, Users, Clock, ShieldCheck } from 'lucide-react';
import { Card, Grid, Container } from '../../../../ui';

import { useTranslation } from 'react-i18next';

interface StatsSectionProps {
  stats: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const { t } = useTranslation();
  if (!stats) return null;

  return (
    <div className="bg-slate-50 py-12 md:py-20">
      <Container size="full">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4">{t('home.stats.title')}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">{t('home.stats.subtitle')}</p>
        </div>

        {/* Primary Stats - Responsive Grid with center alignment on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="p-5 md:p-8 border-none shadow-md md:shadow-xl rounded-2xl md:rounded-3xl bg-white hover:shadow-lg md:hover:scale-105 transition-all group">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:bg-blue-600 transition-colors">
                <Package className="text-blue-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <div className="text-center md:text-left w-full">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">
                  {stats.totalItems.toLocaleString()}
                </div>
                <div className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">{t('home.stats.total_items')}</div>
                <div className="pt-3 md:pt-4 border-t border-slate-50 flex flex-col md:flex-row gap-2 md:gap-4">
                  <div className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase bg-rose-50 px-2 py-1 rounded-md text-center md:text-left">{stats.lostItemsCount} {t('home.stats.lost')}</div>
                  <div className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-md text-center md:text-left">{stats.foundItemsCount} {t('home.stats.found')}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-8 border-none shadow-md md:shadow-xl rounded-2xl md:rounded-3xl bg-white hover:shadow-lg md:hover:scale-105 transition-all group">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:bg-emerald-600 transition-colors">
                <CheckCircle2 className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <div className="text-center md:text-left w-full">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">
                  {stats.successfulMatches.toLocaleString()}
                </div>
                <div className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">{t('home.stats.successful_matches')}</div>
                <div className="pt-3 md:pt-4 border-t border-slate-50">
                  <div className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md inline-block">
                    {stats.successRate.toFixed(1)}% {t('home.stats.success_rate')}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-8 border-none shadow-md md:shadow-xl rounded-2xl md:rounded-3xl bg-white hover:shadow-lg md:hover:scale-105 transition-all group">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:bg-orange-600 transition-colors">
                <FileText className="text-orange-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <div className="text-center md:text-left w-full">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">
                  {stats.activeReports.toLocaleString()}
                </div>
                <div className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">{t('home.stats.active_reports')}</div>
                <div className="pt-3 md:pt-4 border-t border-slate-50">
                  <div className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-md inline-block">
                    {stats.pendingReports} {t('home.stats.pending_verification')}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-8 border-none shadow-md md:shadow-xl rounded-2xl md:rounded-3xl bg-white hover:shadow-lg md:hover:scale-105 transition-all group">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:bg-purple-600 transition-colors">
                <MapPin className="text-purple-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <div className="text-center md:text-left w-full">
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2">
                  {stats.citiesCovered || 0}
                </div>
                <div className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4">{t('home.stats.cities_covered')}</div>
                <div className="pt-3 md:pt-4 border-t border-slate-50">
                  <div className="text-[9px] md:text-[10px] font-black text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-md inline-block">
                    {stats.mostActiveCity ? `${t('home.stats.most_active')}: ${stats.mostActiveCity}` : t('home.stats.growing_daily')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Stats - Responsive with better mobile layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 md:w-12 md:h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
              <Users size={20} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-xl font-black text-slate-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.total_users')}</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 md:w-12 md:h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
              <Clock size={20} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-xl font-black text-slate-900">{stats.averageMatchTimeFormatted}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.avg_match_time')}</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 md:w-12 md:h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-xl font-black text-slate-900">100%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.security_verified')}</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StatsSection;
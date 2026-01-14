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
    <div className="bg-slate-50 py-20">
      <Container size="full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('home.stats.title')}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('home.stats.subtitle')}</p>
        </div>

        <Grid cols={4} gap={6}>
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white hover:scale-105 transition-transform group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Package className="text-blue-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.totalItems.toLocaleString()}
            </div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">{t('home.stats.total_items')}</div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4">
              <div className="text-[10px] font-black text-rose-500 uppercase bg-rose-50 px-2 py-1 rounded-md">{stats.lostItemsCount} {t('home.stats.lost')}</div>
              <div className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-md">{stats.foundItemsCount} {t('home.stats.found')}</div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white hover:scale-105 transition-transform group">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <CheckCircle2 className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.successfulMatches.toLocaleString()}
            </div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">{t('home.stats.successful_matches')}</div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md inline-block">
                {stats.successRate.toFixed(1)}% {t('home.stats.success_rate')}
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white hover:scale-105 transition-transform group">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <FileText className="text-orange-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.activeReports.toLocaleString()}
            </div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">{t('home.stats.active_reports')}</div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-md inline-block">
                {stats.pendingReports} {t('home.stats.pending_verification')}
              </div>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white hover:scale-105 transition-transform group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <MapPin className="text-purple-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stats.citiesCovered || 0}
            </div>
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">{t('home.stats.cities_covered')}</div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="text-[10px] font-black text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-md inline-block">
                {stats.mostActiveCity ? `${t('home.stats.most_active')}: ${stats.mostActiveCity}` : t('home.stats.growing_daily')}
              </div>
            </div>
          </Card>
        </Grid>

        {/* Secondary Stats */}
        <Grid cols={3} gap={6} className="mt-8">
          <div className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
              <Users size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.total_users')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{stats.averageMatchTimeFormatted}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.avg_match_time')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">100%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home.stats.security_verified')}</div>
            </div>
          </div>
        </Grid>
      </Container>
    </div>
  );
};

export default StatsSection;
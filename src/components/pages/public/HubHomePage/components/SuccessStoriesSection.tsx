import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, ArrowRight, ExternalLink, MapPin, Clock } from 'lucide-react';
import { Card, Button, StatusBadge, Grid, Container } from '../../../../ui';
import { useTranslation } from 'react-i18next';

interface SuccessStory {
  id: number;
  title: string;
  location: string;
  timeAgo: string;
  type: 'lost' | 'found';
  image: string;
}

interface SuccessStoriesSectionProps {
  recentSuccesses: SuccessStory[];
}

const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  recentSuccesses
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const renderSuccessCard = (item: SuccessStory) => (
    <Card
      key={item.id}
      className="group h-full border-none shadow-xl rounded-[2rem] bg-white overflow-hidden hover:scale-[1.02] transition-all duration-500"
    >
      <div className="p-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
          <img
            src={item.image}
            alt={item.title}
            className="relative w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
            <PartyPopper size={16} />
          </div>
        </div>

        <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
        
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={item.type === 'lost' ? 'lost' : 'found'} />
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
            <MapPin size={12} /> {item.location}
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300 text-[10px] font-black uppercase tracking-widest mb-6">
          <Clock size={10} /> {item.timeAgo}
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled
          className="w-full rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 font-bold group/btn"
          onClick={() => navigate(`/success-stories/${item.id}`)}
        >
          {t('home.success.read_story')}
          <ExternalLink size={14} className="ml-2 opacity-0 group-hover/btn:opacity-100 transition-all" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="bg-slate-900 py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <Container size="full" className="relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
              <PartyPopper size={16} />
              {t('home.success.tag')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t('home.success.title')}</h2>
            <p className="text-slate-400 text-lg font-medium">
              {t('home.success.subtitle')}
            </p>
          </div>
          
          <Button
            variant="ghost"
            disabled
            className="text-white border-white/20 hover:bg-white/10 rounded-2xl px-8 h-14 font-bold"
            onClick={() => navigate('/success-stories')}
          >
            {t('home.success.view_all')}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>

        <Grid cols={3} gap={8}>
          {recentSuccesses.map((item) => renderSuccessCard(item))}
        </Grid>
      </Container>
    </div>
  );
};

export default SuccessStoriesSection;
import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Button } from '../../../../ui';
import { useTranslation } from 'react-i18next';

interface MobileBottomBarProps {
  isBelowDesktop: boolean;
  showBottomBar: boolean;
  onReportAction: (type: 'lost' | 'found') => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  isBelowDesktop,
  showBottomBar,
  onReportAction
}) => {
  const { t } = useTranslation();
  if (!isBelowDesktop) return null;

  return (
    <div
      className={`fixed left-0 right-0 bottom-8 z-50 flex justify-center px-6 transition-all duration-500 transform ${
        showBottomBar ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <div className="flex gap-4 p-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md">
        <Button
          size="lg"
          className="flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white border-none rounded-2xl font-black text-lg shadow-lg shadow-rose-500/20"
          onClick={() => onReportAction('lost')}
        >
          <MinusCircle size={20} className="mr-2" />
          {t('home.stats.lost')}
        </Button>
        <Button
          size="lg"
          className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20"
          onClick={() => onReportAction('found')}
        >
          <PlusCircle size={20} className="mr-2" />
          {t('home.stats.found')}
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomBar;

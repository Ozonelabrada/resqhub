import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../ui';
import { CheckCircle2 } from 'lucide-react';

interface SuccessStepProps {
  communityName: string;
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ communityName, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="p-12 text-center space-y-6">
       <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="text-emerald-500" size={40} />
       </div>
       <div>
          <h3 className="text-2xl font-black text-slate-900">{t('community.create.success.title')}</h3>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
             {t('community.create.success.message', { name: communityName })}
          </p>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-400 font-medium">
             {t('community.create.success.note')}
          </div>
       </div>
       <Button onClick={onClose} className="bg-slate-900 text-white font-black px-10 h-12 rounded-xl w-full">
          {t('community.create.success.button')}
       </Button>
    </div>
  );
};

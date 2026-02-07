import React from 'react';
import { AlertCircle, CheckCircle2, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';

interface ResponsiblePostingReminderProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export const ResponsiblePostingReminder: React.FC<ResponsiblePostingReminderProps> = ({ 
  isChecked, 
  onChange 
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle size={20} className="text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('report.responsible_posting_title')}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {t('report.responsible_posting_subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 space-y-4 border border-orange-100">
        <p className="text-sm font-medium text-slate-700">
          {t('report.posting_reminder_intro')}
        </p>

        {/* Confirmation Items */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">
              {t('report.confirmation_truthful')}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">
              {t('report.confirmation_no_accusations')}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">
              {t('report.confirmation_legally_responsible')}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">
              {t('report.confirmation_agree_tos')}
            </span>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
            ✓ {t('report.allowed_examples')}
          </p>
          <div className="bg-emerald-50 rounded-xl p-3 space-y-2 text-xs text-emerald-800 border border-emerald-100">
            <p>• "{t('report.example_allowed_1')}"</p>
            <p>• "{t('report.example_allowed_2')}"</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-2">
            ✗ {t('report.not_allowed_examples')}
          </p>
          <div className="bg-rose-50 rounded-xl p-3 space-y-2 text-xs text-rose-800 border border-rose-100">
            <p>• "{t('report.example_not_allowed_1')}"</p>
            <p>• "{t('report.example_not_allowed_2')}"</p>
          </div>
        </div>
      </div>

      {/* Agree and Proceed Button */}
      <div className="pt-4">
        <Button
          onClick={() => onChange(true)}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 font-bold text-base transition-all"
        >
          <CheckCheck className="w-5 h-5 mr-2" />
          {t('report.agree_and_proceed')}
        </Button>
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-slate-500 text-center space-y-1">
        <p>
          {t('report.legal_notice_1')}
        </p>
        <p className="font-semibold text-slate-600">
          {t('report.legal_notice_2')}
        </p>
      </div>
    </div>
  );
};

export default ResponsiblePostingReminder;

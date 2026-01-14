import React from 'react';
import { MessagesContainer } from '../../../features/messages/MessagesContainer';
import { useTranslation } from 'react-i18next';

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('common.messages', 'Messages')}
          </h1>
          <p className="text-slate-500 font-medium">
            Stay connected with your community and coordinate reunions.
          </p>
        </div>
        
        <div className="h-[calc(100vh-250px)] min-h-[600px]">
          <MessagesContainer />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

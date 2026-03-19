import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RiderManagementPage } from './pages/RiderManagementPage';
import { SellerManagementPage } from './pages/SellerManagementPage';
import { PersonalServicesManagementPage } from './pages/PersonalServicesManagementPage';
import { EventManagementPage } from './pages/EventManagementPage';
import { ServiceType, SubscriptionCreditPageProps } from './types/subscription';

const serviceLabels: Record<ServiceType, { label: string }> = {
  rider: { label: 'Rider' },
  seller: { label: 'Seller' },
  'personal-services': { label: 'Service Provider' },
  event: { label: 'Event' },
};

export const SubscriptionCreditPage: React.FC<SubscriptionCreditPageProps> = ({
  hideHeader = false,
  serviceType: initialServiceType = 'rider',
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);

  const renderPage = () => {
    switch (serviceType) {
      case 'rider':
        return <RiderManagementPage hideHeader={hideHeader} />;
      case 'seller':
        return <SellerManagementPage hideHeader={hideHeader} />;
      case 'personal-services':
        return <PersonalServicesManagementPage hideHeader={hideHeader} />;
      case 'event':
        return <EventManagementPage hideHeader={hideHeader} />;
      default:
        return <RiderManagementPage hideHeader={hideHeader} />;
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Credit Management</h1>
            <p className="text-gray-600 mt-1">Manage credits across all service types</p>
          </div>

          {/* Service Type Selector */}
          <div className="flex gap-2 flex-wrap">
            {(['rider', 'seller', 'personal-services', 'event'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => setServiceType(type)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  serviceType === type
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                {serviceLabels[type].label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {renderPage()}
    </div>
  );
};

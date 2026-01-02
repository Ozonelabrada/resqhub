import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';

interface SuccessStory {
  id: number;
  title: string;
  location: string;
  timeAgo: string;
  type: 'lost' | 'found';
  image: string;
}

interface SuccessStoriesSectionProps {
  isBelowDesktop: boolean;
  recentSuccesses: SuccessStory[];
}

const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({
  isBelowDesktop,
  recentSuccesses
}) => {
  const navigate = useNavigate();

  const renderSuccessCard = (item: SuccessStory) => (
    <Card
      key={item.id}
      className="h-full border-0 shadow-4"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
        borderRadius: '18px',
        overflow: 'hidden',
        minHeight: 220,
        color: '#222'
      }}
    >
      <div className="flex flex-column align-items-center p-4">
        <img
          src={item.image}
          alt={item.title}
          className="mb-3"
          style={{
            width: 72,
            height: 72,
            objectFit: 'cover',
            borderRadius: '50%',
            border: '3px solid #16a34a',
            boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
          }}
        />
        <div className="font-bold text-lg mb-1">{item.title}</div>
        <div className="flex align-items-center gap-2 mb-2">
          <Badge
            value={item.type === 'lost' ? 'Lost' : 'Found'}
            severity={item.type === 'lost' ? 'danger' : 'success'}
            className="text-xs"
          />
          <span className="text-gray-500 text-sm">{item.location}</span>
        </div>
        <div className="text-xs text-gray-400 mb-2">{item.timeAgo}</div>
        <Button
          label="View Details"
          icon="pi pi-external-link"
          className="p-button-text p-button-sm"
          style={{
            color: '#2563eb',
            fontWeight: 600
          }}
          onClick={() => navigate(`/success-stories/${item.id}`)}
        />
      </div>
    </Card>
  );

  return (
    <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-6`} style={{ backgroundColor: '#3c5547ff', color: 'white' }}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Recent Success Stories 🎉</h3>
        <p className="text-gray-200 mb-4">See how our community helps reunite people with their belongings</p>
        <Button
          label="View All Success Stories"
          icon="pi pi-arrow-right"
          iconPos="right"
          className="p-button-outlined p-button-sm"
          style={{
            color: '#fff',
            borderColor: '#fff',
            backgroundColor: 'transparent'
          }}
          onClick={() => navigate('/success-stories')}
        />
      </div>

      {/* Responsive grid for desktop, stacked for mobile */}
      {isBelowDesktop ? (
        <div className="grid gap-4">
          {recentSuccesses.map((item) => (
            <div key={item.id} className="col-12">
              {renderSuccessCard(item)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
          {/* Desktop custom layout */}
          {recentSuccesses.length === 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {renderSuccessCard(recentSuccesses[0])}
              </div>
            </div>
          )}
          {recentSuccesses.length === 2 && (
            <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
              {recentSuccesses.map((item) => (
                <div key={item.id} style={{ flex: 1 }}>
                  {renderSuccessCard(item)}
                </div>
              ))}
            </div>
          )}
          {(recentSuccesses.length === 3 || recentSuccesses.length === 4) && (
            <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
              {recentSuccesses.map((item) => (
                <div key={item.id} style={{ flex: 1 }}>
                  {renderSuccessCard(item)}
                </div>
              ))}
            </div>
          )}
          {recentSuccesses.length === 5 && (
            <>
              <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                {recentSuccesses.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ flex: 1 }}>
                    {renderSuccessCard(item)}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
                {recentSuccesses.slice(3, 5).map((item) => (
                  <div key={item.id} style={{ flex: 1 }}>
                    {renderSuccessCard(item)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesSection;
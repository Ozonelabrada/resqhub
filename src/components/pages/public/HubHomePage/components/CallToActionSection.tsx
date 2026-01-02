import React from 'react';
import { Card } from 'primereact/card';

interface CallToActionSectionProps {
  isBelowDesktop: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ isBelowDesktop }) => {
  return (
    <div className={`${isBelowDesktop ? 'px-4' : 'px-8'} py-8`}
         style={{ backgroundColor: '#8eb8a7ff' }}>
      <Card className="text-center border-0 shadow-4"
            style={{
              background: 'linear-gradient(135deg, #476359ff 0%, #dbeafe 100%)',
              border: '2px solid #93c5fd'
            }}>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-blue-800 mb-3">
            Ready to Help Your Community? 🤝
          </h3>
          <p className="text-blue-700 mb-4 line-height-3">
            Join thousands of people helping reunite lost items with their owners.
            Every report counts and makes a difference!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CallToActionSection;
import React from 'react';
import { CommunitiesContainer } from '@/components/features/communities/CommunitiesContainer';

const CommunitiesPage: React.FC = () => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      <div className="mb-6 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-2">
          Discover Communities
        </h1>
        <p className="text-slate-500 text-base sm:text-lg font-medium">
          Find and join local groups dedicated to helping each other.
        </p>
      </div>
      <CommunitiesContainer />
    </div>
  );
};

export default CommunitiesPage;

import React from 'react';
import { CommunitiesContainer } from '@/components/features/communities/CommunitiesContainer';

const CommunitiesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Discover Communities
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Find and join local groups dedicated to helping each other.
        </p>
      </div>
      <CommunitiesContainer />
    </div>
  );
};

export default CommunitiesPage;

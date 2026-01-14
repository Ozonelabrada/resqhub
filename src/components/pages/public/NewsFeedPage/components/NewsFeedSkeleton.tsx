import React from 'react';

const NewsFeedSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-80 h-64 md:h-auto bg-gray-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
          <div className="h-4 w-1/2 bg-gray-50 rounded-lg" />
        </div>
        <div className="h-20 w-full bg-gray-50 rounded-lg" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="space-y-1">
              <div className="h-3 w-20 bg-gray-100 rounded" />
              <div className="h-2 w-16 bg-gray-50 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded bg-gray-50" />
            <div className="w-6 h-6 rounded bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NewsFeedSkeleton;

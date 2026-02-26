import React from 'react';

export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white safe-area">
    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse border-b border-gray-300"></div>
    <div className="px-4 -mt-16">
      <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto animate-pulse border-4 border-white border border-gray-400"></div>
    </div>
    <div className="pt-20 px-4 text-center space-y-4">
      <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto animate-pulse border border-gray-400"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse border border-gray-300"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto animate-pulse border border-gray-300"></div>
    </div>
    <div className="px-4 mt-8">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse border border-gray-300"></div>
        ))}
      </div>
    </div>
  </div>
);
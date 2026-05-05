import React from 'react';

export const NewsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="bg-slate-200 h-64 rounded-3xl"></div>
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
);

export const MarketTickerSkeleton = () => (
  <div className="animate-pulse flex space-x-4 p-4 bg-white rounded-2xl shadow-sm">
    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
);

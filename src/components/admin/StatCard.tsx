import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  previous?: number | null;
  icon: React.ReactNode;
  suffix?: string;
  precision?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previous,
  icon,
  suffix = '',
  precision = 0,
}) => {
  const percentChange = previous != null && previous !== 0
    ? ((value - previous) / previous) * 100
    : null;

  const formattedValue = value.toLocaleString(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  });

  return (
    <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formattedValue}{suffix}
          </p>
          {previous != null && percentChange !== null && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              {percentChange > 0 ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : percentChange < 0 ? (
                <TrendingDown size={14} className="text-red-600" />
              ) : (
                <Minus size={14} className="text-gray-400" />
              )}
              <span className={percentChange > 0 ? 'text-green-600' : percentChange < 0 ? 'text-red-600' : 'text-gray-500'}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs previous</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-green-100 text-green-700">{icon}</div>
      </div>
    </div>
  );
};
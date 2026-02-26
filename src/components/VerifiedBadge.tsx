// components/VerifiedBadge.tsx
import React from 'react';

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 16, 
  className = '',
  showTooltip = false 
}) => {
  const badgeSize = size;
 
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative group">
        {/* Badge background */}
        <svg 
          width={badgeSize} 
          height={badgeSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Green gradient circle */}
          <circle 
            cx="12" 
            cy="12" 
            r="12" 
            fill="url(#green-gradient)"
          />
          
          {/* White check mark */}
          <path 
            d="M7 12L10 15L17 9" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient 
              id="green-gradient" 
              x1="0" 
              y1="0" 
              x2="24" 
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10B981" />  {/* Green-500 */}
              <stop offset="1" stopColor="#059669" />  {/* Green-600 */}
            </linearGradient>
          </defs>
        </svg>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Verified Member
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifiedBadge;
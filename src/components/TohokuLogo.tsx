/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TohokuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TohokuLogo: React.FC<TohokuLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const globeSizes = {
    sm: { w: 28, h: 28, r: 12, font: 'text-sm' },
    md: { w: 36, h: 36, r: 16, font: 'text-base sm:text-lg' },
    lg: { w: 52, h: 52, r: 24, font: 'text-xl sm:text-2xl' },
  };

  const current = globeSizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Red Wireframe Globe Vector matching Tohoku Solutions identity */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg 
          width={current.w} 
          height={current.h} 
          viewBox="0 0 60 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:rotate-12"
        >
          {/* Globe Outer Circle */}
          <circle cx="30" cy="30" r="27" stroke="#dc2626" strokeWidth="2.75" />
          
          {/* Equator & Vertical Axis */}
          <line x1="3" y1="30" x2="57" y2="30" stroke="#dc2626" strokeWidth="2.2" />
          <line x1="30" y1="3" x2="30" y2="57" stroke="#dc2626" strokeWidth="2.2" />
          
          {/* Latitude Lines */}
          <line x1="7" y1="16" x2="53" y2="16" stroke="#dc2626" strokeWidth="1.8" />
          <line x1="7" y1="44" x2="53" y2="44" stroke="#dc2626" strokeWidth="1.8" />
          
          {/* Longitude Ellipses */}
          <ellipse cx="30" cy="30" rx="11" ry="27" stroke="#dc2626" strokeWidth="1.8" />
          <ellipse cx="30" cy="30" rx="20" ry="27" stroke="#dc2626" strokeWidth="1.8" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-wider text-[#0060AA] leading-none ${current.font}`}>
            TOHOKU SOLUTIONS
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-500 uppercase mt-0.5">
            Corporate Web Portal
          </span>
        </div>
      )}
    </div>
  );
};

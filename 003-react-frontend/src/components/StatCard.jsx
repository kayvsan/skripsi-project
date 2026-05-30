import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color, trend }) {
  // Calculate percentage for the SVG circle dasharray
  // Assuming standard ranges: Temp (0-50), Humidity (0-100), Soil (0-100)
  let max = 100;
  if (unit === '°C') max = 50;
  
  const percentage = Math.min(Math.max((Number(value) / max) * 100, 0), 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card-base p-6 flex flex-col justify-between gap-4 group">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-2">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-ink">{value}</span>
            <span className="text-lg text-slate">{unit}</span>
          </div>
        </div>
        
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center w-[90px] h-[90px]">
          {/* Background circle */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={`${color}20`}
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex items-center justify-center" style={{ color: color }}>
            <Icon size={24} />
          </div>
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 text-sm mt-2">
          <span className={`font-semibold flex items-center ${trend >= 0 ? 'text-brand-green' : 'text-brand-orange'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-stone text-xs">vs periode sebelumnya</span>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color, trend }) {
  // Calculate percentage for the SVG circle dasharray
  let max = 100;
  if (unit === '°C') max = 50;
  
  const percentage = Math.min(Math.max((Number(value) / max) * 100, 0), 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-section p-6 flex flex-col justify-between gap-4 group relative overflow-hidden">
      {/* Background soft glow matching the accent color */}
      <div 
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-15 transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: color }}
      />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-text-label text-sm font-medium mb-3">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-text-heading tracking-tight">{Number(value).toFixed(1)}</span>
            <span className="text-lg text-text-label">{unit}</span>
          </div>
        </div>
        
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center w-[96px] h-[96px]">
          {/* Background circle */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-md"
              style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            />
          </svg>
          <div className="absolute flex items-center justify-center opacity-80" style={{ color: color }}>
            <Icon size={24} />
          </div>
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-1 relative z-10">
          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${trend >= 0 ? 'bg-status-on-bg text-status-on' : 'bg-status-off-bg text-status-off'}`}>
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className="text-text-dim text-xs">vs periode lalu</span>
        </div>
      )}
    </div>
  );
}

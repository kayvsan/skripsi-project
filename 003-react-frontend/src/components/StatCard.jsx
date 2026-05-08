import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color, trend }) {
  return (
    <div className="glass-panel glass-panel-hover p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-400 text-base font-medium mb-2">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-50">{value}</span>
            <span className="text-lg text-slate-400">{unit}</span>
          </div>
        </div>
        <div 
          className="p-3 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          <Icon size={28} className="animate-glow" />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-semibold flex items-center ${trend >= 0 ? 'text-accent-emerald' : 'text-accent-amber'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-400">vs periode sebelumnya</span>
        </div>
      )}
    </div>
  );
}

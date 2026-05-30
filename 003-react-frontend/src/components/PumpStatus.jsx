import React from 'react';
import { Power, Timer } from 'lucide-react';

export default function PumpStatus({ status }) {
  const isPumpOn = status.pump === 'ON';

  return (
    <div className="kpi-panel kpi-panel-hover p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
      <div className={`
        relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-colors duration-500
        ${isPumpOn ? 'bg-accent-emerald shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-surface border border-border-default'}
      `}>
        <Power 
          size={40} 
          className={`transition-colors duration-500 ${isPumpOn ? 'text-white' : 'text-text-secondary'}`} 
        />
      </div>

      <h3 className="text-text-secondary text-sm font-medium mb-1 z-10 uppercase tracking-widest">Status Pompa</h3>
      <div className={`text-3xl font-bold z-10 ${isPumpOn ? 'text-accent-emerald' : 'text-text-primary'}`}>
        {isPumpOn ? 'Pompa Menyala' : 'Pompa Mati'}
      </div>

      <div className="flex items-center gap-2 text-text-secondary mt-4 z-10">
        <Timer size={16} />
        <span className="text-sm">Durasi Terakhir: {status.duration_percent?.toFixed(1)}%</span>
      </div>
    </div>
  );
}

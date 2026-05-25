import React from 'react';
import { Power, Timer } from 'lucide-react';

export default function PumpStatus({ status }) {
  const isActive = status.pump === 'ON';

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 text-base font-medium">Status Pompa</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-accent-emerald/20 text-accent-emerald animate-pulse' : 'bg-slate-700/50 text-slate-400'}`}>
          {isActive ? 'ACTIVE' : 'IDLE'}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-accent-emerald text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
          <Power size={32} />
        </div>
        
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-50">
            {isActive ? 'Pompa Menyala' : 'Pompa Mati'}
          </span>
          <div className="flex items-center gap-2 text-slate-400 mt-1">
            <Timer size={16} />
            <span className="text-sm">Durasi Terakhir: {status.duration_percent?.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

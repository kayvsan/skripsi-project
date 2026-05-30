import React from 'react';
import { Power, Timer } from 'lucide-react';

export default function PumpStatus({ status }) {
  const isOn = status === 'ON';
  
  return (
    <div className="card-base p-6 h-full flex flex-col justify-center gap-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center transition-colors duration-500
          ${isOn ? 'bg-primary text-white shadow-md' : 'bg-surface text-slate border border-hairline'}`}
        >
          <Power size={32} />
        </div>
        <div>
          <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-1">Status Pompa</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${isOn ? 'text-primary' : 'text-slate'}`}>
              {isOn ? 'MENYALA' : 'MATI'}
            </span>
            {isOn && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

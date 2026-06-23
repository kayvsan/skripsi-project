import React from 'react';
import { Power } from 'lucide-react';

export default function PumpStatus({ status }) {
  const isOn = status?.pump === 'ON';
  
  return (
    <div className="glass-section p-6 h-full flex flex-col justify-center gap-6 relative overflow-hidden group">
      {/* Background ambient glow when pump is ON */}
      {isOn && (
        <div className="absolute inset-0 bg-accent-purple-soft blur-3xl opacity-30 transition-opacity duration-1000" />
      )}
      
      <div className="flex flex-row lg:flex-col xl:flex-row items-center gap-5 relative z-10">
        <div className={`relative flex shrink-0 items-center justify-center w-16 h-16 rounded-2xl transition-all duration-700
          ${isOn ? 'bg-glass-item shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-accent-purple-soft' : 'glass-item text-text-dim'}`}
        >
          {isOn && (
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-accent-purple"></span>
          )}
          <Power size={32} className={isOn ? 'text-accent-purple drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''} />
        </div>
        
        <div>
          <h3 className="text-text-label text-sm font-medium mb-2">Status Pompa</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold tracking-tight ${isOn ? 'text-text-heading' : 'text-text-label'}`}>
              {isOn ? 'AKTIF' : 'MATI'}
            </span>
            {isOn && (
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-purple"></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

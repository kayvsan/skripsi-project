import React from 'react';

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-[16px] w-fit border border-white/5">
      <button
        onClick={() => setActiveTab('monitoring')}
        className={`
          px-6 py-2.5 rounded-[12px] font-rubik text-[16px] font-medium transition-all duration-150
          ${activeTab === 'monitoring' 
            ? 'bg-[#4d0dd9] text-white shadow-[0_4px_0_0_rgb(77,13,217)] translate-y-[-2px]' 
            : 'bg-transparent text-[#435270] hover:text-slate-300'
          }
        `}
      >
        Monitoring
      </button>
      <button
        onClick={() => setActiveTab('kpi')}
        className={`
          px-6 py-2.5 rounded-[12px] font-rubik text-[16px] font-medium transition-all duration-150
          ${activeTab === 'kpi' 
            ? 'bg-[#4d0dd9] text-white shadow-[0_4px_0_0_rgb(77,13,217)] translate-y-[-2px]' 
            : 'bg-transparent text-[#435270] hover:text-slate-300'
          }
        `}
      >
        KPI Analytics
      </button>
    </div>
  );
}

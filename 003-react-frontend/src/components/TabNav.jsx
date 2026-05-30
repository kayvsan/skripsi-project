import React from 'react';

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-8 bg-surface p-1.5 rounded-[16px] w-fit border border-border-default shadow-[var(--shadow-custom)]">
      <button
        onClick={() => setActiveTab('monitoring')}
        className={`
          px-6 py-2.5 rounded-[12px] font-rubik text-[16px] font-medium transition-all duration-150
          ${activeTab === 'monitoring' 
            ? 'bg-brand text-white shadow-[var(--shadow-custom)] translate-y-[-2px]' 
            : 'bg-transparent text-text-secondary hover:text-text-primary'
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
            ? 'bg-brand text-white shadow-[var(--shadow-custom)] translate-y-[-2px]' 
            : 'bg-transparent text-text-secondary hover:text-text-primary'
          }
        `}
      >
        KPI Analytics
      </button>
    </div>
  );
}

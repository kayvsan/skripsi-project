import React from 'react';
import { Activity, BarChart3 } from 'lucide-react';

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 w-fit">
      <button
        onClick={() => setActiveTab('monitoring')}
        className={`flex items-center gap-2 ${activeTab === 'monitoring' ? 'pill-tab-active' : 'pill-tab'}`}
      >
        <Activity size={16} />
        Real-time Monitoring
      </button>
      {/* <button
        onClick={() => setActiveTab('kpi')}
        className={`flex items-center gap-2 ${activeTab === 'kpi' ? 'pill-tab-active' : 'pill-tab'}`}
      >
        <BarChart3 size={16} />
        KPI Analytics
      </button> */}
    </div>
  );
}

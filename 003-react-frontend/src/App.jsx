import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Sprout, Activity, Download, RefreshCcw } from 'lucide-react';
import StatCard from './components/StatCard';
import TrendChart from './components/TrendChart';
import HistoryTable from './components/HistoryTable';
import FuzzyTable from './components/FuzzyTable';
import TabNav from './components/TabNav';
import KpiPage from './components/KpiPage';
import PumpStatus from './components/PumpStatus';
import IrrigationLogs from './components/IrrigationLogs';
import { useMqtt } from './lib/mqtt';
import { getHistory, getIrrigationLogs, getStats, getFuzzyDecisions, downloadHistoryUrl } from './lib/api';

function App() {
  const { isConnected, liveData, pumpStatus } = useMqtt();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [historyData, setHistoryData] = useState([]);
  const [irrigationLogs, setIrrigationLogs] = useState([]);
  const [fuzzyDecisions, setFuzzyDecisions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString().split('T')[0];
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [history, logs, currentStats, fuzzy] = await Promise.all([
        getHistory(50, startDate, endDate),
        getIrrigationLogs(20),
        getStats(),
        getFuzzyDecisions(50, startDate, endDate)
      ]);
      
      // Transform DB data to match chart format
      const formattedHistory = history.map(item => ({
        time: new Date(item.created_at).toLocaleTimeString('id-ID', { hour12: false }),
        suhu: item.suhu,
        kelembapanUdara: item.kelembapan_udara,
        kelembapanTanah: item.kelembapan_tanah
      })).reverse();

      setHistoryData(formattedHistory);
      setIrrigationLogs(logs);
      setStats(currentStats);
      setFuzzyDecisions(fuzzy);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Update real-time chart when new MQTT data arrives
  useEffect(() => {
    if (liveData) {
      setHistoryData(prev => {
        const newData = [...prev];
        if (newData.length >= 50) newData.shift();
        
        // Match format
        const entry = {
          time: liveData.time,
          suhu: liveData.suhu,
          kelembapanUdara: liveData.kelembapan_udara,
          kelembapanTanah: liveData.kelembapan_tanah
        };
        
        newData.push(entry);
        return newData;
      });
    }
  }, [liveData]);

  // Normalize liveData keys from snake_case (MQTT) to camelCase (used by StatCards)
  const normalizedLiveData = liveData ? {
    suhu: liveData.suhu,
    kelembapanUdara: liveData.kelembapan_udara ?? liveData.kelembapanUdara,
    kelembapanTanah: liveData.kelembapan_tanah ?? liveData.kelembapanTanah,
    time: liveData.time,
  } : null;
  const currentData = normalizedLiveData || (historyData.length > 0 ? historyData[historyData.length - 1] : { suhu: 0, kelembapanUdara: 0, kelembapanTanah: 0 });
  const prevData = historyData.length > 1 ? historyData[historyData.length - 2] : currentData;

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return +(((current - previous) / previous) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Clean Top Header (Notion App Style) */}
      <header className="bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-green/10 rounded-md">
                <Sprout className="text-brand-green" size={20} />
              </div>
              <h1 className="text-[18px] font-semibold tracking-tight text-ink">
                ChiliSmart Dashboard
              </h1>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${isConnected ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-green' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface p-1 rounded-md border border-hairline">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-ink text-sm px-2 py-1 focus:outline-none"
              />
              <span className="text-slate text-sm">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-ink text-sm px-2 py-1 focus:outline-none"
              />
            </div>
            <button 
              onClick={fetchData}
              className="text-ink border border-hairline-strong font-medium inline-flex items-center justify-center transition-colors duration-150 hover:bg-surface rounded-md px-3 py-[7px] gap-2 text-sm"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <a 
              href={downloadHistoryUrl}
              className="button-primary text-sm py-[7px] px-3 gap-2"
            >
              <Download size={14} />
              Export
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

      <div className="mt-8">
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="mt-6 pb-20">
        {activeTab === 'monitoring' ? (
          <main className="space-y-8">
          
          {/* Stats Summary Section */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-base p-5 flex items-center justify-between border-l-4 border-l-brand-teal">
                <div>
                  <p className="text-[13px] text-slate font-semibold uppercase tracking-wider mb-1">Rata-Rata Suhu Hari Ini</p>
                  <p className="text-xl font-bold text-ink">{Number(stats.averageToday?.avg_suhu || 0).toFixed(1)}°C</p>
                </div>
              </div>
              <div className="card-base p-5 flex items-center justify-between border-l-4 border-l-brand-orange">
                <div>
                  <p className="text-[13px] text-slate font-semibold uppercase tracking-wider mb-1">Rata-Rata Kelembapan Udara</p>
                  <p className="text-xl font-bold text-ink">{Number(stats.averageToday?.avg_hum || 0).toFixed(1)}%</p>
                </div>
              </div>
              <div className="card-base p-5 flex items-center justify-between border-l-4 border-l-brand-green">
                <div>
                  <p className="text-[13px] text-slate font-semibold uppercase tracking-wider mb-1">Rata-Rata Kelembapan Tanah</p>
                  <p className="text-xl font-bold text-ink">{Number(stats.averageToday?.avg_soil || 0).toFixed(1)}%</p>
                </div>
              </div>
              <div className="card-base p-5 flex items-center justify-between border-l-4 border-l-primary">
                <div>
                  <p className="text-[13px] text-slate font-semibold uppercase tracking-wider mb-1">Total Penyiraman</p>
                  <p className="text-xl font-bold text-ink">{stats.totalIrrigationToday || 0} kali</p>
                </div>
              </div>
            </div>
          )}
          {/* Top Section: Metrics & Pump Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Suhu Udara (Live)" 
              value={currentData.suhu} 
              unit="°C" 
              icon={Thermometer} 
              color="#f97316"
              trend={getTrend(currentData.suhu, prevData.suhu)}
            />
            <StatCard 
              title="Kelembapan Udara (Live)" 
              value={currentData.kelembapanUdara} 
              unit="%" 
              icon={Droplets} 
              color="#14b8a6"
              trend={getTrend(currentData.kelembapanUdara, prevData.kelembapanUdara)}
            />
            <StatCard 
              title="Kelembapan Tanah (Live)" 
              value={currentData.kelembapanTanah} 
              unit="%" 
              icon={Sprout} 
              color="#10b981"
              trend={getTrend(currentData.kelembapanTanah, prevData.kelembapanTanah)}
            />
          </div>
          <div className="lg:col-span-1">
            <PumpStatus status={pumpStatus} />
          </div>
        </div>

        {/* Middle Section: Main Chart */}
        <section>
          <TrendChart data={historyData} />
        </section>

        {/* Bottom Section: History Table & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HistoryTable data={historyData} />
            <FuzzyTable data={fuzzyDecisions} />
          </div>
          <div className="lg:col-span-1">
            <IrrigationLogs logs={irrigationLogs} />
          </div>
        </div>
      </main>
      ) : (
        <KpiPage startDate={startDate} endDate={endDate} />
      )}
      </div>
    </div>
  </div>
  );
}

export default App;

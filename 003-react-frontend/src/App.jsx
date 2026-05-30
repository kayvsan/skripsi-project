import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Sprout, Activity, Download, RefreshCcw } from 'lucide-react';
import StatCard from './components/StatCard';
import TrendChart from './components/TrendChart';
import HistoryTable from './components/HistoryTable';
import FuzzyTable from './components/FuzzyTable';
import PumpStatus from './components/PumpStatus';
import IrrigationLogs from './components/IrrigationLogs';
import { useMqtt } from './lib/mqtt';
import { getHistory, getIrrigationLogs, getStats, getFuzzyDecisions, downloadHistoryUrl } from './lib/api';

function App() {
  const { isConnected, liveData, pumpStatus } = useMqtt();
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Activity className="text-accent-emerald animate-glow" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-br from-slate-50 to-slate-400 bg-clip-text text-transparent">
              ChiliSmart Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-lg">Monitoring Kelembapan & Suhu Real-time</p>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${isConnected ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-500/10 text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent-emerald animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'MQTT CONNECTED' : 'MQTT DISCONNECTED'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-white/5">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900/50 text-slate-300 text-sm px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-accent-emerald"
            />
            <span className="text-slate-500">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900/50 text-slate-300 text-sm px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-accent-emerald"
            />
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 h-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium border border-white/5"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a 
            href={downloadHistoryUrl}
            className="flex items-center justify-center gap-2 px-4 py-2 h-[38px] rounded-xl bg-accent-emerald hover:bg-emerald-600 text-white transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20"
          >
            <Download size={16} />
            Export
          </a>
        </div>
      </header>

      <main className="space-y-8">
        
        {/* Stats Summary Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-accent-emerald">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Rata-rata Suhu Hari Ini</p>
                <p className="text-xl font-bold text-slate-50">{Number(stats.averageToday?.avg_suhu || 0).toFixed(1)}°C</p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-accent-cyan">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Rata-rata Kelembapan</p>
                <p className="text-xl font-bold text-slate-50">{Number(stats.averageToday?.avg_hum || 0).toFixed(1)}%</p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-accent-emerald">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Rata-rata Tanah Basah</p>
                <p className="text-xl font-bold text-slate-50">{Number(stats.averageToday?.avg_soil || 0).toFixed(1)}%</p>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-accent-amber">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Penyiraman Hari Ini</p>
                <p className="text-xl font-bold text-slate-50">{stats.totalIrrigationToday || 0} kali</p>
              </div>
            </div>
          </div>
        )}
        {/* Top Section: Metrics & Pump Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Suhu Udara" 
              value={currentData.suhu} 
              unit="°C" 
              icon={Thermometer} 
              color="#f59e0b"
              trend={getTrend(currentData.suhu, prevData.suhu)}
            />
            <StatCard 
              title="Kelembapan Udara" 
              value={currentData.kelembapanUdara} 
              unit="%" 
              icon={Droplets} 
              color="#06b6d4"
              trend={getTrend(currentData.kelembapanUdara, prevData.kelembapanUdara)}
            />
            <StatCard 
              title="Kelembapan Tanah" 
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
    </div>
  );
}

export default App;

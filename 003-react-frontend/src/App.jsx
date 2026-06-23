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

  // Pagination states
  const [historyPage, setHistoryPage] = useState(1);
  const [fuzzyPage, setFuzzyPage] = useState(1);
  const [irrigationPage, setIrrigationPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [fuzzyTotalPages, setFuzzyTotalPages] = useState(1);
  const [irrigationTotalPages, setIrrigationTotalPages] = useState(1);
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
        getHistory(historyPage, 10, startDate, endDate),
        getIrrigationLogs(irrigationPage, 10),
        getStats(),
        getFuzzyDecisions(fuzzyPage, 10, startDate, endDate)
      ]);
      
      // Transform DB data to match chart format
      const formattedHistory = history.data.map(item => ({
        time: new Date(item.created_at).toLocaleTimeString('id-ID', { hour12: false }),
        suhu: item.suhu,
        kelembapanUdara: item.kelembapan_udara,
        kelembapanTanah: item.kelembapan_tanah
      })).reverse(); // Reverse if needed for chart, though backend already sorts DESC.

      setHistoryData(formattedHistory);
      setHistoryTotalPages(history.totalPages);
      
      setIrrigationLogs(logs.data);
      setIrrigationTotalPages(logs.totalPages);
      
      setStats(currentStats);
      
      setFuzzyDecisions(fuzzy.data);
      setFuzzyTotalPages(fuzzy.totalPages);
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
  }, [startDate, endDate, historyPage, fuzzyPage, irrigationPage]);

  // Reset pagination when date filter changes
  useEffect(() => {
    setHistoryPage(1);
    setFuzzyPage(1);
    setIrrigationPage(1);
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
    <div className="min-h-screen relative py-4 sm:py-8">
      {/* Main Glass Panel Container */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-8 relative z-20">
        <div className="glass-panel overflow-hidden flex flex-col min-h-[90vh] animate-fade-in">
          
          {/* Header Inside Panel */}
          <header className="bg-glass-header border-b border-divider px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-status-on-bg rounded-xl">
                  <Sprout className="text-status-on" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-text-heading leading-none">ChiliSmart</h1>
                  <p className="text-xs text-text-label mt-1">Dashboard & Monitoring</p>
                </div>
              </div>
              <div className="h-8 w-px bg-divider hidden sm:block mx-1"></div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold ${isConnected ? 'bg-status-on-bg text-status-on' : 'bg-status-off-bg text-status-off'}`}>
                <span className="relative flex h-2 w-2">
                  {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-on opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-status-on' : 'bg-status-off'}`}></span>
                </span>
                {isConnected ? 'System Online' : 'Offline'}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-2 glass-item p-1.5 px-3 min-w-[240px] flex-1 sm:flex-none">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-text-body text-sm focus:outline-none w-full [color-scheme:dark]"
                />
                <span className="text-text-dim">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-text-body text-sm focus:outline-none w-full [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} className="button-secondary-on-dark text-sm py-[9px] px-3 gap-2 shrink-0">
                  <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">Sync</span>
                </button>
                <a href={downloadHistoryUrl} className="button-primary text-sm py-[9px] px-4 gap-2 shrink-0">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </a>
              </div>
            </div>
          </header>

          {/* Body Inside Panel */}
          <div className="p-4 sm:p-8 flex-1">
            <div className="mb-8 border-b border-divider pb-4">
              <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="pb-8">
              {activeTab === 'monitoring' ? (
                <main className="space-y-8">
                
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Card 1: Suhu */}
                    <div className="glass-section p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber-soft rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-100 opacity-40"></div>
                      <div className="flex items-center gap-2 mb-2.5 relative z-10">
                        <Thermometer size={15} className="text-accent-amber drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                        <p className="text-[10px] sm:text-xs text-text-label uppercase tracking-widest font-semibold">Rata-Rata Suhu</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight relative z-10">
                        {Number(stats.averageToday?.avg_suhu || 0).toFixed(1)}<span className="text-sm sm:text-base text-text-dim font-medium ml-1">°C</span>
                      </p>
                    </div>

                    {/* Card 2: Kelembapan Udara */}
                    <div className="glass-section p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal-soft rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-100 opacity-40"></div>
                      <div className="flex items-center gap-2 mb-2.5 relative z-10">
                        <Droplets size={15} className="text-accent-teal drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]" />
                        <p className="text-[10px] sm:text-xs text-text-label uppercase tracking-widest font-semibold truncate">Kelembapan Udara</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight relative z-10">
                        {Number(stats.averageToday?.avg_hum || 0).toFixed(1)}<span className="text-sm sm:text-base text-text-dim font-medium ml-1">%</span>
                      </p>
                    </div>

                    {/* Card 3: Kelembapan Tanah */}
                    <div className="glass-section p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green-soft rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-100 opacity-40"></div>
                      <div className="flex items-center gap-2 mb-2.5 relative z-10">
                        <Sprout size={15} className="text-accent-green drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] sm:text-xs text-text-label uppercase tracking-widest font-semibold truncate">Kelembapan Tanah</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight relative z-10">
                        {Number(stats.averageToday?.avg_soil || 0).toFixed(1)}<span className="text-sm sm:text-base text-text-dim font-medium ml-1">%</span>
                      </p>
                    </div>

                    {/* Card 4: Total Penyiraman */}
                    <div className="glass-section p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple-soft rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-100 opacity-40"></div>
                      <div className="flex items-center gap-2 mb-2.5 relative z-10">
                        <Activity size={15} className="text-accent-purple drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]" />
                        <p className="text-[10px] sm:text-xs text-text-label uppercase tracking-widest font-semibold truncate">Total Penyiraman</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight relative z-10">
                        {stats.totalIrrigationToday || 0}<span className="text-sm sm:text-base text-text-dim font-medium ml-1.5">kali</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Suhu" 
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
                      color="#14b8a6"
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

                <section>
                  <TrendChart data={historyData} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <HistoryTable data={historyData} page={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} />
                    <FuzzyTable data={fuzzyDecisions} page={fuzzyPage} totalPages={fuzzyTotalPages} onPageChange={setFuzzyPage} />
                  </div>
                  <div className="lg:col-span-1">
                    <IrrigationLogs logs={irrigationLogs} page={irrigationPage} totalPages={irrigationTotalPages} onPageChange={setIrrigationPage} />
                  </div>
                </div>
              </main>
              ) : (
                <KpiPage startDate={startDate} endDate={endDate} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

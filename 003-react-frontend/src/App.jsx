import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Sprout, Activity } from 'lucide-react';
import StatCard from './components/StatCard';
import TrendChart from './components/TrendChart';
import HistoryTable from './components/HistoryTable';

function App() {
  const [data, setData] = useState([]);
  
  // Dummy data generator
  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 15 }).map((_, i) => ({
      time: new Date(Date.now() - (14 - i) * 5000).toLocaleTimeString('id-ID', { hour12: false }),
      suhu: +(28 + Math.random() * 5).toFixed(1),
      kelembapanUdara: +(60 + Math.random() * 15).toFixed(1),
      kelembapanTanah: +(45 + Math.random() * 20).toFixed(1)
    }));
    
    setData(initialData);

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        if (newData.length >= 50) newData.shift();
        
        const prev = newData[newData.length - 1];
        newData.push({
          time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
          suhu: +(prev.suhu + (Math.random() - 0.5) * 1.5).toFixed(1),
          kelembapanUdara: +(prev.kelembapanUdara + (Math.random() - 0.5) * 3).toFixed(1),
          kelembapanTanah: +(prev.kelembapanTanah + (Math.random() - 0.5) * 2).toFixed(1)
        });
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const latestData = data.length > 0 ? data[data.length - 1] : { suhu: 0, kelembapanUdara: 0, kelembapanTanah: 0 };
  const previousData = data.length > 1 ? data[data.length - 2] : latestData;

  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return +(((current - previous) / previous) * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <Activity className="text-accent-emerald animate-glow" size={40} />
          <h1 className="text-4xl font-bold bg-gradient-to-br from-slate-50 to-slate-400 bg-clip-text text-transparent">
            AgriSmart Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Monitoring Kelembapan & Suhu Real-time</p>
      </header>

      <main className="space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Suhu Udara" 
            value={latestData.suhu} 
            unit="°C" 
            icon={Thermometer} 
            color="#f59e0b"
            trend={getTrend(latestData.suhu, previousData.suhu)}
          />
          <StatCard 
            title="Kelembapan Udara" 
            value={latestData.kelembapanUdara} 
            unit="%" 
            icon={Droplets} 
            color="#06b6d4"
            trend={getTrend(latestData.kelembapanUdara, previousData.kelembapanUdara)}
          />
          <StatCard 
            title="Kelembapan Tanah" 
            value={latestData.kelembapanTanah} 
            unit="%" 
            icon={Sprout} 
            color="#10b981"
            trend={getTrend(latestData.kelembapanTanah, previousData.kelembapanTanah)}
          />
        </section>

        <section>
          <TrendChart data={data} />
        </section>

        <section>
          <HistoryTable data={data} />
        </section>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { getKpiData } from '../lib/api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Target, Activity, Droplets } from 'lucide-react';

const COLORS = ['#64748b', '#10b981', '#14b8a6', '#8b5cf6'];
const BRAND_PURPLE = '#8b5cf6';
const axisColor = "#94a3b8";
const gridColor = "rgba(255, 255, 255, 0.05)";

// Custom tooltip for glassmorphism
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-item px-4 py-3 shadow-xl backdrop-blur-md border border-[rgba(255,255,255,0.1)]">
        {label && <p className="text-text-label text-xs mb-2 border-b border-divider pb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-sm font-semibold text-text-heading">
              {entry.name}: {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Komponen KPI Card kecil yang reusable
function KpiCard({ title, value, subValue, icon: Icon, colorClass = "text-accent-purple", bgClass = "bg-accent-purple-soft border border-accent-purple-soft" }) {
  return (
    <div className="glass-section p-6 flex flex-col justify-between group overflow-hidden relative">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-text-label text-xs uppercase tracking-wider font-semibold">{title}</h3>
        <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass} shadow-inner`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-[28px] sm:text-[40px] font-bold text-text-heading leading-none mb-2 tracking-tight">
          {value}
        </div>
        {subValue && <div className="text-text-dim text-sm">{subValue}</div>}
      </div>
    </div>
  );
}

export default function KpiPage({ startDate, endDate }) {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpi = async () => {
      setLoading(true);
      try {
        const data = await getKpiData(startDate, endDate);
        setKpiData(data);
      } catch (err) {
        console.error("Error fetching KPI:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKpi();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
        <div className="text-text-label">Loading KPI Data...</div>
      </div>
    );
  }

  if (!kpiData) return null;

  // Transform Fuzzy Data for Pie Chart
  const pieData = kpiData.fuzzyDistribution.map(item => ({
    name: item.category,
    value: parseInt(item.count)
  }));

  // Hitung total penyiraman dari dailyIrrigation
  const totalIrrigationFreq = kpiData.dailyIrrigation.reduce((sum, item) => sum + parseInt(item.frequency), 0);
  const totalIrrigationDur = kpiData.dailyIrrigation.reduce((sum, item) => sum + parseFloat(item.total_duration), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Zona Ideal Tanah (40-70%)" 
          value={`${kpiData.idealZonePercentage.toFixed(1)}%`}
          subValue="Persentase waktu kelembapan tanah optimal"
          icon={Target}
          colorClass="text-accent-green drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          bgClass="bg-accent-green-soft border border-[rgba(16,185,129,0.2)]"
        />
        <KpiCard 
          title="Total Frekuensi Siram" 
          value={`${totalIrrigationFreq}x`}
          subValue="Kali pompa menyala pada rentang tanggal"
          icon={Activity}
          colorClass="text-accent-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          bgClass="bg-accent-amber-soft border border-[rgba(245,158,11,0.2)]"
        />
        <KpiCard 
          title="Estimasi Total Air" 
          value={`${(totalIrrigationDur / 100).toFixed(1)} L`} 
          subValue={`Dari total ${totalIrrigationDur.toFixed(0)} dtk durasi pompa`}
          icon={Droplets}
          colorClass="text-accent-teal drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]"
          bgClass="bg-accent-teal-soft border border-[rgba(20,184,166,0.2)]"
        />
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi Fuzzy */}
        <div className="glass-section p-6">
          <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
            Distribusi Keputusan Fuzzy Logic
          </h3>
          <div className="h-[220px] sm:h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}80)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-dim">Tidak ada data fuzzy logic</div>
            )}
          </div>
        </div>

        {/* Frekuensi Penyiraman Harian */}
        <div className="glass-section p-6">
          <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
            Penyiraman Harian
          </h3>
          <div className="h-[220px] sm:h-[300px]">
            {kpiData.dailyIrrigation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData.dailyIrrigation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisColor }} />
                  <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisColor }} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="frequency" 
                    name="Frekuensi (kali)" 
                    fill={BRAND_PURPLE} 
                    radius={[6, 6, 6, 6]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-dim">Tidak ada log penyiraman</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Chart: Rata-rata Harian */}
      <div className="glass-section p-6">
        <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
          Tren Rata-rata Lingkungan Harian
        </h3>
        <div className="h-[250px] sm:h-[400px]">
          {kpiData.dailyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiData.dailyAverages} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSuhuAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHumAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSoilAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisColor }} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: axisColor }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '1.5rem', color: '#94a3b8' }} iconType="circle" />
                <Area type="monotone" name="Suhu (°C)" dataKey="avg_suhu" stroke="#f59e0b" strokeWidth={2} fill="url(#colorSuhuAvg)" activeDot={{r:6}} style={{ filter: `drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))` }} />
                <Area type="monotone" name="Kelembapan Udara (%)" dataKey="avg_hum" stroke="#14b8a6" strokeWidth={2} fill="url(#colorHumAvg)" activeDot={{r:6}} style={{ filter: `drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))` }} />
                <Area type="monotone" name="Kelembapan Tanah (%)" dataKey="avg_soil" stroke="#10b981" strokeWidth={2} fill="url(#colorSoilAvg)" activeDot={{r:6}} style={{ filter: `drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))` }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-text-dim">Tidak ada data rata-rata harian</div>
          )}
        </div>
      </div>

    </div>
  );
}

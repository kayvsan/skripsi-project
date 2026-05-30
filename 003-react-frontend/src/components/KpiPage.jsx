import React, { useState, useEffect } from 'react';
import { getKpiData } from '../lib/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Target, Activity, Droplets } from 'lucide-react';

const COLORS = ['#94a3b8', '#10b981', '#06b6d4', '#4d0dd9'];
const BRAND_PURPLE = '#4d0dd9';

// Komponen KPI Card kecil yang reusable
function KpiCard({ title, value, subValue, icon: Icon, colorClass = "text-brand", bgClass = "bg-brand/10" }) {
  return (
    <div className="kpi-panel p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-text-secondary font-rubik text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className="text-[48px] font-bold text-text-primary font-rubik leading-none mb-2">
          {value}
        </div>
        {subValue && <div className="text-text-secondary text-sm font-rubik">{subValue}</div>}
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
    return <div className="flex justify-center items-center h-64 text-white">Loading KPI Data...</div>;
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
          colorClass="text-accent-emerald"
          bgClass="bg-accent-emerald/10"
        />
        <KpiCard 
          title="Total Frekuensi Siram" 
          value={`${totalIrrigationFreq}x`}
          subValue="Kali pompa menyala pada rentang tanggal"
          icon={Activity}
          colorClass="text-accent-amber"
          bgClass="bg-accent-amber/10"
        />
        <KpiCard 
          title="Estimasi Total Air" 
          value={`${(totalIrrigationDur / 100).toFixed(1)} L`} // Asumsi kasar: 100% durasi = 100 unit air, sesuaikan nanti
          subValue={`Dari total ${totalIrrigationDur.toFixed(0)} durasi pompa`}
          icon={Droplets}
          colorClass="text-accent-cyan"
          bgClass="bg-accent-cyan/10"
        />
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi Fuzzy */}
        <div className="kpi-panel p-6">
          <h3 className="text-text-secondary font-rubik text-sm font-semibold uppercase tracking-wider mb-6">Distribusi Keputusan Fuzzy Logic</h3>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-base, #ffffff)', 
                      borderColor: 'var(--border-default, #e4e4e7)',
                      color: 'var(--text-primary, #020817)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-custom)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-secondary">Tidak ada data fuzzy logic</div>
            )}
          </div>
        </div>

        {/* Frekuensi Penyiraman Harian */}
        <div className="kpi-panel p-6">
          <h3 className="text-text-secondary font-rubik text-sm font-semibold uppercase tracking-wider mb-6">Penyiraman Harian</h3>
          <div className="h-[300px]">
            {kpiData.dailyIrrigation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData.dailyIrrigation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'var(--border-default)'}}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-base, #ffffff)', 
                      borderColor: 'var(--border-default, #e4e4e7)',
                      color: 'var(--text-primary, #020817)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-custom)'
                    }}
                  />
                  <Bar dataKey="frequency" name="Frekuensi (kali)" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-secondary">Tidak ada log penyiraman</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Chart: Rata-rata Harian */}
      <div className="kpi-panel p-6">
        <h3 className="text-text-secondary font-rubik text-sm font-semibold uppercase tracking-wider mb-6">Tren Rata-rata Lingkungan Harian</h3>
        <div className="h-[400px]">
          {kpiData.dailyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiData.dailyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-base, #ffffff)', 
                    borderColor: 'var(--border-default, #e4e4e7)',
                    color: 'var(--text-primary, #020817)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-custom)'
                  }}
                />
                <Legend />
                <Line type="monotone" name="Suhu (°C)" dataKey="avg_suhu" stroke="#f59e0b" strokeWidth={3} dot={{r:4}} />
                <Line type="monotone" name="Kelembapan Udara (%)" dataKey="avg_hum" stroke="#06b6d4" strokeWidth={3} dot={{r:4}} />
                <Line type="monotone" name="Kelembapan Tanah (%)" dataKey="avg_soil" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[#435270]">Tidak ada data rata-rata harian</div>
          )}
        </div>
      </div>

    </div>
  );
}

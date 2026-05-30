import React, { useState, useEffect } from 'react';
import { getKpiData } from '../lib/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Target, Activity, Droplets } from 'lucide-react';

const COLORS = ['#94a3b8', '#10b981', '#14b8a6', '#4d0dd9'];
const BRAND_PURPLE = '#4d0dd9';
const axisColor = "#94a3b8";
const gridColor = "#f4f4f5";

// Komponen KPI Card kecil yang reusable
function KpiCard({ title, value, subValue, icon: Icon, colorClass = "text-primary", bgClass = "bg-tint-lavender" }) {
  return (
    <div className="card-base p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold">{title}</h3>
        <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className="text-[40px] font-bold text-ink leading-none mb-2 tracking-tight">
          {value}
        </div>
        {subValue && <div className="text-slate text-sm">{subValue}</div>}
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
    return <div className="flex justify-center items-center h-64 text-ink">Loading KPI Data...</div>;
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
          colorClass="text-brand-green"
          bgClass="bg-tint-mint"
        />
        <KpiCard 
          title="Total Frekuensi Siram" 
          value={`${totalIrrigationFreq}x`}
          subValue="Kali pompa menyala pada rentang tanggal"
          icon={Activity}
          colorClass="text-brand-orange"
          bgClass="bg-tint-peach"
        />
        <KpiCard 
          title="Estimasi Total Air" 
          value={`${(totalIrrigationDur / 100).toFixed(1)} L`} 
          subValue={`Dari total ${totalIrrigationDur.toFixed(0)} durasi pompa`}
          icon={Droplets}
          colorClass="text-brand-teal"
          bgClass="bg-tint-sky"
        />
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribusi Fuzzy */}
        <div className="card-base p-6">
          <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
            Distribusi Keputusan Fuzzy Logic
          </h3>
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
                      backgroundColor: '#ffffff', 
                      borderColor: '#e4e4e7',
                      color: '#111827',
                      borderRadius: '8px',
                      boxShadow: 'rgba(15, 15, 15, 0.08) 0px 4px 12px 0px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate">Tidak ada data fuzzy logic</div>
            )}
          </div>
        </div>

        {/* Frekuensi Penyiraman Harian */}
        <div className="card-base p-6">
          <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
            Penyiraman Harian
          </h3>
          <div className="h-[300px]">
            {kpiData.dailyIrrigation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData.dailyIrrigation}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f4f4f5'}}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e4e4e7',
                      color: '#111827',
                      borderRadius: '8px',
                      boxShadow: 'rgba(15, 15, 15, 0.08) 0px 4px 12px 0px'
                    }}
                  />
                  <Bar dataKey="frequency" name="Frekuensi (kali)" fill={BRAND_PURPLE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate">Tidak ada log penyiraman</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Chart: Rata-rata Harian */}
      <div className="card-base p-6">
        <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-6 flex items-center gap-2">
          Tren Rata-rata Lingkungan Harian
        </h3>
        <div className="h-[400px]">
          {kpiData.dailyAverages.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiData.dailyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e4e4e7',
                    color: '#111827',
                    borderRadius: '8px',
                    boxShadow: 'rgba(15, 15, 15, 0.08) 0px 4px 12px 0px'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '1.5rem' }} />
                <Line type="monotone" name="Suhu (°C)" dataKey="avg_suhu" stroke="#f97316" strokeWidth={2} dot={{r:4}} />
                <Line type="monotone" name="Kelembapan Udara (%)" dataKey="avg_hum" stroke="#14b8a6" strokeWidth={2} dot={{r:4}} />
                <Line type="monotone" name="Kelembapan Tanah (%)" dataKey="avg_soil" stroke="#10b981" strokeWidth={2} dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate">Tidak ada data rata-rata harian</div>
          )}
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

export default function TrendChart({ data }) {
  // Using translucent colors matching the Lifestats style
  const axisColor = "#94a3b8";
  const gridColor = "rgba(255, 255, 255, 0.05)";
  
  // Custom tooltips to match glass theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-item px-4 py-3 shadow-xl backdrop-blur-md border border-[rgba(255,255,255,0.1)]">
          <p className="text-text-label text-xs mb-2 border-b border-divider pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-semibold text-text-heading">
                {entry.value} <span className="text-xs font-normal text-text-label">{entry.name === 'Suhu' ? '°C' : '%'}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-section p-6">
      <div className="flex items-center gap-2 mb-6">
        <LineChartIcon className="text-text-label" size={20} />
        <h2 className="text-lg font-semibold text-text-heading">Real-time Trends</h2>
      </div>
      <div className="h-[250px] sm:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSuhu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tick={{ fill: axisColor }}
            />
            <YAxis 
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: axisColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '1.5rem', color: '#94a3b8' }} iconType="circle" />
            
            <Area 
              type="monotone" 
              name="Suhu"
              dataKey="suhu" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSuhu)"
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))` }}
            />
            <Area 
              type="monotone" 
              name="Kelembapan Udara"
              dataKey="kelembapanUdara" 
              stroke="#14b8a6" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHum)"
              activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0 0 6px rgba(20, 184, 166, 0.5))` }}
            />
            <Area 
              type="monotone" 
              name="Kelembapan Tanah"
              dataKey="kelembapanTanah" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSoil)"
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

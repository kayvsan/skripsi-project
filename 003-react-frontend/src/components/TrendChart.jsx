import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

export default function TrendChart({ data }) {
  // Use CSS variables for chart colors to support dark/light mode
  const axisColor = "var(--text-tertiary, #435270)";
  const gridColor = "var(--border-default, #e4e4e7)";

  return (
    <div className="kpi-panel p-6">
      <div className="flex items-center gap-2 mb-6">
        <LineChartIcon className="text-brand" size={20} />
        <h2 className="text-lg font-semibold text-text-primary">Tren Real-time</h2>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface-base, #ffffff)', 
                borderColor: 'var(--border-default, #e4e4e7)',
                color: 'var(--text-primary, #020817)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-custom)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '1.5rem' }} />
            <Line 
              type="monotone" 
              name="Suhu (°C)"
              dataKey="suhu" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              name="Kelembapan Udara (%)"
              dataKey="kelembapanUdara" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              name="Kelembapan Tanah (%)"
              dataKey="kelembapanTanah" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendChart({ data }) {
  return (
    <div className="glass-panel p-6 h-[450px] mb-8">
      <h3 className="text-slate-50 text-xl font-semibold mb-6">
        Grafik Tren Real-time
      </h3>
      <div className="w-full h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(8px)',
                color: '#f8fafc'
              }}
              itemStyle={{ color: '#f8fafc' }}
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

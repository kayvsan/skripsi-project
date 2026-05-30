import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

export default function TrendChart({ data }) {
  const axisColor = "#94a3b8"; // steel
  const gridColor = "#f4f4f5"; // hairline-soft

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 mb-6">
        <LineChartIcon className="text-slate" size={20} />
        <h2 className="text-lg font-semibold text-ink">Tren Real-time</h2>
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
                backgroundColor: '#ffffff', 
                borderColor: '#e4e4e7',
                color: '#111827',
                borderRadius: '8px',
                boxShadow: 'rgba(15, 15, 15, 0.08) 0px 4px 12px 0px'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '1.5rem' }} />
            <Line 
              type="monotone" 
              name="Suhu (°C)"
              dataKey="suhu" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              name="Kelembapan Udara (%)"
              dataKey="kelembapanUdara" 
              stroke="#14b8a6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              name="Kelembapan Tanah (%)"
              dataKey="kelembapanTanah" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

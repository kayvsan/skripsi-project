import React from 'react';

export default function HistoryTable({ data }) {
  const reversedData = [...data].reverse();

  return (
    <div className="glass-panel p-6 overflow-hidden">
      <h3 className="text-slate-50 text-xl font-semibold mb-6">
        Riwayat Data Sensor
      </h3>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <tr>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Waktu</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Suhu</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Kelembapan Udara</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Kelembapan Tanah</th>
            </tr>
          </thead>
          <tbody>
            {reversedData.map((row, index) => (
              <tr 
                key={index} 
                className={`
                  transition-colors duration-200 hover:bg-white/5
                  ${index !== reversedData.length - 1 ? 'border-b border-white/5' : ''}
                `}
              >
                <td className="p-4 text-slate-50">{row.time}</td>
                <td className="p-4 text-accent-amber font-medium">{row.suhu}°C</td>
                <td className="p-4 text-accent-cyan font-medium">{row.kelembapanUdara}%</td>
                <td className="p-4 text-accent-emerald font-medium">{row.kelembapanTanah}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

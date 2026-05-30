import React from 'react';
import { Clock } from 'lucide-react';

export default function HistoryTable({ data }) {
  return (
    <div className="kpi-panel p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-brand" size={20} />
        <h2 className="text-lg font-semibold text-text-primary">Riwayat Sensor</h2>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface/90 backdrop-blur z-10 shadow-sm border-b border-border-default">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Waktu</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Suhu</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Hum (Udara)</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Moist (Tanah)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-text-secondary/5 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-text-primary whitespace-nowrap">{item.time}</td>
                  <td className="py-3 px-4 text-sm text-accent-amber">
                    <span className="bg-accent-amber/10 px-2 py-1 rounded-md">{Number(item.suhu).toFixed(1)}°C</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-accent-cyan">
                    <span className="bg-accent-cyan/10 px-2 py-1 rounded-md">{Number(item.kelembapanUdara).toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-accent-emerald">
                    <span className="bg-accent-emerald/10 px-2 py-1 rounded-md">{Number(item.kelembapanTanah).toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

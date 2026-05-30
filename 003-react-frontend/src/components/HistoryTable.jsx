import React from 'react';
import { Clock } from 'lucide-react';

export default function HistoryTable({ data }) {
  return (
    <div className="card-base p-6 mb-6">
      <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
        <Clock size={18} />
        Riwayat Sensor (50 Data Terakhir)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left comparison-table text-sm">
          <thead className="bg-surface border-b border-hairline">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate">Waktu</th>
              <th className="px-4 py-3 font-semibold text-slate">Suhu Udara</th>
              <th className="px-4 py-3 font-semibold text-slate">Kelembapan Udara</th>
              <th className="px-4 py-3 font-semibold text-slate">Kelembapan Tanah</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-b border-hairline-soft hover:bg-surface-soft transition-colors">
                <td className="px-4 py-3 text-ink font-medium">{row.time}</td>
                <td className="px-4 py-3 text-ink">{Number(row.suhu).toFixed(1)}°C</td>
                <td className="px-4 py-3 text-ink">{Number(row.kelembapanUdara).toFixed(1)}%</td>
                <td className="px-4 py-3 text-ink">{Number(row.kelembapanTanah).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

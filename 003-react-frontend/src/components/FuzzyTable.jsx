import React from 'react';
import { Activity } from 'lucide-react';

export default function FuzzyTable({ data }) {
  return (
    <div className="kpi-panel p-6 h-full flex flex-col mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-brand" size={20} />
        <h2 className="text-lg font-semibold text-text-primary">Riwayat Keputusan Fuzzy Logic</h2>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface/90 backdrop-blur z-10 shadow-sm border-b border-border-default">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Waktu</th>
              <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Suhu</th>
              <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Udara</th>
              <th className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tanah</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand uppercase tracking-wider">Output Durasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-text-secondary">Belum ada data keputusan fuzzy</td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={i} className="hover:bg-text-secondary/5 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-text-primary whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{item.suhu_val}°C</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{item.kelembapan_udara_val}%</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{item.kelembapan_tanah_val}%</td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    <span className="bg-brand/20 text-brand px-2 py-1 rounded-md border border-brand/30">
                      {Number(item.output_durasi).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

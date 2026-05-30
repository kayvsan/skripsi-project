import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function FuzzyTable({ data }) {
  const getCategoryColor = (category) => {
    switch(category) {
      case 'TIDAK PERLU': return 'bg-tint-gray text-charcoal';
      case 'SEDIKIT': return 'bg-tint-sky text-charcoal';
      case 'SEDANG': return 'bg-tint-mint text-charcoal';
      case 'BANYAK': return 'bg-tint-lavender text-charcoal';
      default: return 'bg-surface text-slate';
    }
  };

  return (
    <div className="card-base p-6 mb-6">
      <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
        <BrainCircuit size={18} />
        Log Keputusan Fuzzy Logic
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left comparison-table text-sm">
          <thead className="bg-surface border-b border-hairline">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate">Waktu</th>
              <th className="px-4 py-3 font-semibold text-slate">Suhu Input</th>
              <th className="px-4 py-3 font-semibold text-slate">Tanah Input</th>
              <th className="px-4 py-3 font-semibold text-slate">Durasi (s)</th>
              <th className="px-4 py-3 font-semibold text-slate">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-b border-hairline-soft hover:bg-surface-soft transition-colors">
                <td className="px-4 py-3 text-ink font-medium">{new Date(row.created_at).toLocaleTimeString('id-ID')}</td>
                <td className="px-4 py-3 text-ink">{row.suhu}°C</td>
                <td className="px-4 py-3 text-ink">{row.kelembapan_tanah}%</td>
                <td className="px-4 py-3 text-ink">{row.duration}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold ${getCategoryColor(row.category)}`}>
                    {row.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

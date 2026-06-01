import React from 'react';
import { BrainCircuit, Droplets } from 'lucide-react';

export default function FuzzyTable({ data }) {
  const getCategoryColor = (category) => {
    switch(category) {
      case 'TIDAK PERLU': return 'bg-tint-gray text-charcoal';
      case 'SEDIKIT': return 'bg-tint-sky text-brand-teal';
      case 'SEDANG': return 'bg-tint-mint text-brand-green';
      case 'BANYAK': return 'bg-tint-lavender text-primary';
      default: return 'bg-surface text-slate';
    }
  };

  const getCategoryText = (durasi) => {
    const d = Number(durasi);
    if (!d || d <= 20) return 'TIDAK PERLU';
    if (d <= 45) return 'SEDIKIT';
    if (d <= 70) return 'SEDANG';
    return 'BANYAK';
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
                <td className="px-4 py-3 text-ink">{row.suhu_val !== undefined ? Number(row.suhu_val).toFixed(1) : '-'}°C</td>
                <td className="px-4 py-3 text-ink">{row.kelembapan_tanah_val !== undefined ? Number(row.kelembapan_tanah_val).toFixed(1) : '-'}%</td>
                <td className="px-4 py-3 text-ink">
                  {row.output_durasi !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{((Number(row.output_durasi) / 100) * 120).toFixed(1)} detik</span>
                      {Number(row.output_durasi) > 0 && <Droplets size={14} className="text-brand-teal" />}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold ${getCategoryColor(row.category || getCategoryText(row.output_durasi))}`}>
                    {row.category || getCategoryText(row.output_durasi)}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate">Tidak ada data keputusan fuzzy</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

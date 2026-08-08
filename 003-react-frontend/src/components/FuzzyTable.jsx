import React from 'react';
import { BrainCircuit, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FuzzyTable({ data, page, totalPages, onPageChange }) {
  const getCategoryColor = (category) => {
    const cat = category ? category.toUpperCase() : '';
    switch(cat) {
      case 'SINGKAT': return 'bg-accent-teal-soft text-accent-teal';
      case 'SEDANG': return 'bg-accent-green-soft text-accent-green';
      case 'LAMA': return 'bg-accent-purple-soft text-accent-purple';
      default: return 'bg-glass-item text-text-label';
    }
  };

  const getCategoryText = (durasi) => {
    const d = Number(durasi);
    if (!d || d <= 25) return 'SINGKAT';
    if (d <= 45) return 'SEDANG';
    return 'LAMA';
  };

  return (
    <div className="glass-section p-6 mb-6">
      <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
        <BrainCircuit size={18} />
        Log Keputusan Fuzzy Logic
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-divider">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-label">Waktu</th>
              <th className="px-4 py-3 font-semibold text-text-label">Suhu Input</th>
              <th className="px-4 py-3 font-semibold text-text-label">Tanah Input</th>
              <th className="px-4 py-3 font-semibold text-text-label">Durasi (s)</th>
              <th className="px-4 py-3 font-semibold text-text-label">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <td className="px-4 py-3 text-text-heading font-medium">{new Date(row.created_at).toLocaleTimeString('id-ID')}</td>
                <td className="px-4 py-3 text-text-body">{row.suhu_val !== undefined ? Number(row.suhu_val).toFixed(1) : '-'}°C</td>
                <td className="px-4 py-3 text-text-body">{row.kelembapan_tanah_val !== undefined ? Number(row.kelembapan_tanah_val).toFixed(1) : '-'}%</td>
                <td className="px-4 py-3 text-text-body">
                  {row.output_durasi !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-heading">{Number(row.output_durasi).toFixed(1)} detik</span>
                      {Number(row.output_durasi) > 0 && <Droplets size={14} className="text-accent-teal" />}
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
                <td colSpan="5" className="px-4 py-8 text-center text-text-dim">Tidak ada data keputusan fuzzy</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-divider">
          <button 
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs font-semibold text-text-label hover:text-text-heading disabled:opacity-30 disabled:hover:text-text-label transition-colors"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="text-xs font-medium text-text-dim">
            Hal {page} dari {totalPages}
          </span>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-semibold text-text-label hover:text-text-heading disabled:opacity-30 disabled:hover:text-text-label transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

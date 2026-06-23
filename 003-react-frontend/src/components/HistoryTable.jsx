import React from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryTable({ data, page, totalPages, onPageChange }) {
  return (
    <div className="glass-section p-6 mb-6">
      <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
        <Clock size={18} />
        Riwayat Sensor
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-divider">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-label">Waktu</th>
              <th className="px-4 py-3 font-semibold text-text-label">Suhu Udara</th>
              <th className="px-4 py-3 font-semibold text-text-label">Kelembapan Udara</th>
              <th className="px-4 py-3 font-semibold text-text-label">Kelembapan Tanah</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <td className="px-4 py-3 text-text-heading font-medium">{row.time}</td>
                <td className="px-4 py-3 text-text-body">{Number(row.suhu).toFixed(1)}°C</td>
                <td className="px-4 py-3 text-text-body">{Number(row.kelembapanUdara).toFixed(1)}%</td>
                <td className="px-4 py-3 text-text-body">{Number(row.kelembapanTanah).toFixed(1)}%</td>
              </tr>
            ))}
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

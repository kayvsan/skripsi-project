import React from 'react';
import { Droplet, ChevronLeft, ChevronRight } from 'lucide-react';

export default function IrrigationLogs({ logs, page, totalPages, onPageChange }) {
  return (
    <div className="card-base p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
          <Droplet size={18} />
          Log Penyiraman
        </h3>
        
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={idx} className="bg-surface p-3 rounded-md border border-hairline flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-ink">{new Date(log.created_at).toLocaleTimeString('id-ID')}</p>
                <p className="text-xs text-slate">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{((Number(log.durasi) / 100) * 120).toFixed(1)} dtk</p>
                <p className="text-xs text-slate">Air dialirkan</p>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <p className="text-slate text-sm text-center py-4">Belum ada penyiraman hari ini.</p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-hairline">
          <button 
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs font-semibold text-slate hover:text-ink disabled:opacity-30 disabled:hover:text-slate transition-colors"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="text-xs font-medium text-slate">
            Hal {page} dari {totalPages}
          </span>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-semibold text-slate hover:text-ink disabled:opacity-30 disabled:hover:text-slate transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

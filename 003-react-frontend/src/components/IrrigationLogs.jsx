import React from 'react';
import { Droplet, ChevronLeft, ChevronRight } from 'lucide-react';

export default function IrrigationLogs({ logs, page, totalPages, onPageChange }) {
  return (
    <div className="glass-section p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-text-label text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
          <Droplet size={18} />
          Log Penyiraman
        </h3>
        
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={idx} className="glass-item p-3.5 flex justify-between items-center group hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <div>
                <p className="text-sm font-semibold text-text-heading">{new Date(log.created_at).toLocaleTimeString('id-ID')}</p>
                <p className="text-xs text-text-dim mt-0.5">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-accent-purple drop-shadow-[0_0_4px_rgba(139,92,246,0.4)]">{Number(log.durasi).toFixed(1)} dtk</p>
                <p className="text-xs text-text-dim mt-0.5">Air dialirkan</p>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <p className="text-text-dim text-sm text-center py-4">Belum ada penyiraman hari ini.</p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-divider">
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

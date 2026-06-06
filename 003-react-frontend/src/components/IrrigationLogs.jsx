import React, { useState } from 'react';
import { Droplet, ChevronLeft, ChevronRight } from 'lucide-react';

export default function IrrigationLogs({ logs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const currentLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="card-base p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-slate text-[13px] uppercase tracking-wider font-semibold mb-4 flex items-center gap-2">
          <Droplet size={18} />
          Log Penyiraman
        </h3>
        
        <div className="space-y-3">
          {currentLogs.map((log, idx) => (
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
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-xs font-semibold text-slate hover:text-ink disabled:opacity-30 disabled:hover:text-slate transition-colors"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="text-xs font-medium text-slate">
            Hal {currentPage} dari {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
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

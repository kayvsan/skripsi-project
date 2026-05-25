import React from 'react';
import { Clock, Droplet } from 'lucide-react';

export default function IrrigationLogs({ logs }) {
  return (
    <div className="glass-panel p-6 h-full">
      <h3 className="text-slate-50 text-xl font-semibold mb-6">Log Penyiraman</h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Belum ada data penyiraman</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald">
                  <Droplet size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-200 text-sm font-medium">Penyiraman Otomatis</span>
                  <span className="text-slate-500 text-xs">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="text-accent-emerald font-semibold text-sm">
                {log.durasi.toFixed(1)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

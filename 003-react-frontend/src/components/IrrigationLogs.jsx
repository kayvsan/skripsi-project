import React from 'react';
import { Clock, Droplet, Droplets } from 'lucide-react';

export default function IrrigationLogs({ logs }) {
  return (
    <div className="kpi-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="text-brand" size={20} />
          <h2 className="text-lg font-semibold text-text-primary">Log Penyiraman</h2>
        </div>
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-text-secondary text-center py-4">Belum ada data penyiraman</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-default hover:border-brand/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand/10 text-brand">
                  <Droplet size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-text-primary text-sm font-medium">Penyiraman Otomatis</span>
                  <span className="text-text-secondary text-xs">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="text-brand font-semibold text-sm">
                {log.durasi.toFixed(1)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

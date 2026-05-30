import React from 'react';

export default function FuzzyTable({ data }) {
  return (
    <div className="glass-panel p-6 overflow-hidden mt-6">
      <h3 className="text-slate-50 text-xl font-semibold mb-6">
        Log Keputusan Fuzzy Logic
      </h3>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <tr>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Waktu</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Input Suhu</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Input Kelembapan</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Input Tanah</th>
              <th className="p-4 text-slate-400 font-medium border-bottom border-white/10">Output (Durasi Pompa)</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">Belum ada data keputusan fuzzy</td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={index} 
                  className={`
                    transition-colors duration-200 hover:bg-white/5
                    ${index !== data.length - 1 ? 'border-b border-white/5' : ''}
                  `}
                >
                  <td className="p-4 text-slate-50">{new Date(row.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-accent-amber font-medium">{row.suhu_val}°C</td>
                  <td className="p-4 text-accent-cyan font-medium">{row.kelembapan_udara_val}%</td>
                  <td className="p-4 text-accent-emerald font-medium">{row.kelembapan_tanah_val}%</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-accent-emerald/20 text-accent-emerald rounded-full font-bold text-sm">
                      {Number(row.output_durasi).toFixed(1)}%
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

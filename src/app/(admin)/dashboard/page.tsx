import React from 'react';
import TableGrid from '@/features/tables/components/TableGrid';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <span>Masa Yönetimi</span>
          </h2>
          <p className="text-zinc-400 mt-1 max-w-lg text-sm md:text-base">
            Rezerve edilen, boş ve kullanımda olan masaları anlık olarak takip edin.
          </p>
        </div>
        
        {/* Quick Stats/Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['Tümü (12)', 'Boş (8)', 'Dolu (4)', 'Rezerve (0)'].map((tab, idx) => (
            <button 
              key={tab} 
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${idx === 0 ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10 hover:border-white/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <TableGrid />
    </div>
  );
}

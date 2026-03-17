'use client';

import React from 'react';
import { Play, Square, CalendarClock, MoreHorizontal, Wrench } from 'lucide-react';
import LiveTimer from './LiveTimer';

export interface TableSession {
  id: string;
  startedAt: string;
  hourlyRateAtTime: number | null;
}

export interface TableResource {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'reserved' | 'maintenance';
  hourlyRate: number;
  currentSession?: TableSession | null;
}

interface TableCardProps {
  table: TableResource;
  onOpenTable: (id: string) => void;
  onCloseTable: (id: string) => void;
}

export default function TableCard({ table, onOpenTable, onCloseTable }: TableCardProps) {
  const stateConfig = {
    'available': {
      indicatorGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
      indicatorColor: 'bg-emerald-500',
      borderClasses: 'hover:border-emerald-500/50 hover:bg-black/80',
      badgeClasses: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconStyle: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
      badgeLabel: 'Müsait',
      Icon: Play,
    },
    'in-use': {
      indicatorGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
      indicatorColor: 'bg-red-500',
      borderClasses: 'border-red-500/30 hover:border-red-500/50 bg-black/80',
      badgeClasses: 'bg-red-500/10 text-red-400 border-red-500/20',
      iconStyle: 'bg-red-500/10 text-red-400',
      badgeLabel: 'Dolu',
      Icon: Square,
    },
    'reserved': {
      indicatorGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
      indicatorColor: 'bg-amber-500',
      borderClasses: 'border-amber-500/30 hover:border-amber-500/50',
      badgeClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconStyle: 'bg-amber-500/10 text-amber-400',
      badgeLabel: 'Rezerve',
      Icon: CalendarClock,
    },
    'maintenance': {
      indicatorGlow: '',
      indicatorColor: 'bg-zinc-500',
      borderClasses: 'opacity-50 border-white/5',
      badgeClasses: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      iconStyle: 'bg-zinc-500/10 text-zinc-400',
      badgeLabel: 'Bakımda',
      Icon: Wrench,
    }
  };

  const config = stateConfig[table.status];
  const hasSession = table.status === 'in-use' && table.currentSession;
  const sessionRate = table.currentSession?.hourlyRateAtTime || table.hourlyRate;

  return (
    <div className={`table-card group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 transition-all duration-300 cursor-pointer shadow-xl ${config.borderClasses}`}>
      
      {/* Top Status Glow Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 w-full ${config.indicatorColor} ${config.indicatorGlow}`} />

      {/* Header section */}
      <div className="flex flex-row items-start justify-between p-5 pb-0">
        <div className="space-y-1">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            {table.name}
            <div className={`h-2 w-2 rounded-full ${config.indicatorColor} ${config.indicatorGlow}`} />
          </h3>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            {table.type}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border ${config.badgeClasses}`}>
          {config.badgeLabel}
        </div>
      </div>

      {/* Content section — Canlı Kronometre veya Ücret Bilgisi */}
      <div className="flex items-end justify-between p-5 pt-4 flex-1">
        <div className="space-y-1">
          {hasSession ? (
            /* CANLI KRONOMETREnin + TUTAR */
            <LiveTimer
              startedAt={table.currentSession!.startedAt}
              hourlyRate={sessionRate}
            />
          ) : (
            /* Müsait masa — saatlik ücret göster */
            <>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saatlik Ücret</p>
              <p className="text-2xl font-mono tracking-tight font-medium text-white">
                ₺{table.hourlyRate.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </>
          )}
        </div>
        
        <div className={`p-4 rounded-full transition-transform duration-300 ${table.status !== 'maintenance' ? 'group-hover:scale-110' : ''} ${config.iconStyle}`}>
           <config.Icon className="size-6" />
        </div>
      </div>

      {/* Footer / Actions layer */}
      <div className="p-5 pt-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
        {table.status === 'available' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenTable(table.id); }} 
            className="w-full relative overflow-hidden group/btn font-bold py-3 px-4 rounded-xl text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
          >
            Masayı Başlat
          </button>
        ) : table.status === 'in-use' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onCloseTable(table.id); }} 
            className="w-full relative py-3 px-4 rounded-xl font-bold text-white bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]"
          >
            Hesabı Kapat
          </button>
        ) : (
          <button disabled className="w-full py-3 px-4 rounded-xl font-semibold text-zinc-500 bg-white/5 border border-white/5 cursor-not-allowed">
            {table.status === 'reserved' ? 'Rezerve Edilmiş' : 'Bakımda'}
          </button>
        )}
      </div>
    </div>
  );
}

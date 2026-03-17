'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableCard, { TableResource } from './TableCard';
import ReceiptModal from './ReceiptModal';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

type FilterType = 'all' | 'available' | 'in-use' | 'reserved';

interface ReceiptData {
  sessionId: string;
  tableName: string;
  tableType: string;
  startedAt: string | Date;
  endedAt: string | Date;
  durationMinutes: number;
  hourlyRate: number;
  totalPrice: number;
  minimumApplied: boolean;
}

export default function TableGrid() {
  const [tables, setTables] = useState<TableResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const { showToast } = useToast();

  // Fetch tables from API
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        if (data.tables) {
          setTables(data.tables);
        }
      } else if (res.status === 401 || res.status === 403) {
        showToast('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.', 'error');
      }
    } catch (err) {
      showToast('Masalar yüklenirken bağlantı hatası oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTables();

    // Real-time synchronization (SSE via PostgreSQL LISTEN/NOTIFY)
    const eventSource = new EventSource('/api/tables/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.tableId && payload?.status) {
          setTables((prev) => 
            prev.map(t => t.id === payload.tableId ? { ...t, status: payload.status } : t)
          );
        }
      } catch (err) { }
    };

    // Auto-refresh her 30 saniyede (session verilerini güncel tutmak için)
    const refreshInterval = setInterval(fetchTables, 30000);

    return () => {
      eventSource.close();
      clearInterval(refreshInterval);
    };
  }, [fetchTables]);

  const handleOpenTable = async (id: string) => {
    try {
      // Optimistic update
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'in-use' as const } : t));
      
      const res = await fetch('/api/admin/tables/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id })
      });

      if (res.ok) {
        const data = await res.json();
        // Session bilgisini tabloya ekle
        setTables(prev => prev.map(t => 
          t.id === id 
            ? { ...t, status: 'in-use' as const, currentSession: data.session }
            : t
        ));
        const tableName = tables.find(t => t.id === id)?.name || 'Masa';
        showToast(`${tableName} başlatıldı ✓`, 'success');
      } else {
        const error = await res.json();
        showToast(error.error || 'Masa başlatılamadı', 'error');
        // Revert
        fetchTables();
      }
    } catch (err) {
      showToast('Bağlantı hatası', 'error');
      fetchTables();
    }
  };

  const handleCloseTable = async (id: string) => {
    const table = tables.find(t => t.id === id);
    
    try {
      const res = await fetch('/api/admin/tables/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Receipt Modal göster
        setReceipt({
          sessionId: data.receipt.sessionId,
          tableName: table?.name || 'Masa',
          tableType: table?.type || '',
          startedAt: data.receipt.startedAt,
          endedAt: data.receipt.endedAt,
          durationMinutes: data.receipt.durationMinutes,
          hourlyRate: data.receipt.hourlyRate,
          totalPrice: data.receipt.totalPrice,
          minimumApplied: data.receipt.minimumApplied,
        });

        // Masayı müsait yap
        setTables(prev => prev.map(t => 
          t.id === id 
            ? { ...t, status: 'available' as const, currentSession: null }
            : t
        ));
      } else {
        const error = await res.json();
        showToast(error.error || 'Hesap kesilemedi', 'error');
      }
    } catch (err) {
      showToast('Bağlantı hatası', 'error');
    }
  };

  // Filtrele
  const filteredTables = tables.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  // Sayılar
  const counts = {
    all: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    'in-use': tables.filter(t => t.status === 'in-use').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center p-12">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 gap-4">
        <p className="text-zinc-400 text-lg">Henüz masa eklenmemiş</p>
        <p className="text-zinc-500 text-sm">Masa eklemek için yönetim panelini kullanın</p>
      </div>
    );
  }

  return (
    <>
      {/* Filtre Butonları */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {([
          { key: 'all' as FilterType, label: 'Tümü' },
          { key: 'available' as FilterType, label: 'Boş' },
          { key: 'in-use' as FilterType, label: 'Dolu' },
          { key: 'reserved' as FilterType, label: 'Rezerve' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              filter === key
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10 hover:border-white/30'
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}

        {/* Refresh butonu */}
        <button
          onClick={() => { setLoading(true); fetchTables(); }}
          className="ml-auto p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          title="Yenile"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredTables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table} 
            onOpenTable={handleOpenTable} 
            onCloseTable={handleCloseTable} 
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          Bu filtreye uygun masa bulunamadı
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}

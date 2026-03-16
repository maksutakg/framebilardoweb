'use client';

import React, { useState, useEffect } from 'react';
import TableCard, { TableResource } from './TableCard';
import { Loader2 } from 'lucide-react';

// Temporary Mock Data for UI Visualization
const MOCK_TABLES: TableResource[] = [
  { id: '1', name: 'Snooker 1', type: 'SNOOKER', status: 'in-use', hourlyRate: 400 },
  { id: '2', name: 'Snooker 2', type: 'SNOOKER', status: 'available', hourlyRate: 400 },
  { id: '3', name: 'Snooker 3', type: 'SNOOKER', status: 'reserved', hourlyRate: 400 },
  { id: '4', name: 'Snooker VIP', type: 'SNOOKER VIP', status: 'in-use', hourlyRate: 600 },
  { id: '5', name: '3-Top 1', type: 'KARAMBOL', status: 'available', hourlyRate: 300 },
  { id: '6', name: '3-Top 2', type: 'KARAMBOL', status: 'available', hourlyRate: 300 },
  { id: '7', name: 'Amerikan 1', type: 'POOL', status: 'in-use', hourlyRate: 350 },
  { id: '8', name: 'Amerikan 2', type: 'POOL', status: 'available', hourlyRate: 350 },
];

export default function TableGrid() {
  const [tables, setTables] = useState<TableResource[]>(MOCK_TABLES);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          setTables(data.tables);
        }
      }
    } catch (err) {
      console.error('API Error, falling back to mock UI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Real-time synchronization (SSE via Postgres Listen/Notify)
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

    return () => eventSource.close();
  }, []);

  const handleOpenTable = async (id: string) => {
    try {
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'in-use' } : t));
      await fetch('/api/admin/tables/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id })
      });
      // Optionally re-fetch real session data
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTable = async (id: string) => {
    try {
      setTables(prev => prev.map(t => t.id === id ? { ...t, status: 'available' } : t));
      const res = await fetch('/api/admin/tables/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: id })
      });

      if (res.ok) {
        const data = await res.json();
        // Here we could show a modal with the receipt generated from backend:
        // alert(`Hesap Kesildi: ₺${data.receipt.totalPrice} \n Süre: ${data.receipt.durationMinutes} dakika`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="w-full flex justify-center p-12"><Loader2 className="animate-spin size-8 text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {tables.map((table) => (
        <TableCard 
          key={table.id} 
          table={table} 
          onOpenTable={handleOpenTable} 
          onCloseTable={handleCloseTable} 
        />
      ))}
    </div>
  );
}

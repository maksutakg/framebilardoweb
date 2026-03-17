import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gameSessions, tables } from '@/lib/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth-guard';

export async function GET(req: Request) {
  try {
    const { error } = await requireStaffOrAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today'; // 'today', 'week', 'month'

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default: // today
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Tamamlanmış oturumları getir (periyoda göre)
    const completedSessions = await db.select({
      id: gameSessions.id,
      tableId: gameSessions.tableId,
      tableName: tables.name,
      tableType: tables.type,
      startedAt: gameSessions.startedAt,
      endedAt: gameSessions.endedAt,
      totalPrice: gameSessions.totalPrice,
      hourlyRateAtTime: gameSessions.hourlyRateAtTime,
    })
    .from(gameSessions)
    .leftJoin(tables, eq(gameSessions.tableId, tables.id))
    .where(
      and(
        eq(gameSessions.status, 'finished'),
        gte(gameSessions.startedAt, startDate)
      )
    )
    .orderBy(desc(gameSessions.startedAt));

    // Toplam ciro
    const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    
    // Toplam oturum sayısı
    const totalSessions = completedSessions.length;

    // Ortalama oturum süresi (dakika)
    let avgDurationMinutes = 0;
    if (completedSessions.length > 0) {
      const totalMinutes = completedSessions.reduce((sum, s) => {
        if (s.startedAt && s.endedAt) {
          return sum + (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / (1000 * 60);
        }
        return sum;
      }, 0);
      avgDurationMinutes = Math.round(totalMinutes / completedSessions.length);
    }

    // Masa tipine göre ciro dağılımı
    const revenueByType: Record<string, { revenue: number; sessions: number }> = {};
    completedSessions.forEach(s => {
      const type = s.tableType || 'Bilinmeyen';
      if (!revenueByType[type]) {
        revenueByType[type] = { revenue: 0, sessions: 0 };
      }
      revenueByType[type].revenue += s.totalPrice || 0;
      revenueByType[type].sessions += 1;
    });

    // Saat bazlı dağılım (en yoğun saatler)
    const hourDistribution: Record<number, number> = {};
    completedSessions.forEach(s => {
      if (s.startedAt) {
        const hour = new Date(s.startedAt).getHours();
        hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
      }
    });

    // Aktif oturumlar (şu an çalışan masalar)
    const activeSessions = await db.select({
      tableId: gameSessions.tableId,
      tableName: tables.name,
      startedAt: gameSessions.startedAt,
      hourlyRateAtTime: gameSessions.hourlyRateAtTime,
    })
    .from(gameSessions)
    .leftJoin(tables, eq(gameSessions.tableId, tables.id))
    .where(eq(gameSessions.status, 'active'));

    // Aktif oturumların tahmini güncel cirosu
    const activeRevenue = activeSessions.reduce((sum, s) => {
      if (s.startedAt && s.hourlyRateAtTime) {
        const hours = (now.getTime() - new Date(s.startedAt).getTime()) / (1000 * 60 * 60);
        return sum + (Math.max(hours, 1) * s.hourlyRateAtTime);
      }
      return sum;
    }, 0);

    return NextResponse.json({
      period,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeRevenue: Math.round(activeRevenue * 100) / 100,
      totalSessions,
      avgDurationMinutes,
      revenueByType,
      hourDistribution,
      activeSessions: activeSessions.length,
      sessions: completedSessions.slice(0, 50), // Son 50 oturum
    });
  } catch (err: any) {
    console.error('Reports error:', err);
    return NextResponse.json({ error: 'Rapor oluşturulurken hata oluştu' }, { status: 500 });
  }
}

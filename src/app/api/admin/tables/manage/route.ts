import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tables } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth-guard';

// Masa Ekleme
export async function POST(req: Request) {
  try {
    const { error } = await requireStaffOrAdmin();
    if (error) return error;

    const { name, type, hourlyRate } = await req.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Masa adı ve tipi gerekli' }, { status: 400 });
    }

    const newTable = await db.insert(tables).values({
      name,
      type,
      hourlyRate: hourlyRate || 400,
      status: 'available',
      isActive: true,
    }).returning();

    return NextResponse.json({ success: true, table: newTable[0] });
  } catch (err: any) {
    console.error('Table create error:', err);
    return NextResponse.json({ error: 'Masa eklenirken hata oluştu' }, { status: 500 });
  }
}

// Masa Güncelleme
export async function PUT(req: Request) {
  try {
    const { error } = await requireStaffOrAdmin();
    if (error) return error;

    const { id, name, type, hourlyRate, status } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (hourlyRate) updateData.hourlyRate = hourlyRate;
    if (status) updateData.status = status;

    const updated = await db.update(tables)
      .set(updateData)
      .where(eq(tables.id, id))
      .returning();

    return NextResponse.json({ success: true, table: updated[0] });
  } catch (err: any) {
    console.error('Table update error:', err);
    return NextResponse.json({ error: 'Masa güncellenirken hata oluştu' }, { status: 500 });
  }
}

// Masa Silme (Soft Delete)
export async function DELETE(req: Request) {
  try {
    const { error } = await requireStaffOrAdmin();
    if (error) return error;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Masa ID gerekli' }, { status: 400 });
    }

    await db.update(tables)
      .set({ isActive: false })
      .where(eq(tables.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Table delete error:', err);
    return NextResponse.json({ error: 'Masa silinirken hata oluştu' }, { status: 500 });
  }
}

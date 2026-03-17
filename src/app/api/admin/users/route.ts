import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth-guard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Tüm kullanıcıları listele (sadece admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece admin erişebilir' }, { status: 403 });
    }

    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt);

    return NextResponse.json({ users: allUsers });
  } catch (err: any) {
    console.error('Users fetch error:', err);
    return NextResponse.json({ error: 'Kullanıcılar yüklenirken hata oluştu' }, { status: 500 });
  }
}

// Kullanıcı rolünü güncelle (sadece admin)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece admin erişebilir' }, { status: 403 });
    }

    const { userId, role, name } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Geçerli rol kontrolü
    const validRoles = ['customer', 'staff', 'admin'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol. customer, staff veya admin olmalı.' }, { status: 400 });
    }

    // Admin kendi rolünü düşüremez
    if (userId === session.user.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Kendi admin rolünüzü düşüremezsiniz' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (role) updateData.role = role;
    if (name !== undefined) updateData.name = name;

    const updated = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated[0] });
  } catch (err: any) {
    console.error('User update error:', err);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu' }, { status: 500 });
  }
}

// Telefon numarası ile yeni staff/admin oluştur (kullanıcı henüz kayıtlı değilse)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece admin erişebilir' }, { status: 403 });
    }

    const { phone, role, name } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Telefon numarası gerekli' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const validRoles = ['customer', 'staff', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'staff';

    // Numara zaten kayıtlı mı?
    const existing = await db.select().from(users).where(eq(users.phone, cleanPhone));
    
    if (existing.length > 0) {
      // Varsa rolünü güncelle
      const updated = await db.update(users)
        .set({ role: userRole, name: name || existing[0].name })
        .where(eq(users.phone, cleanPhone))
        .returning();
      
      return NextResponse.json({ 
        success: true, 
        user: updated[0], 
        message: `${cleanPhone} numaralı kullanıcının rolü ${userRole} olarak güncellendi` 
      });
    }

    // Yoksa yeni oluştur
    const newUser = await db.insert(users).values({
      phone: cleanPhone,
      name: name || null,
      role: userRole,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      user: newUser[0],
      message: `${cleanPhone} numarası ${userRole} olarak eklendi`
    });
  } catch (err: any) {
    console.error('User create error:', err);
    return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu' }, { status: 500 });
  }
}

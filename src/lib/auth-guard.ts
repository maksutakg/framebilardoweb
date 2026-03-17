import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Admin API'leri için yetki kontrolü
 * Sadece 'admin' veya 'staff' rolü erişebilir
 */
export async function requireStaffOrAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 }), session: null };
  }

  const role = session.user.role;
  if (role !== 'admin' && role !== 'staff') {
    return { error: NextResponse.json({ error: 'Yetkiniz bulunmuyor' }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

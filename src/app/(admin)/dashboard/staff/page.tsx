'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ShieldCheck, User, Phone, RefreshCw, Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useSession } from 'next-auth/react';

interface UserRecord {
  id: string;
  name: string | null;
  phone: string;
  role: string;
  createdAt: string;
}

export default function StaffPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const { showToast } = useToast();
  const { data: session } = useSession();

  // Form state
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff');

  const isAdmin = session?.user?.role === 'admin';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else if (res.status === 403) {
        showToast('Bu sayfaya sadece admin erişebilir', 'error');
      }
    } catch {
      showToast('Kullanıcılar yüklenemedi', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newPhone || newPhone.length < 10) {
      showToast('Geçerli bir telefon numarası girin', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, role: newRole, name: newName || null })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Personel eklendi', 'success');
        setNewPhone('');
        setNewName('');
        setNewRole('staff');
        setShowAddForm(false);
        fetchUsers();
      } else {
        showToast(data.error || 'Eklenemedi', 'error');
      }
    } catch {
      showToast('Bağlantı hatası', 'error');
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: editRole, name: editName })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Kullanıcı güncellendi', 'success');
        setEditingId(null);
        fetchUsers();
      } else {
        showToast(data.error || 'Güncellenemedi', 'error');
      }
    } catch {
      showToast('Bağlantı hatası', 'error');
    }
  };

  const startEditing = (user: UserRecord) => {
    setEditingId(user.id);
    setEditName(user.name || '');
    setEditRole(user.role);
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { classes: string; icon: React.ReactNode; label: string }> = {
      admin: {
        classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: <ShieldCheck className="size-3.5" />,
        label: 'Admin'
      },
      staff: {
        classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: <Shield className="size-3.5" />,
        label: 'Personel'
      },
      customer: {
        classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        icon: <User className="size-3.5" />,
        label: 'Müşteri'
      }
    };
    const cfg = map[role] || map.customer;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${cfg.classes}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Shield className="size-16 text-zinc-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Erişim Engellendi</h2>
          <p className="text-zinc-400">Bu sayfaya sadece <strong>admin</strong> rolüne sahip kullanıcılar erişebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="size-8 text-purple-400" />
            Personel Yönetimi
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">Personel ekleyin, yetkilerini düzenleyin</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <Plus className="size-4" />
            Personel Ekle
          </button>
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Personel Ekleme Formu */}
      {showAddForm && (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="size-5 text-purple-400" />
            Yeni Personel Ekle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Telefon Numarası *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 size-4 text-zinc-500" />
                <input
                  type="tel"
                  placeholder="5XXXXXXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">İsim (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Personelin adı"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'staff' | 'admin')}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm appearance-none"
              >
                <option value="staff" className="bg-zinc-900">Personel</option>
                <option value="admin" className="bg-zinc-900">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddUser}
                disabled={!newPhone || newPhone.length < 10}
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Ekle
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            💡 Numara zaten kayıtlıysa, rolü otomatik olarak güncellenir. Yeni bir numaraysa, kullanıcı oluşturulur.
          </p>
        </div>
      )}

      {/* Kullanıcı Tablosu */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin size-8 border-2 border-purple-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-zinc-400 font-semibold">İsim</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Telefon</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Rol</th>
                  <th className="text-left p-4 text-zinc-400 font-semibold">Kayıt Tarihi</th>
                  <th className="text-right p-4 text-zinc-400 font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-40"
                          placeholder="İsim girin"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                            <User className="size-4" />
                          </div>
                          <span className="text-white font-medium">{user.name || '—'}</span>
                          {user.id === session?.user?.id && (
                            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Sen</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-zinc-300 font-mono text-xs">{user.phone}</td>
                    <td className="p-4">
                      {editingId === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          disabled={user.id === session?.user?.id}
                          className="bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none disabled:opacity-40"
                        >
                          <option value="customer" className="bg-zinc-900">Müşteri</option>
                          <option value="staff" className="bg-zinc-900">Personel</option>
                          <option value="admin" className="bg-zinc-900">Admin</option>
                        </select>
                      ) : (
                        roleBadge(user.role)
                      )}
                    </td>
                    <td className="p-4 text-zinc-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      {editingId === user.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleUpdateRole(user.id)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            title="Kaydet"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="İptal"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(user)}
                          className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                          title="Düzenle"
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      Henüz kayıtlı kullanıcı bulunmuyor
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Alt bilgi */}
          <div className="p-4 border-t border-white/5 bg-white/5">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Toplam: {users.length} kullanıcı</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> {users.filter(u => u.role === 'admin').length} Admin</span>
                <span className="flex items-center gap-1"><Shield className="size-3" /> {users.filter(u => u.role === 'staff').length} Personel</span>
                <span className="flex items-center gap-1"><User className="size-3" /> {users.filter(u => u.role === 'customer').length} Müşteri</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bilgi Kutusu */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 text-sm text-zinc-300 space-y-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Shield className="size-4 text-purple-400" />
          Roller Hakkında
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <ShieldCheck className="size-4" />
              Admin
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Tüm yetkilere sahiptir. Masaları yönetir, personel ekler/çıkarır, raporları görür, rezervasyonları yönetir.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <Shield className="size-4" />
              Personel
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Dashboard'a erişir, masa açıp kapatabilir, rezervasyonları görür. Personel ekleme yetkisi yoktur.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <User className="size-4" />
              Müşteri
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Sadece web sitesinden rezervasyon yapabilir. Dashboard'a erişemez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

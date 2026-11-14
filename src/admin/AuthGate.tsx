import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

type Role = 'admin' | 'creator' | 'approver' | 'publisher';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }).catch(() => { if (mounted) setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadRoles() {
      if (!supabase || !session?.user) {
        setRoles([]);
        setRolesLoading(false);
        return;
      }
      setRolesLoading(true);
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      if (!mounted) return;
      if (roleError) {
        setError('Không thể tải vai trò tài khoản. Vui lòng liên hệ Admin.');
        setRoles([]);
        setRolesLoading(false);
        return;
      }
      setRoles((data ?? []).map((item) => item.role as Role));
      setRolesLoading(false);
    }
    loadRoles().catch(() => {
      if (mounted) {
        setError('Không thể tải vai trò tài khoản. Vui lòng liên hệ Admin.');
        setRoles([]);
        setRolesLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [session]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError('Đăng nhập không thành công. Kiểm tra email và mật khẩu.');
    setBusy(false);
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#F6F7F5]">Đang kiểm tra phiên đăng nhập...</div>;

  if (!supabaseConfigured || !supabase) {
    return <div className="min-h-screen grid place-items-center bg-[#F6F7F5] p-6"><div className="max-w-md bg-white rounded-2xl border p-6"><h1 className="font-semibold text-lg">Chưa cấu hình Supabase</h1><p className="text-sm text-gray-600 mt-2">Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trong Environment Variables của Vercel, sau đó deploy lại.</p></div></div>;
  }

  if (!session) {
    return <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center p-5"><form onSubmit={signIn} className="w-full max-w-md bg-white border border-[#E8EBE7] rounded-2xl p-8 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[#D5B98C] text-[#1F3029] grid place-items-center font-bold text-xl">G</div>
      <p className="text-xs tracking-[0.2em] text-[#9A8769] mt-6">GIAO THỜI · MARKETING AI</p>
      <h1 className="text-2xl font-semibold text-[#202923] mt-2">Đăng nhập hệ thống</h1>
      <p className="text-sm text-gray-500 mt-2 mb-6">Sử dụng tài khoản email được Admin cấp.</p>
      <label className="block text-sm font-medium mb-2">Email</label>
      <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#D5B98C]" />
      <label className="block text-sm font-medium mb-2">Mật khẩu</label>
      <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#D5B98C]" />
      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-[#1F3029] text-white py-3 font-medium disabled:opacity-60">{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
    </form></div>;
  }

  if (rolesLoading) return <div className="min-h-screen grid place-items-center bg-[#F6F7F5]">Đang kiểm tra quyền truy cập...</div>;

  if (roles.length === 0) {
    return <div className="min-h-screen grid place-items-center bg-[#F6F7F5] p-6"><div className="max-w-md bg-white rounded-2xl border p-6"><h1 className="font-semibold text-lg">Tài khoản chưa được cấp quyền</h1><p className="text-sm text-gray-600 mt-2">{error || 'Liên hệ Admin GIAO THỜI để được cấp vai trò phù hợp.'}</p><button onClick={() => supabase.auth.signOut()} className="mt-5 text-sm underline">Đăng xuất</button></div></div>;
  }

  return <>{children}</>;
}

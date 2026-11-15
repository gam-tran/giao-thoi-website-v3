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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    if (window.location.hash.includes('type=recovery')) {
      setResetMode(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
        setError('');
        setNotice('');
      }
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError('Không thể xác thực phiên khôi phục. Hãy mở lại link trong email.');
      setSession(data.session);
      setLoading(false);
    }).catch(() => {
      if (mounted) {
        setError('Không thể kiểm tra phiên đăng nhập. Vui lòng tải lại trang.');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadRoles() {
      if (!supabase || !session?.user || resetMode) {
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
  }, [session, resetMode]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) setError('Đăng nhập không thành công. Kiểm tra email và mật khẩu.');
    setBusy(false);
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setError('');
    setNotice('');
    if (newPassword.length < 12 || newPassword.length > 128) {
      setError('Mật khẩu mới phải có từ 12 đến 128 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Hai lần nhập mật khẩu mới không khớp.');
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError('Không thể cập nhật mật khẩu: ' + updateError.message + '. Link khôi phục có thể đã hết hạn; hãy yêu cầu gửi lại email.');
    } else {
      setNotice('Đã cập nhật mật khẩu thành công. Đang chuyển sang Admin...');
      setNewPassword('');
      setConfirmPassword('');
      setResetMode(false);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
    setBusy(false);
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#F6F7F5]">Đang kiểm tra phiên đăng nhập...</div>;

  if (!supabaseConfigured || !supabase) {
    return <div className="min-h-screen grid place-items-center bg-[#F6F7F5] p-6"><div className="max-w-md bg-white rounded-2xl border p-6"><h1 className="font-semibold text-lg">Chưa cấu hình Supabase</h1><p className="text-sm text-gray-600 mt-2">Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trong Environment Variables của Vercel, sau đó deploy lại.</p></div></div>;
  }

  if (resetMode) {
    if (!session) {
      return <div className="min-h-screen grid place-items-center bg-[#F6F7F5] p-6"><div className="max-w-md bg-white rounded-2xl border p-6"><h1 className="font-semibold text-lg">Link khôi phục chưa hợp lệ</h1><p className="text-sm text-gray-600 mt-2">Phiên khôi phục chưa được xác thực hoặc link đã hết hạn. Hãy mở lại email recovery mới nhất.</p>{error && <p role="alert" className="text-sm text-red-600 mt-3">{error}</p>}</div></div>;
    }
    return <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center p-5"><form onSubmit={updatePassword} className="w-full max-w-md bg-white border border-[#E8EBE7] rounded-2xl p-8 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[#D5B98C] text-[#1F3029] grid place-items-center font-bold text-xl">G</div>
      <p className="text-xs tracking-[0.2em] text-[#9A8769] mt-6">GIAO THỜI · MARKETING AI</p>
      <h1 className="text-2xl font-semibold text-[#202923] mt-2">Đặt mật khẩu mới</h1>
      <p className="text-sm text-gray-500 mt-2 mb-6">Tạo mật khẩu mới cho tài khoản quản trị của bạn.</p>
      <label className="block text-sm font-medium mb-2">Mật khẩu mới (ít nhất 12 ký tự)</label>
      <input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#D5B98C]" />
      <label className="block text-sm font-medium mb-2">Nhập lại mật khẩu mới</label>
      <input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded-lg px-3 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#D5B98C]" />
      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
      {notice && <p role="status" className="text-sm text-green-700 mb-4">{notice}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-[#1F3029] text-white py-3 font-medium disabled:opacity-60">{busy ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button>
    </form></div>;
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

  return <>{React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { userEmail: session.user.email ?? '', roles, onSignOut: () => { void supabase.auth.signOut(); } }) : children}</>;
}

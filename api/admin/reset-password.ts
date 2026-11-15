import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const expectedToken = process.env.ADMIN_PASSWORD_RESET_TOKEN || '';
  const allowedEmail = (process.env.ADMIN_PASSWORD_RESET_EMAIL || '').trim().toLowerCase();
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const secretKey = process.env.SUPABASE_SECRET_KEY || '';

  if (expectedToken.length < 32 || !allowedEmail || !supabaseUrl || !secretKey) {
    return res.status(503).json({ success: false, message: 'Password reset is not configured on the server.' });
  }

  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!safeEqual(token, expectedToken) || !safeEqual(email, allowedEmail)) {
    return res.status(403).json({ success: false, message: 'The reset authorization could not be verified.' });
  }
  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 12 and 128 characters.' });
  }

  try {
    let targetUser: { id: string; email?: string } | null = null;
    for (let page = 1; page <= 10 && !targetUser; page += 1) {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&perPage=1000`, {
        headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
      });
      if (!response.ok) {
        console.error('Supabase admin user lookup failed:', response.status);
        return res.status(502).json({ success: false, message: 'Could not verify the target account with Supabase.' });
      }
      const payload = await response.json() as { users?: Array<{ id: string; email?: string }> };
      targetUser = (payload.users || []).find((user) => (user.email || '').toLowerCase() === allowedEmail) || null;
      if (!targetUser || (payload.users || []).length < 1000) break;
    }

    if (!targetUser?.id) {
      return res.status(404).json({ success: false, message: 'The configured admin account was not found.' });
    }

    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(targetUser.id)}`, {
      method: 'PUT',
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!updateResponse.ok) {
      const detail = await updateResponse.text();
      console.error('Supabase admin password update failed:', updateResponse.status, detail.slice(0, 300));
      return res.status(502).json({ success: false, message: 'Supabase could not update the password. Check server configuration and key permissions.' });
    }

    return res.status(200).json({ success: true, message: 'Password updated. Sign in with the new password.' });
  } catch (error) {
    console.error('Admin password reset failed:', error);
    return res.status(502).json({ success: false, message: 'Password reset service is temporarily unavailable.' });
  }
}

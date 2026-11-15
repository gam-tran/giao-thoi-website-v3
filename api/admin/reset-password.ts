import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (!origin || !host || new URL(origin).host !== host) {
    return res.status(403).json({ success: false, message: 'Request origin not allowed' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const resetToken = process.env.ADMIN_PASSWORD_RESET_TOKEN;
  const targetEmail = (process.env.ADMIN_PASSWORD_RESET_EMAIL || '').trim().toLowerCase();

  if (!supabaseUrl || !secretKey || !resetToken || !targetEmail) {
    return res.status(503).json({
      success: false,
      message: 'Password reset is not configured. Check the server-only Vercel environment variables.',
    });
  }

  const suppliedToken = typeof req.body?.token === 'string' ? req.body.token : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEqual(suppliedToken, resetToken)) {
    return res.status(401).json({ success: false, message: 'Invalid reset authorization.' });
  }
  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 12 and 128 characters.' });
  }

  try {
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      console.error('Admin password reset: unable to list users:', listError.message);
      return res.status(502).json({ success: false, message: 'Could not verify the target account.' });
    }

    const user = usersData.users.find((item) => item.email?.toLowerCase() === targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'The configured admin account was not found.' });
    }

    if (user.app_metadata?.admin_password_bootstrap_used === true) {
      return res.status(409).json({
        success: false,
        message: 'The one-time password recovery has already been used. Remove this temporary endpoint and its environment variables.',
      });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      app_metadata: {
        ...(user.app_metadata || {}),
        admin_password_bootstrap_used: true,
      },
    });

    if (updateError) {
      console.error('Admin password reset failed:', updateError.message);
      return res.status(502).json({ success: false, message: 'Supabase could not update the password.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated. The temporary recovery endpoint can now be removed.',
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    return res.status(502).json({ success: false, message: 'Password reset service is unavailable.' });
  }
}

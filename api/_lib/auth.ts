export type AppRole = 'admin' | 'creator' | 'approver' | 'publisher';

export async function authenticateRequest(req: any, res: any, allowedRoles: AppRole[]) {
  const authorization = req.headers?.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return null;
  }
  if (!supabaseUrl || !publishableKey) {
    res.status(500).json({ success: false, message: 'Supabase server configuration is missing' });
    return null;
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
    });
    if (!userResponse.ok) {
      res.status(401).json({ success: false, message: 'Invalid or expired session' });
      return null;
    }
    const user = await userResponse.json() as { id?: string };
    if (!user.id) {
      res.status(401).json({ success: false, message: 'Invalid session user' });
      return null;
    }

    const rolesResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,
      { headers: { apikey: publishableKey, Authorization: `Bearer ${token}` } },
    );
    if (!rolesResponse.ok) {
      res.status(403).json({ success: false, message: 'Unable to verify user permissions' });
      return null;
    }
    const rows = await rolesResponse.json() as Array<{ role: AppRole }>;
    const roles = rows.map((row) => row.role);
    if (!roles.some((role) => allowedRoles.includes(role))) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return null;
    }
    return { id: user.id, roles };
  } catch (error) {
    console.error('Supabase authentication error:', error);
    res.status(502).json({ success: false, message: 'Authentication service unavailable' });
    return null;
  }
}

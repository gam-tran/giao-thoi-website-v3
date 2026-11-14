import { authenticateRequest } from './_lib/auth';

export default async function handler(req: any, res: any) {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!allowedMethods.includes(req.method)) return res.status(405).json({ success: false, message: 'Method not allowed' });

  const allowedRoles = req.method === 'GET'
    ? ['admin', 'creator', 'approver', 'publisher'] as const
    : ['admin', 'publisher'] as const;
  const user = await authenticateRequest(req, res, [...allowedRoles]);
  if (!user) return;

  const baseUrl = process.env.N8N_BASE_URL?.replace(/\/$/, '');
  const webhookKey = process.env.N8N_WEBHOOK_KEY;
  if (!baseUrl || !webhookKey) return res.status(500).json({ success: false, message: 'Server configuration is missing' });

  const paths: Record<string, string> = {
    GET: '/webhook/giaothoi-calendar',
    POST: '/webhook/giaothoi-calendar-save',
    PUT: '/webhook/giaothoi-calendar-update',
    DELETE: '/webhook/giaothoi-calendar-delete',
  };

  try {
    const response = await fetch(`${baseUrl}${paths[req.method]}`, {
      method: req.method,
      headers: {
        'X-GIAO-THOI-KEY': webhookKey,
        ...(req.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(req.method !== 'GET' ? { body: JSON.stringify(req.body ?? {}) } : {}),
    });
    const data = await response.text();
    res.setHeader('Cache-Control', 'no-store');
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.send(data);
  } catch (error) {
    console.error('Calendar API error:', error);
    return res.status(502).json({ success: false, message: 'Cannot connect to n8n' });
  }
}

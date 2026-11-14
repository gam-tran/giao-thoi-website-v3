import { authenticateRequest } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  const route = req.query?.route;

  const webhooks: Record<string, { method: string; path: string }> = {
    'giaothoi-dashboard': { method: 'GET', path: '/webhook/giaothoi-dashboard' },
    'giaothoi-ai-assistant': { method: 'POST', path: '/webhook/giaothoi-ai-assistant' },
    'giaothoi-content-studio': { method: 'POST', path: '/webhook/giaothoi-content-studio' },
    'giaothoi-campaign-planner': { method: 'POST', path: '/webhook/giaothoi-campaign-planner' },
    'giaothoi-analytics': { method: 'POST', path: '/webhook/giaothoi-analytics' },
    'giaothoi-marketing-insights': { method: 'POST', path: '/webhook/giaothoi-marketing-insights' },
    'giaothoi-content-library': { method: 'GET', path: '/webhook/giaothoi-content-library' },
    'giaothoi-content-library-save': { method: 'POST', path: '/webhook/giaothoi-content-library-save' },
    'giaothoi-content-approval': { method: 'POST', path: '/webhook/giaothoi-content-approval' },
    'giaothoi-automation-workflows': { method: 'GET', path: '/webhook/giaothoi-automation-workflows' },
    'giaothoi-automation-executions': { method: 'GET', path: '/webhook/giaothoi-automation-executions' },
    'giaothoi-schedules': { method: 'GET', path: '/webhook/giaothoi-schedules' },
    'giaothoi-automation-control': { method: 'POST', path: '/webhook/giaothoi-automation-control' },
    'giaothoi-automation-run': { method: 'POST', path: '/webhook/giaothoi-automation-run' },
  };

  const webhook = typeof route === 'string' ? webhooks[route] : undefined;
  if (!webhook) return res.status(404).json({ success: false, message: 'Webhook route not found' });

  if (req.method !== webhook.method) {
    res.setHeader('Allow', webhook.method);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const roleMap: Record<string, Array<'admin' | 'creator' | 'approver' | 'publisher'>> = {
    'giaothoi-content-studio': ['admin', 'creator'],
    'giaothoi-content-library-save': ['admin', 'creator'],
    'giaothoi-content-approval': ['admin', 'approver'],
    'giaothoi-automation-control': ['admin'],
    'giaothoi-automation-run': ['admin'],
  };
  const allowedRoles = roleMap[route] ?? ['admin', 'creator', 'approver', 'publisher'];
  const user = await authenticateRequest(req, res, allowedRoles);
  if (!user) return;

  const baseUrl = process.env.N8N_BASE_URL?.replace(/\/$/, '');
  const webhookKey = process.env.N8N_WEBHOOK_KEY;
  if (!baseUrl || !webhookKey) return res.status(500).json({ success: false, message: 'Server configuration is missing' });

  try {
    const response = await fetch(`${baseUrl}${webhook.path}`, {
      method: webhook.method,
      headers: {
        'X-GIAO-THOI-KEY': webhookKey,
        ...(webhook.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(webhook.method !== 'GET' ? { body: JSON.stringify(req.body ?? {}) } : {}),
    });
    const data = await response.text();
    res.setHeader('Cache-Control', 'no-store');
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.send(data);
  } catch (error) {
    console.error('n8n proxy error:', error);
    return res.status(502).json({ success: false, message: 'Cannot connect to n8n' });
  }
}

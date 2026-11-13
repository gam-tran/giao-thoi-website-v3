export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const baseUrl = process.env.N8N_BASE_URL?.replace(/\/$/, '');
  const webhookKey = process.env.N8N_WEBHOOK_KEY;

  if (!baseUrl || !webhookKey) {
    return res.status(500).json({ success: false, message: 'Server configuration is missing' });
  }

  try {
    const response = await fetch(`${baseUrl}/webhook/giaothoi-dashboard`, {
      method: 'GET',
      headers: { 'X-GIAO-THOI-KEY': webhookKey },
    });

    const data = await response.text();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.status(response.status).send(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(502).json({ success: false, message: 'Cannot connect to n8n' });
  }
}

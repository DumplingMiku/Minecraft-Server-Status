import servers from '../servers.json';

// Vercel Serverless Function
// Endpoint: /api/status?id=survival
export default async function handler(req, res) {
  // CORS Support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get ID from path or query
  // Vercel usually passes query params easily. 
  // We will support /api/status?id=xxx AND /api/status/xxx (if configured with rewrites, but query is safer default)
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const server = servers.servers.find((s) => s.id === id);

  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}`, {
      headers: {
        'User-Agent': 'MC-Status-Panel-Vercel/1.0'
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
}

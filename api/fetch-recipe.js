/**
 * Vercel serverless function: server-side proxy to fetch recipe HTML
 * GET /api/fetch-recipe?url=https://...
 */
export default async function handler(req, res) {
  // CORS headers so the frontend can call this from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return res.status(400).json({ error: 'Only http/https URLs allowed' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        Referer: 'https://www.google.es/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Remote returned ${response.status}` });
    }

    const html = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600'); // cache 1h on Vercel edge
    res.status(200).send(html);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

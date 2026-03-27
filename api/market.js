export default async function handler(req, res) {
  const { symbol = 'AAPL' } = req.query;
  const FINNHUB_KEY = process.env.VITE_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;

  if (!FINNHUB_KEY) {
    return res.status(500).json({ error: 'Finnhub API Key is not configured on Vercel.' });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Finnhub returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Market API Proxy Error:', error);
    return res.status(502).json({ error: 'Failed to access remote market data.', details: error.message });
  }
}

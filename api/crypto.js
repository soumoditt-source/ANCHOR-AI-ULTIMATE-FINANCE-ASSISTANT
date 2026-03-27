export default async function handler(req, res) {
  const { ids = 'bitcoin,ethereum,solana' } = req.query;
  const COINGECKO_KEY = process.env.VITE_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const options = COINGECKO_KEY ? { headers: { 'x-cg-demo-api-key': COINGECKO_KEY } } : {};

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Crypto API Proxy Error:', error);
    return res.status(502).json({ error: 'Failed to access remote crypto data.', details: error.message });
  }
}

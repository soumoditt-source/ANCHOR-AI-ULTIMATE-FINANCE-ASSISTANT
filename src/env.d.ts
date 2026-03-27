// Anchor AI - Environment Variable Types

interface ImportMetaEnv {
  readonly VITE_FINNHUB_API_KEY: string
  readonly VITE_COINGECKO_API_KEY: string
  readonly VITE_NEWSDATA_API_KEY: string
  readonly VITE_EXCHANGERATE_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

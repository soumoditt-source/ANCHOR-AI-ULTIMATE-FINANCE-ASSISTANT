import { GoogleGenAI } from '@google/genai';
import { OpenAI } from 'openai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Initialize SDKs (lazily so browser doesn't crash if keys are missing)
let geminiClient: GoogleGenAI | null = null;
let openrouterClient: OpenAI | null = null;
let groqClient: OpenAI | null = null;

const getGemini = () => {
  if (!geminiClient && GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return geminiClient;
};

const getGroq = () => {
  if (!groqClient && GROQ_API_KEY) {
    groqClient = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return groqClient;
};

const getOpenRouter = () => {
  if (!openrouterClient && OPENROUTER_API_KEY) {
    openrouterClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return openrouterClient;
};

const ANDY_SYSTEM_PROMPT = `You are ANDY — Anchor AI's Neural Debt Yntelligence. You are an elite, aggressive financial oracle specializing in:
- Debt annihilation strategies (avalanche/snowball methods)
- Crypto & equity portfolio optimization (Gen-Z audience)
- FIRE (Financial Independence, Retire Early) calculations
- Market sentiment analysis

Personality: You speak concisely, confidently, sometimes using street-wealth metaphors. You respond in under 150 words unless analysis requires more.
You are NOT a disclaimer-bot. You give REAL, actionable advice.`;

async function callGroq(userMessage: string): Promise<string> {
  const client = getGroq();
  if (!client) throw new Error('Groq client not initialized');
  const completion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: ANDY_SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ],
    model: 'mixtral-8x7b-32768',
    temperature: 0.6,
    max_tokens: 512
  });
  return completion.choices[0]?.message?.content ?? '';
}

async function callOpenRouter(userMessage: string): Promise<string> {
  const client = getOpenRouter();
  if (!client) throw new Error('OpenRouter client not initialized');
  const completion = await client.chat.completions.create({
    model: 'liquid/lfm-40b:free',
    messages: [
      { role: 'system', content: ANDY_SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 1024
  });
  return completion.choices[0]?.message?.content ?? '';
}

async function callGemini(userMessage: string): Promise<string> {
  const client = getGemini();
  if (!client) throw new Error('Gemini client not initialized');
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${ANDY_SYSTEM_PROMPT}\n\nUser: ${userMessage}`
  });
  return response.text ?? '';
}

export type AITask = 'chat' | 'analysis' | 'fast_calc';

function detectTaskType(input: string): AITask {
  const lower = input.toLowerCase();
  if (lower.includes('analyze') || lower.includes('deep') || lower.includes('report')) return 'analysis';
  if (/\d/.test(lower) && (lower.includes('calculat') || lower.includes('how much') || lower.includes('percent'))) return 'fast_calc';
  return 'chat';
}

export const AIService = {
  detectTaskType,

  async chat(userMessage: string, taskType?: AITask): Promise<string> {
    const type = taskType ?? detectTaskType(userMessage);
    try {
      switch (type) {
        case 'fast_calc':
          return await callGroq(userMessage);
        case 'analysis':
          return await callOpenRouter(userMessage);
        case 'chat':
        default:
          return await callGemini(userMessage);
      }
    } catch (primaryError) {
      console.warn('Primary AI failed, trying fallback...', primaryError);
      try {
        return await callGemini(userMessage);
      } catch {
        try {
          return await callGroq(userMessage);
        } catch {
          return "Neural link disrupted. Check your API keys and network connection.";
        }
      }
    }
  }
};

# 🎤 Anchor AI — Hackathon Pitch Script

*Target Duration: 3 Minutes*

*Demo Setup: Open the browser to `localhost:5173`. Ensure some dummy data is already populated so the KPIs are live.*

**(0:00-0:30) 🪝 The Problem & The Hook**

"Hi Judges, we are the creators of Anchor AI.

Personal finance in India is broken. We have incredible tools to calculate numbers, but what we don’t have is cognitive, personalized execution. People are overwhelmed by Excel spreadsheets, calculating tax slabs, and determining the mathematically optimal way to pay down debt.

Worse, most 'AI Financial Assistants' on the market today are just ChatGPT wrappers — they hallucinate numbers, give non-compliant advice, and forget who you are the second you refresh the page.

We changed that. Anchor AI is an autonomous Wealth OS powered by a 5-step agentic pipeline and edge-native persistence, strictly governed by SEBI compliance guardrails."

**(0:30-1:15) 💻 The Live Architectures Demo**

*(Action: Click the "Finance Monitor" or "KPI" tab)*

"What you’re seeing here isn't just a dashboard. Every time the user interacts with the app, an orchestrator triggers 5 distinct agents running completely locally in our offline-first IndexedDB system.

*(Action: Click "Run Agent Pipeline")*

Watch this trace panel.
1. The **Profiler Agent** extracts the user's debts, assets, and goals.
2. The **Calculator Agent** does the deterministic math—no LLMs allowed here. It computes exact daily interest burn and FIRE trajectories.
3. The **Gemini Enricher** then takes those hard facts and generates personalized behavioral strategies—like switching from a Debt Snowball to an Avalanche.
4. The **Validator Agent** acts as our firewall, filtering everything to ensure SEBI adherence.
5. And finally, the **Publisher** writes the state immutably to the database.

It’s completely accountable and hallucination-proof."

**(1:15-2:00) 💰 The Verifiable Tax Engine**

*(Action: Go to Planner -> Tax Wizard tab)*

"One of the biggest issues with GenAI in fintech is the 'black box' problem. Users don't trust what they can't verify.

Look at our Tax Engine. We hardcoded the exact FY2024-25 old regime slabs, including the Section 87A rebate math. We render a step-by-step verifiable breakdown so the user (and you as judges) can see *exactly* how every rupee is taxed, right before the AI adds its qualitative advice.

Trust through transparency."

**(2:00-2:30) 🤖 Andy AI & The Supreme Core**

*(Action: Go to Andy AI chatbot, show the "Voice ON" button and Supreme Core UI)*

"And for human interaction, we have Andy AI, our *Supreme Core*. Andy has voice input/output, real-time multilingual support, and native receipt scanning via your phone camera.

Because we store the state locally via Dexie.js, Andy always maintains full context of your financial life across sessions, with zero PII sent to cloud servers."

**(2:30-3:00) 🏆 The Closing**

"In a world of thin wrappers, Anchor AI has genuine technical depth: an autonomous 5-agent pipeline, hardcoded compliant math, strict SEBI regulations, and an aggressively beautiful, zero-latency user interface.

It’s production-ready, highly compliant, and built to scale on Vercel today.

Thank you."

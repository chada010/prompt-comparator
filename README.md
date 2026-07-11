# Prompt Comparator

A side-by-side LLM prompt comparison tool. Send the same prompt to multiple models simultaneously and watch their responses stream in real time.

## Features

- Compare up to 4 models at once
- Streaming responses (tokens appear as they arrive)
- Supports GPT, DeepSeek, Qwen, and GLM via OpenAI-compatible APIs
- Mobile-friendly responsive layout

## Git Collaboration Practice

This repository includes a small GitHub pull request workflow practice.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [openai](https://www.npmjs.com/package/openai) npm package (OpenAI-compatible format)
- Deployed on [Vercel](https://vercel.com/)

## Local Development

**1. Clone the repo**

```bash
git clone https://github.com/chada010/prompt-comparator.git
cd prompt-comparator
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

```
GPT_BASE_URL=https://your-proxy/v1
GPT_API_KEY=your-key

DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your-key

DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=your-key
```

**4. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Known Limitations

- No conversation history — each run is a single-turn request
- No system prompt input (planned)
- API keys are provider-specific; the app does not support arbitrary OpenAI-compatible endpoints from the UI
- Deployed on Vercel Hobby plan; API calls time out after 10 seconds (affects long responses)
- Public URL requires VPN in mainland China (`vercel.app` is blocked); custom domain binding failed due to DNS provider not supporting TXT records

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev    # start dev server (localhost:3000)
npm run build  # production build
npm run lint   # ESLint
```

## Architecture

Single-page app with one API route:

- `app/page.tsx` — shell: header + `<Comparator>`
- `app/components/Comparator.tsx` — all UI state (`'use client'`). Manages panels array, streams responses from `/api/run` concurrently via `ReadableStream` / `getReader()`.
- `app/api/run/route.ts` — POST handler. Routes to the correct OpenAI-compatible client based on model name prefix (`gpt-` → GPT proxy, `qwen`/`glm-` → DashScope, default → DeepSeek). Returns a plain-text `ReadableStream`.

## Provider routing

Model prefix → env vars used:

| Prefix | BASE_URL var | API_KEY var |
|--------|-------------|-------------|
| `gpt-` | `GPT_BASE_URL` | `GPT_API_KEY` |
| `qwen` / `glm-` | `DASHSCOPE_BASE_URL` | `DASHSCOPE_API_KEY` |
| anything else | `DEEPSEEK_BASE_URL` | `DEEPSEEK_API_KEY` |

Add a new provider by adding a branch in `getClient()` in `app/api/run/route.ts` and adding the model id to `MODELS` in `app/components/Comparator.tsx`.

## Environment

Copy `env.example` to `.env.local`. All six vars must be set for all three providers to work.

import OpenAI from "openai";

function getClient(model: string): OpenAI {
  if (model.startsWith("gpt-")) {
    return new OpenAI({
      baseURL: process.env.GPT_BASE_URL,
      apiKey: process.env.GPT_API_KEY,
    });
  }
  if (model.startsWith("qwen") || model.startsWith("glm-")) {
    return new OpenAI({
      baseURL: process.env.DASHSCOPE_BASE_URL,
      apiKey: process.env.DASHSCOPE_API_KEY,
    });
  }
  return new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

export async function POST(request: Request) {
  const { model, prompt, systemPrompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response("prompt is required", { status: 400 });
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt?.trim()) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  let stream;
  try {
    stream = await getClient(model).chat.completions.create({
      model,
      messages,
      stream: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

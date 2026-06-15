"use client";

import { useState } from "react";

const MODELS = [
  "claude-sonnet-4-6",
  "deepseek-chat",
  "deepseek-reasoner",
];

interface Panel {
  model: string;
  output: string;
  loading: boolean;
}

function OutputPanel({
  panel,
  index,
  onModelChange,
}: {
  panel: Panel;
  index: number;
  onModelChange: (index: number, model: string) => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <select
          value={panel.model}
          onChange={(e) => onModelChange(index, e.target.value)}
          className="text-sm bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm whitespace-pre-wrap">
        {panel.output ? (
          <>
            {panel.output}
            {panel.loading && (
              <span className="animate-pulse text-zinc-400">▌</span>
            )}
          </>
        ) : panel.loading ? (
          <span className="text-zinc-400 animate-pulse">Generating…</span>
        ) : (
          <span className="text-zinc-400">Output will appear here.</span>
        )}
      </div>
    </div>
  );
}

export default function Comparator() {
  const [panels, setPanels] = useState<Panel[]>([
    { model: MODELS[0], output: "", loading: false },
    { model: MODELS[1], output: "", loading: false },
  ]);
  const [prompt, setPrompt] = useState("");

  function handleModelChange(index: number, model: string) {
    setPanels((prev) =>
      prev.map((p, i) => (i === index ? { ...p, model } : p))
    );
  }

  function addPanel() {
    if (panels.length >= 4) return;
    setPanels((prev) => [
      ...prev,
      { model: MODELS[0], output: "", loading: false },
    ]);
  }

  function removePanel(index: number) {
    if (panels.length <= 2) return;
    setPanels((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleRun() {
    if (!prompt.trim()) return;

    setPanels((prev) => prev.map((p) => ({ ...p, loading: true, output: "" })));

    const snapshot = panels.map((p) => p.model);

    await Promise.all(
      snapshot.map(async (model, i) => {
        try {
          const res = await fetch("/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt }),
          });

          if (!res.ok || !res.body) {
            const err = await res.text();
            setPanels((prev) =>
              prev.map((p, j) =>
                j === i ? { ...p, loading: false, output: `Error: ${err}` } : p
              )
            );
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setPanels((prev) =>
              prev.map((p, j) =>
                j === i ? { ...p, output: p.output + chunk } : p
              )
            );
          }
        } catch (err) {
          setPanels((prev) =>
            prev.map((p, j) =>
              j === i
                ? { ...p, output: `Error: ${err instanceof Error ? err.message : String(err)}` }
                : p
            )
          );
        } finally {
          setPanels((prev) =>
            prev.map((p, j) => (j === i ? { ...p, loading: false } : p))
          );
        }
      })
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-1 min-h-0 divide-x divide-zinc-200 dark:divide-zinc-800">
        {panels.map((panel, i) => (
          <div key={i} className="flex flex-col flex-1 min-w-0 relative">
            {panels.length > 2 && (
              <button
                onClick={() => removePanel(i)}
                className="absolute top-2 right-2 z-10 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Remove panel"
              >
                ✕
              </button>
            )}
            <OutputPanel panel={panel} index={i} onModelChange={handleModelChange} />
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-4 flex gap-3 items-end bg-background">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
          }}
          placeholder="Enter your prompt… (Cmd+Enter to run)"
          rows={3}
          className="flex-1 resize-none rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRun}
            disabled={!prompt.trim() || panels.some((p) => p.loading)}
            className="px-4 py-2 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Run
          </button>
          {panels.length < 4 && (
            <button
              onClick={addPanel}
              className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              + Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

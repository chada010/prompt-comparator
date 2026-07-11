"use client";

import { useEffect, useRef, useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

export default function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  function showStatus(nextStatus: Exclude<CopyStatus, "idle">) {
    if (feedbackTimer.current !== null) {
      window.clearTimeout(feedbackTimer.current);
    }

    setStatus(nextStatus);
    feedbackTimer.current = window.setTimeout(() => {
      setStatus("idle");
      feedbackTimer.current = null;
    }, 2000);
  }

  async function handleCopy() {
    if (!text) return;

    if (!navigator.clipboard) {
      showStatus("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showStatus("copied");
    } catch {
      showStatus("failed");
    }
  }

  const label =
    status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className="ml-auto text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={label}
    >
      {label}
    </button>
  );
}

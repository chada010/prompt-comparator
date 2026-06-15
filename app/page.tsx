import Comparator from "./components/Comparator";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <h1 className="text-base font-semibold tracking-tight">Prompt Comparator</h1>
      </header>
      <Comparator />
    </div>
  );
}

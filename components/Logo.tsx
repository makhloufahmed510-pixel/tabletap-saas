export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-cream" : "text-ink";
  return (
    <span className={`font-display italic text-xl tracking-tight ${color}`}>
      TableTap
      <span className="not-italic align-super text-[0.5em] ml-0.5">●</span>
    </span>
  );
}

const COLORS = [
  "var(--primary)",
  "var(--sunny)",
  "var(--coral)",
  "var(--success)",
  "var(--accent)",
];

export function Confetti({ pieces = 60 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px] animate-confetti"
          style={{
            left: `${(i * 97) % 100}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animationDelay: `${(i % 12) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

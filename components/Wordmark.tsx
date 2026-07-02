// The wordmark encodes the mechanic: the "i" dot is a layer that flips between
// the streaming (teal) and compute (amber) states — the product in miniature.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-mono text-[1.05rem] font-semibold tracking-tight text-text ${className}`}
      aria-label="flip"
    >
      <span aria-hidden>fl</span>
      <span className="relative inline-flex flex-col items-center px-[0.05em]" aria-hidden>
        <span className="flip-dot mb-[0.12em] h-[0.28em] w-[0.28em] rounded-[1px]" />
        <span>ı</span>
      </span>
      <span aria-hidden>p</span>
    </span>
  );
}

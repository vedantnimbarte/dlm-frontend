// The wordmark encodes the mechanic: a state pip trails the name — a single
// layer streaming through VRAM, toggling between the streaming (teal) and
// compute (amber) states. dlm = Dynamic LLM, the product in miniature.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-mono text-[1.05rem] font-semibold tracking-tight text-text ${className}`}
      aria-label="dlm"
    >
      <span aria-hidden>dlm</span>
      <span
        className="dlm-dot ml-[0.16em] h-[0.28em] w-[0.28em] self-end rounded-[1px]"
        aria-hidden
      />
    </span>
  );
}

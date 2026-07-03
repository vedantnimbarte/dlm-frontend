import Image from "next/image";

// The brushed-steel hex mark is the brand — it replaces the old text wordmark.
// The mark ships with its own soft dark vignette, so it seats cleanly on the
// frosted-glass nav without a visible tile edge. On hover it lifts and picks up
// a faint teal rim (see .logo-mark in globals) — a quiet nod to the product.
export function Logo({
  size = 30,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt="flip"
      width={size}
      height={size}
      priority={priority}
      className={`logo-mark ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

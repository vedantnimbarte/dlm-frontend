// Fixed ambient stack that sits behind every page: a slow-drifting brand
// aurora (teal · amber · indigo) for the frosted glass to refract, a fine
// film grain for texture, and an edge vignette to hold the near-black frame.
// Pure CSS — no client JS; motion is frozen under prefers-reduced-motion.
export function AuroraBackground() {
  return (
    <>
      <div className="aurora" aria-hidden>
        <span className="aurora__blob aurora__blob--1" />
        <span className="aurora__blob aurora__blob--2" />
        <span className="aurora__blob aurora__blob--3" />
      </div>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}

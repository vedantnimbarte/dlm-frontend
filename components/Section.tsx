import { Reveal } from "./Reveal";

// Section shell with hairline top rule and an eyebrow that encodes real
// structure (the zone/stage it describes), per §6.4.
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`rule ${className}`}>
      <div className="shell py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-text">
              {title}
            </h2>
            {intro ? (
              <p className="mt-4 text-lg leading-relaxed text-text-muted">
                {intro}
              </p>
            ) : null}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

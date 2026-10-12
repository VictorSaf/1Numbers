import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Mounts its children the first time they come near the viewport.
 *
 * The charts on the reading page were lazily *imported* but eagerly *mounted*:
 * React.lazy starts fetching the chunk the moment the component renders, so
 * Recharts -- the heaviest dependency on the page -- was downloaded for every
 * reader, including the ones who never scrolled far enough to see a chart.
 *
 * Once visible, it stays mounted: a chart that disappears when scrolled past is
 * worse than one that loads a moment late.
 */
export const WhenVisible = ({
  children,
  fallback = null,
  /** How early to start, so the chunk is usually there by the time it is read. */
  rootMargin = "300px",
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver -- old browsers, some test environments -- means
    // rendering everything is the only correct answer.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
};

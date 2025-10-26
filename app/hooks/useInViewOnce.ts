import * as React from "react";

/**
 * Observe satu elemen sampai pertama kali terlihat (isIntersecting = true),
 * lalu `disconnect()` agar animasi hanya terjadi sekali.
 * Generic <T> dipakai agar ref bisa ditempel ke elemen apapun (div, a, img, dll).
 */
export function useInViewOnce<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || inView) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
        ...options,
      }
    );

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, options]);

  return { ref, inView };
}

export default useInViewOnce;

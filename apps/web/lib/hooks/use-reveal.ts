'use client';

import { useEffect, useRef, useState } from 'react';

/** Añade la clase `gws-reveal--in` cuando el elemento entra en viewport.
 * Respeta prefers-reduced-motion: si está activo, figura visible de una. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(prefersReduced = false) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  return { ref, visible };
}
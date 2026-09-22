'use client';

import { useEffect, useRef, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export function useCountUp(target: number, { duration = 800, start = 0, delay = 0 }: { duration?: number; start?: number; delay?: number } = {}) {
  const [value, setValue] = useState(start);
  const currentRef = useRef(start);

  useEffect(() => {
    if (target === currentRef.current) return;
    let raf = 0;
    let t0 = 0;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / duration);
      const v = start + (target - start) * (1 - Math.pow(1 - p, 3));
      currentRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const timeout = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, start, delay]);

  return value;
}
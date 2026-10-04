'use client';

import { useEffect, useState } from 'react';

export function WelcomeVideo() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);

  if (reduced) {
    return (
      <img
        src="/welcome/intro-poster.jpg"
        alt="Glass World Studio"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/welcome/intro-poster.jpg"
      className="absolute inset-0 z-0 h-full w-full object-cover"
      aria-hidden="true"
    >
      <source src="/welcome/intro.webm" type="video/webm" />
      <source src="/welcome/intro.mp4" type="video/mp4" />
    </video>
  );
}
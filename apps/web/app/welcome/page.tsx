'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeVideo } from '@/components/welcome/WelcomeVideo';
import { WelcomeCta } from '@/components/welcome/WelcomeCta';

type Stage = 'playing' | 'title' | 'cta' | 'exiting';

export default function WelcomePage() {
  const [stage, setStage] = useState<Stage>('playing');
  const router = useRouter();

  useEffect(() => {
    const titleTimer = setTimeout(() => setStage('title'), 6000);
    const ctaTimer = setTimeout(() => setStage('cta'), 8000);
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(ctaTimer);
    };
  }, []);

  function handleEnter() {
    setStage('exiting');
    setTimeout(() => router.push('/umbral'), 400);
  }

  return (
    <main
      aria-label="Glass World Studio"
      onClick={handleEnter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleEnter();
      }}
      tabIndex={0}
      className="relative h-[100dvh] w-screen overflow-hidden bg-[#030712] cursor-pointer"
      style={{ opacity: stage === 'exiting' ? 0 : 1, transition: 'opacity 400ms ease-out' }}
    >
      <WelcomeVideo />

      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 0%, rgba(3,7,18,0.6) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div
          aria-live="polite"
          className="transition-all duration-500 ease-out"
          style={{
            opacity: stage === 'title' || stage === 'cta' ? 1 : 0,
            transform: stage === 'title' || stage === 'cta' ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h1
            className="text-[#FFD700]"
            style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              letterSpacing: '0.2em',
              lineHeight: 1.05,
              textShadow: '0 0 30px rgba(255,215,0,0.4)',
              margin: 0,
            }}
          >
            GLASS WORLD STUDIO
          </h1>
          <p
            className="mt-4 text-[#52525b]"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875rem',
              letterSpacing: '0.4em',
            }}
          >
            ◈ GWS ◈
          </p>
        </div>

        <div className="mt-12">
          <WelcomeCta
            visible={stage === 'cta' || stage === 'exiting'}
            label="ENTRAR"
            onClick={handleEnter}
          />
        </div>
      </div>
    </main>
  );
}

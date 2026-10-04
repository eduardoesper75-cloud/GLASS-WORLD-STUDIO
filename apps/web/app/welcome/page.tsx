'use client';

import Link from 'next/link';

export default function UmbralPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#030712',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontSize: '64px',
          color: '#FFD700',
          marginBottom: '16px',
          textShadow: '0 0 30px rgba(255,215,0,0.4)',
        }}>
          ◈
        </div>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          color: '#FFD700',
          letterSpacing: '0.2em',
          margin: '0 0 16px 0',
          fontWeight: 500,
        }}>
          EL UMBRAL
        </h1>
        <p style={{
          color: '#a1a1aa',
          fontSize: '1.125rem',
          lineHeight: 1.6,
          margin: '0 0 48px 0',
        }}>
          La puerta de entrada al ecosistema global del vidrio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/register" style={{
            background: '#FFD700',
            color: '#030712',
            padding: '16px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 500,
            letterSpacing: '0.05em',
            display: 'block',
          }}>
            CREAR CUENTA
          </Link>
          <Link href="/login" style={{
            background: 'transparent',
            color: '#f4f4f5',
            padding: '16px 32px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'block',
          }}>
            YA TENGO CUENTA
          </Link>
        </div>

        <Link href="/welcome" style={{
          display: 'inline-block',
          marginTop: '32px',
          color: '#52525b',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          ← Volver
        </Link>
      </div>
    </main>
  );
}
'use client';

import type { ReactNode } from 'react';

/** Ambient galaxy-themed backdrop. Nivel de vitral alto por inmersión. */
export function GalaxyDash({ galaxy = 'g2', children }: { galaxy?: string; children: ReactNode }) {
  return (
    <div className="gw-app" data-galaxy={galaxy} data-oob-vetron={galaxy} style={{ position: 'relative' }}>
      {children}
    </div>
  );
}
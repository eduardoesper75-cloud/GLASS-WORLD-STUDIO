const isProduction = process.env.NODE_ENV === 'production';

// Cabeceras de seguridad: definidas a nivel de aplicación (Next) en lugar de solo
// en `vercel.json`, para que se apliquen en cualquier hosting y sean verificables
// localmente con `next start`.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  // Solo en producción para no envenenar la caché local en dev.
  ...(isProduction
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      // `ws:`/`wss:` evita romper el HMR de `next dev`; en producción no hay conexiones salientes.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El motor se consume como artefacto ya compilado (dist), no se re-empaqueta.
  // Son paquetes ESM puros: en el servidor de Next se resuelven vía require(esm) de Node.
  serverExternalPackages: ['@gws/schemas', '@gws/taxonomy'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Firma inmutable de los assets compilados: la clave de contenido ya invalida la caché.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all\\.(svg|png|jpg|jpeg|webp|ico|woff2?)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El motor se consume como artefacto ya compilado (dist), no se re-empaqueta.
  // Son paquetes ESM puros: en el servidor de Next se resuelven vía require(esm) de Node.
  serverExternalPackages: ['@gws/schemas', '@gws/taxonomy'],
};

export default nextConfig;

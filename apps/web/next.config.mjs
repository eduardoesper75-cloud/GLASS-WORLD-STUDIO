/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite consumir los paquetes del workspace directamente desde su código fuente.
  transpilePackages: ['@gws/schemas', '@gws/taxonomy'],
};

export default nextConfig;

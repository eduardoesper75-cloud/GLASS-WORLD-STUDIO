const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'welcome');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const svg = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1a1408"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#glow)"/>
  <text x="960" y="500" font-family="Georgia, serif" font-size="110"
        fill="#FFD700" text-anchor="middle" letter-spacing="12"
        opacity="0.95">GLASS WORLD STUDIO</text>
  <g fill="none" stroke="#52525b" stroke-width="2.5">
    <path d="M 812 590 l 14 -14 l 14 14 l -14 14 Z"/>
    <path d="M 1080 590 l 14 -14 l 14 14 l -14 14 Z"/>
  </g>
  <text x="960" y="602" font-family="monospace" font-size="28"
        fill="#52525b" text-anchor="middle" letter-spacing="18">GWS</text>
</svg>`;

sharp(Buffer.from(svg))
  .jpeg({ quality: 85 })
  .toFile(path.join(OUT_DIR, 'intro-poster.jpg'))
  .then((info) => console.log('Poster generado OK', info.width + 'x' + info.height, info.size + ' bytes'))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
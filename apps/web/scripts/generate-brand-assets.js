const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const PUB_DIR = path.join(__dirname, '..', 'public');

const BG = '#030712';
const GOLD = '#FFD700';
const DIM = '#52525b';

const backdrop = (w, h) => `
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#1a1408"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>`;

const diamond = (cx, cy, r, stroke, width) =>
  `<path d="M ${cx} ${cy - r} l ${r} ${r} l ${-r} ${r} l ${-r} ${-r} Z"
         fill="none" stroke="${stroke}" stroke-width="${width}"/>`;

const jobs = [];

// --- icon.png (256x256) ---------------------------------------------------
// Next.js metadata convention: app/icon.png. 256 en vez de 32 para que se vea
// nítido en displays hi-dpi; Next genera los <link> de favicon desde acá.
const ICON = 256;
const iconSvg = `<svg width="${ICON}" height="${ICON}" xmlns="http://www.w3.org/2000/svg">
  ${backdrop(ICON, ICON)}
  ${diamond(ICON / 2, ICON / 2, 62, GOLD, 7)}
  ${diamond(ICON / 2, ICON / 2, 30, GOLD, 4)}
</svg>`;

jobs.push(
  sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(APP_DIR, 'icon.png'))
    .then((i) => console.log('app/icon.png          ', i.width + 'x' + i.height, i.size + ' B'))
);

// --- opengraph-image.jpg (1200x630) ---------------------------------------
// Convention de Next: app/opengraph-image.jpg -> se inyecta solo en <meta>.
const OW = 1200;
const OH = 630;
const ogSvg = `<svg width="${OW}" height="${OH}" xmlns="http://www.w3.org/2000/svg">
  ${backdrop(OW, OH)}
  <text x="600" y="290" font-family="Georgia, serif" font-size="72"
        fill="${GOLD}" text-anchor="middle" letter-spacing="8">GLASS WORLD STUDIO</text>
  ${diamond(430, 355, 15, DIM, 2.5)}
  ${diamond(770, 355, 15, DIM, 2.5)}
  <text x="600" y="370" font-family="monospace" font-size="24"
        fill="${DIM}" text-anchor="middle" letter-spacing="16">GWS</text>
</svg>`;

jobs.push(
  sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 88 })
    .toFile(path.join(APP_DIR, 'opengraph-image.jpg'))
    .then((i) => console.log('app/opengraph-image   ', i.width + 'x' + i.height, i.size + ' B'))
);

// --- public/og-image.jpg (mismo asset, servible por URL) -------------------
jobs.push(
  sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 88 })
    .toFile(path.join(PUB_DIR, 'og-image.jpg'))
    .then((i) => console.log('public/og-image.jpg   ', i.width + 'x' + i.height, i.size + ' B'))
);

Promise.all(jobs)
  .then(() => console.log('Brand assets OK'))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
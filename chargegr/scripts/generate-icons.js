const fs = require('fs');
const path = require('path');

// Generate a simple SVG icon for ChargeGR
function createSvg(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = innerSize / 2;

  // Lightning bolt path scaled to icon size
  const scale = innerSize / 100;
  const tx = cx - 50 * scale;
  const ty = cy - 50 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.2}" fill="#1B7B4E"/>
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <polygon points="55,5 20,55 45,55 35,95 75,40 50,40" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Write SVGs (will convert to PNG next)
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSvg(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSvg(512));
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.svg'), createSvg(512, true));

console.log('SVG icons generated in public/icons/');

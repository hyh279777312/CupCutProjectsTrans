const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Create high-definition macOS style vector SVG (1024x1024)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Squircle Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181a26"/>
      <stop offset="40%" stop-color="#0e1017"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>

    <!-- Metallic Rim Gradient -->
    <linearGradient id="rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.8"/>
      <stop offset="35%" stop-color="#06b6d4" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#a855f7" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.9"/>
    </linearGradient>

    <!-- Inner Glow Gradient -->
    <radialGradient id="inner-glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Neon Cyan to Violet Accent -->
    <linearGradient id="neon-accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>

    <!-- Box Gold / Amber Accent -->
    <linearGradient id="box-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e2438"/>
      <stop offset="100%" stop-color="#111420"/>
    </linearGradient>

    <linearGradient id="lid-grad" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#312e81"/>
      <stop offset="50%" stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>

    <!-- Drop Shadow for macOS icon -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
    </filter>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <clipPath id="squircle-clip">
      <rect x="64" y="64" width="896" height="896" rx="200" ry="200"/>
    </clipPath>
  </defs>

  <!-- Outer Shadow Frame -->
  <g filter="url(#shadow)">
    <!-- Base macOS Squircle -->
    <rect x="64" y="64" width="896" height="896" rx="200" ry="200" fill="url(#bg-grad)"/>
    <!-- Metallic Border Rim -->
    <rect x="64" y="64" width="896" height="896" rx="200" ry="200" fill="none" stroke="url(#rim-grad)" stroke-width="8"/>
  </g>

  <!-- Clipped Interior Contents -->
  <g clip-path="url(#squircle-clip)">
    <!-- Radial Ambient Glow -->
    <rect x="64" y="64" width="896" height="896" fill="url(#inner-glow)"/>

    <!-- Subtle Grid Background -->
    <g opacity="0.08" stroke="#ffffff" stroke-width="1.5">
      <line x1="64" y1="280" x2="960" y2="280"/>
      <line x1="64" y1="420" x2="960" y2="420"/>
      <line x1="64" y1="560" x2="960" y2="560"/>
      <line x1="64" y1="700" x2="960" y2="700"/>
      <line x1="280" y1="64" x2="280" y2="960"/>
      <line x1="420" y1="64" x2="420" y2="960"/>
      <line x1="560" y1="64" x2="560" y2="960"/>
      <line x1="700" y1="64" x2="700" y2="960"/>
    </g>

    <!-- Video Timeline Tracks Decorative Motif -->
    <g transform="translate(180, 200)">
      <!-- Track 1 (Cyan Video) -->
      <rect x="0" y="0" width="480" height="28" rx="14" fill="#0284c7" opacity="0.4"/>
      <rect x="60" y="0" width="240" height="28" rx="14" fill="#38bdf8" opacity="0.9"/>
      <rect x="330" y="0" width="180" height="28" rx="14" fill="#0ea5e9" opacity="0.8"/>

      <!-- Track 2 (Indigo Video / PIP) -->
      <rect x="0" y="44" width="660" height="28" rx="14" fill="#312e81" opacity="0.4"/>
      <rect x="120" y="44" width="360" height="28" rx="14" fill="#6366f1" opacity="0.85"/>
      <rect x="510" y="44" width="120" height="28" rx="14" fill="#818cf8" opacity="0.8"/>

      <!-- Track 3 (Emerald Audio) -->
      <rect x="0" y="88" width="580" height="24" rx="12" fill="#065f46" opacity="0.3"/>
      <rect x="40" y="88" width="420" height="24" rx="12" fill="#10b981" opacity="0.85"/>
      <rect x="480" y="88" width="140" height="24" rx="12" fill="#34d399" opacity="0.75"/>

      <!-- Playhead Needle -->
      <line x1="260" y1="-20" x2="260" y2="135" stroke="#f43f5e" stroke-width="4"/>
      <polygon points="252,-20 268,-20 260,-8" fill="#f43f5e"/>
    </g>

    <!-- Main Subject: 3D High-Tech Archive Package Box with Glowing Media Ingestion -->
    <g transform="translate(262, 400)" filter="url(#glow)">
      <!-- Isometric Package Base -->
      <path d="M250 80 L460 190 L460 410 L250 510 L40 410 L40 190 Z" fill="url(#box-grad)" stroke="#4338ca" stroke-width="4"/>

      <!-- Left Face -->
      <path d="M40 190 L250 300 L250 510 L40 410 Z" fill="#131726" stroke="#2e3856" stroke-width="2"/>

      <!-- Right Face -->
      <path d="M250 300 L460 190 L460 410 L250 510 Z" fill="#181d30" stroke="#374151" stroke-width="2"/>

      <!-- Top Lid -->
      <path d="M250 80 L460 190 L250 300 L40 190 Z" fill="url(#lid-grad)" stroke="#6366f1" stroke-width="3"/>

      <!-- Packaging Ribbon / Straps (Cyan & Violet Neon) -->
      <!-- Vertical Strap -->
      <path d="M225 93 L275 119 L275 300 L225 300 Z" fill="url(#neon-accent)" opacity="0.9"/>
      <path d="M225 300 L275 300 L275 498 L225 510 Z" fill="url(#neon-accent)" opacity="0.85"/>

      <!-- Central Zero-Loss Shield / Seal Emblem -->
      <g transform="translate(250, 300)">
        <circle cx="0" cy="0" r="56" fill="#0c0e17" stroke="url(#neon-accent)" stroke-width="6"/>
        <circle cx="0" cy="0" r="42" fill="#1e1b4b" opacity="0.8"/>

        <!-- Stylized "JY" / Fast Arrow Pack Icon -->
        <path d="M-18 -14 L0 -26 L18 -14 L18 10 L0 22 L-18 10 Z" fill="none" stroke="#38bdf8" stroke-width="4"/>
        <path d="M0 -14 L0 12 M-10 -2 L0 8 L10 -2" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>

    <!-- Sleek Top Gloss Reflection (macOS Glassmorphism highlight) -->
    <path d="M64 64 L960 64 C960 64 880 340 512 340 C144 340 64 64 64 64 Z" fill="url(#neon-accent)" opacity="0.06"/>

    <!-- Bottom "V2 PRO" Pill Badge -->
    <g transform="translate(420, 830)">
      <rect x="0" y="0" width="184" height="42" rx="21" fill="#111827" stroke="#3b82f6" stroke-width="2" opacity="0.95"/>
      <text x="92" y="27" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#38bdf8" text-anchor="middle" letter-spacing="3">ZERO LOSS</text>
    </g>
  </g>
</svg>`;

// Ensure directories exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG
const svgPath = path.join(publicDir, 'app-icon.svg');
fs.writeFileSync(svgPath, svgContent, 'utf-8');
console.log('✓ Created SVG icon:', svgPath);

// Also create a pure Node-based high-res PNG encoder
// A standard PNG has IHDR, IDAT (deflated raw scanlines), and IEND chunks.
function createPngBuffer(width, height, drawPixelFn) {
  // RGBA 4 bytes per pixel + 1 filter byte per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const makeChunk = (type, data) => {
    const typeBuf = Buffer.from(type);
    const len = data.length;
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(len, 0);

    const crcBuf = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcBuf);
    const crcOut = Buffer.alloc(4);
    crcOut.writeUInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcOut]);
  };

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Render 512x512 macOS Squircle icon with gradient, film tracks, box, and zero-loss badge
const size = 512;
const pngBuf = createPngBuffer(size, size, (x, y, w, h) => {
  // Squircle distance check: superellipse or rounded rect
  const pad = 32;
  const radius = 100;
  const inBox = (x >= pad && x <= w - pad && y >= pad && y <= h - pad);

  // Corner radius check
  let insideSquircle = true;
  const cx = x < pad + radius ? pad + radius : (x > w - pad - radius ? w - pad - radius : x);
  const cy = y < pad + radius ? pad + radius : (y > h - pad - radius ? h - pad - radius : y);
  const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
  if (distSq > radius * radius) {
    insideSquircle = false;
  }

  if (!insideSquircle) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Metallic rim edge check (2px border)
  const isBorder = (distSq > (radius - 4) * (radius - 4)) ||
                   (x < pad + 4 || x > w - pad - 4 || y < pad + 4 || y > h - pad - 4);

  const nx = x / w;
  const ny = y / h;

  if (isBorder) {
    // Gradient rim: Cyan (#38bdf8) -> Violet (#a855f7)
    const t = (nx + ny) / 2;
    const r = Math.round(56 + t * 112);
    const g = Math.round(189 - t * 70);
    const b = Math.round(248);
    return [r, g, b, 255];
  }

  // Inside background: Dark Obsidian Gradient with ambient glow
  const grad = 0.08 + 0.12 * (1 - ny);
  let r = Math.round(16 + grad * 30);
  let g = Math.round(18 + grad * 35);
  let b = Math.round(26 + grad * 50);

  // Decorative Timeline Tracks in upper region (y: 100..180)
  if (y >= 100 && y <= 118 && x >= 100 && x <= 412) {
    // Main video track cyan
    if (x >= 140 && x <= 280) { return [56, 189, 248, 240]; }
    if (x >= 300 && x <= 390) { return [14, 165, 233, 220]; }
    return [2, 132, 199, 90];
  }
  if (y >= 126 && y <= 144 && x >= 100 && x <= 412) {
    // PIP track indigo
    if (x >= 160 && x <= 340) { return [99, 102, 241, 230]; }
    return [49, 46, 129, 90];
  }
  if (y >= 152 && y <= 168 && x >= 100 && x <= 412) {
    // Audio track emerald
    if (x >= 120 && x <= 360) { return [16, 185, 129, 230]; }
    return [6, 95, 70, 90];
  }

  // Red playhead vertical line at x = 240
  if (x >= 238 && x <= 241 && y >= 90 && y <= 180) {
    return [244, 63, 94, 255];
  }

  // Archive 3D Package in center region (y: 200..410, x: 130..382)
  const boxCx = 256;
  const boxCy = 300;
  const dx = x - boxCx;
  const dy = y - boxCy;

  // Diamond / Hexagonal Isometric Box
  const inIsometric = Math.abs(dx) * 0.5 + Math.abs(dy) * 0.7 < 90;
  if (inIsometric) {
    // Isometric lid vs sides
    if (dy < 0) {
      // Lid: Indigo Gradient (#4338ca)
      return [67, 56, 202, 255];
    } else if (dx < 0) {
      // Left side: darker
      return [24, 29, 48, 255];
    } else {
      // Right side: medium
      return [35, 42, 68, 255];
    }
  }

  // Central Zero-Loss Seal Circle at (256, 300) radius 36
  const sealDistSq = dx * dx + dy * dy;
  if (sealDistSq <= 36 * 36) {
    if (sealDistSq >= 30 * 30) {
      // Cyan/Violet border
      return [56, 189, 248, 255];
    }
    // Seal interior
    if (Math.abs(dx) <= 3 && Math.abs(dy) <= 18) return [56, 189, 248, 255]; // arrow vertical
    if (Math.abs(dx) <= 14 && Math.abs(dy - 4) <= 3) return [192, 132, 252, 255]; // arrow bar
    return [15, 23, 42, 255];
  }

  // "ZERO LOSS" pill in bottom (y: 430..460, x: 200..312)
  if (y >= 430 && y <= 456 && x >= 180 && x <= 332) {
    const pillR = 13;
    const px = Math.max(180 + pillR, Math.min(332 - pillR, x));
    const py = 443;
    if ((x - px) * (x - px) + (y - py) * (y - py) <= pillR * pillR) {
      if ((x - px) * (x - px) + (y - py) * (y - py) >= (pillR - 2) * (pillR - 2)) {
        return [56, 189, 248, 255]; // Border
      }
      return [17, 24, 39, 240];
    }
  }

  return [r, g, b, 255];
});

const pngPath = path.join(publicDir, 'app-icon.png');
fs.writeFileSync(pngPath, pngBuf);
console.log('✓ Created PNG icon:', pngPath, `(${pngBuf.length} bytes)`);

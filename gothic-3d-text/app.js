const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d', { alpha: true });

const fonts = [
  'UnifrakturCook', 'Pirata One', 'Jacquard 12', 'UnifrakturMaguntia', 'Metal Mania',
  'New Rocker', 'MedievalSharp', 'Creepster', 'Frijole', 'Rye', 'Sancreek', 'Ewert',
  'Monoton', 'Faster One', 'Rubik Glitch', 'Rubik Iso', 'Rubik Moonrocks',
  'Bungee Shade', 'Black Ops One', 'Trade Winds', 'Press Start 2P', 'Silkscreen',
  'Libre Barcode 128 Text', 'Archivo Black', 'Bebas Neue'
];

const $ = (id) => document.getElementById(id);
const controls = {
  text: $('textInput'), font: $('fontSelect'), preset: $('presetSelect'),
  face: $('faceColor'), extrude: $('extrudeColor'), stroke: $('strokeColor'), bg: $('bgColor'),
  size: $('fontSize'), depth: $('depth'), angle: $('angle'), tailSpread: $('tailSpread'),
  perspective: $('perspective'), strokeWidth: $('strokeWidth'), letterSpacing: $('letterSpacing'),
  tilt: $('tilt'), speed: $('speed'), glitch: $('glitch'), rgbSplit: $('rgbSplit'),
  blur: $('blur'), quality: $('quality'), noise: $('noise'), scanlines: $('scanlines'), transparent: $('transparent'),
  pixelSnap: $('pixelSnap'), shadow: $('shadow'), centerGuide: $('centerGuide')
};

for (const font of fonts) {
  const opt = document.createElement('option');
  opt.value = font;
  opt.textContent = font;
  controls.font.append(opt);
}
controls.font.value = 'Pirata One';

const presets = {
  chrome:   { face:'#ffffff', extrude:'#aeb7c7', stroke:'#000000', bg:'#050505', font:'Pirata One', depth:92, angle:220, tailSpread:100, perspective:38, glitch:22, rgbSplit:18, noise:22, scanlines:18, blur:2 },
  gothic:   { face:'#ffffff', extrude:'#777777', stroke:'#000000', bg:'#030303', font:'UnifrakturCook', depth:95, angle:230, tailSpread:92, perspective:34, glitch:16, rgbSplit:10, noise:12, scanlines:12, blur:2 },
  blood:    { face:'#ffffff', extrude:'#b40020', stroke:'#140000', bg:'#050000', font:'Metal Mania', depth:125, angle:225, tailSpread:110, perspective:48, glitch:28, rgbSplit:30, noise:24, scanlines:25, blur:1 },
  toxic:    { face:'#d7ffd7', extrude:'#16ff56', stroke:'#001806', bg:'#000000', font:'Rubik Glitch', depth:72, angle:215, tailSpread:120, perspective:20, glitch:55, rgbSplit:60, noise:34, scanlines:45, blur:0 },
  inferno:  { face:'#ffffff', extrude:'#ff4b00', stroke:'#240000', bg:'#080000', font:'New Rocker', depth:120, angle:222, tailSpread:102, perspective:44, glitch:14, rgbSplit:8, noise:18, scanlines:10, blur:2 },
  bubblegum:{ face:'#ffd6f5', extrude:'#8f6cff', stroke:'#18001d', bg:'#090012', font:'Monoton', depth:82, angle:225, tailSpread:105, perspective:28, glitch:20, rgbSplit:28, noise:10, scanlines:8, blur:1 },
  void:     { face:'#f2f2f2', extrude:'#202020', stroke:'#000000', bg:'#000000', font:'Black Ops One', depth:150, angle:228, tailSpread:90, perspective:32, glitch:70, rgbSplit:55, noise:60, scanlines:50, blur:3 },
  acid:     { face:'#f7ff00', extrude:'#ff2a2a', stroke:'#000000', bg:'#070707', font:'Frijole', depth:80, angle:220, tailSpread:115, perspective:36, glitch:38, rgbSplit:48, noise:30, scanlines:30, blur:1 }
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function mix(a, b, t) { return a + (b - a) * t; }
function shade(hex, i, depth) {
  const [r, g, b] = hexToRgb(hex);
  const k = 0.25 + 0.75 * (i / Math.max(1, depth));
  return `rgb(${Math.round(mix(0, r, k))},${Math.round(mix(0, g, k))},${Math.round(mix(0, b, k))})`;
}
function rand01(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

const measureCache = new Map();
function getCharWidths(context, font, text, spacing) {
  const key = `${font}|${spacing}|${text}`;
  if (measureCache.has(key)) return measureCache.get(key);
  const lines = text.split('\n').map(line => {
    const chars = [...line];
    const widths = chars.map(ch => context.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * spacing;
    return { chars, widths, total };
  });
  if (measureCache.size > 80) measureCache.clear();
  measureCache.set(key, lines);
  return lines;
}

function drawSpacedText(context, text, x, y, spacing, mode = 'fill') {
  const font = context.font;
  const lines = getCharWidths(context, font, text, spacing);
  const lineHeight = Number(controls.size.value) * 0.9;
  lines.forEach((line, lineIndex) => {
    let cx = x - line.total / 2;
    const yy = y + (lineIndex - (lines.length - 1) / 2) * lineHeight;
    for (let i = 0; i < line.chars.length; i++) {
      const w = line.widths[i];
      if (mode === 'stroke') context.strokeText(line.chars[i], cx + w / 2, yy);
      else context.fillText(line.chars[i], cx + w / 2, yy);
      cx += w + spacing;
    }
  });
}

const fxCanvas = document.createElement('canvas');
const fxCtx = fxCanvas.getContext('2d', { alpha: true });
function copyToFx() {
  if (fxCanvas.width !== canvas.width || fxCanvas.height !== canvas.height) {
    fxCanvas.width = canvas.width;
    fxCanvas.height = canvas.height;
  }
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fxCtx.drawImage(canvas, 0, 0);
}

function applyGlitch(amount, rgbAmount, exportTime) {
  const strength = amount / 100;
  const rgb = rgbAmount / 100;
  if (strength <= 0 && rgb <= 0) return;

  const w = canvas.width, h = canvas.height;
  copyToFx();

  if (strength > 0) {
    // Slice tearing without getImageData; much faster on Safari/mobile.
    const slices = Math.floor(2 + strength * 24);
    for (let s = 0; s < slices; s++) {
      const y = Math.floor(rand01(exportTime * 3 + s * 19.17) * h);
      const sliceH = Math.max(2, Math.floor(2 + rand01(exportTime + s * 7.91) * (8 + strength * 42)));
      const dx = Math.floor((rand01(exportTime + s * 3.33) - 0.5) * strength * 190);
      ctx.drawImage(fxCanvas, 0, y, w, Math.min(sliceH, h - y), dx, y, w, Math.min(sliceH, h - y));
    }

    ctx.save();
    ctx.globalAlpha = 0.20 + strength * 0.50;
    for (let s = 0; s < Math.floor(1 + strength * 5); s++) {
      const y = Math.floor(h * (0.28 + rand01(exportTime * 4 + s) * 0.50));
      const sliceH = Math.floor(6 + strength * 30);
      const dx = Math.floor((rand01(exportTime * 12 + s) - 0.5) * strength * 150);
      ctx.drawImage(fxCanvas, 0, y, w, sliceH, dx, y, w, sliceH);
    }
    ctx.restore();

    ctx.save();
    for (let i = 0; i < Math.floor(strength * 24); i++) {
      const y = Math.floor(rand01(exportTime * 8 + i * 5.13) * h);
      const x = Math.floor(rand01(exportTime * 7 + i * 9.44) * w);
      const bw = Math.floor(20 + rand01(i + exportTime) * strength * 300);
      const bh = Math.floor(1 + rand01(i * 2 + exportTime) * 8);
      ctx.globalAlpha = 0.16 + strength * 0.48;
      ctx.fillStyle = rand01(i + exportTime * 8) > 0.52 ? '#fff' : '#000';
      ctx.fillRect(x, y, bw, bh);
    }
    ctx.restore();
  }

  if (rgb > 0) {
    const shift = Math.floor(1 + rgb * 26);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.16 + rgb * 0.50;
    ctx.filter = 'sepia(1) saturate(9) hue-rotate(-55deg)';
    ctx.drawImage(fxCanvas, shift, 0);
    ctx.filter = 'sepia(1) saturate(9) hue-rotate(145deg)';
    ctx.drawImage(fxCanvas, -shift, 0);
    ctx.restore();
  }
}

function applyNoise(amount, scanAmount, exportTime) {
  const strength = amount / 100;
  const scan = scanAmount / 100;
  if (strength <= 0 && scan <= 0) return;

  const w = canvas.width, h = canvas.height;
  if (strength > 0) {
    // Drawn static instead of per-pixel mutation. Dramatically cheaper.
    ctx.save();
    const lines = Math.floor(strength * 180);
    for (let i = 0; i < lines; i++) {
      const y = Math.floor(rand01(exportTime + i * 2.43) * h);
      const x = Math.floor(rand01(exportTime + i * 1.71) * w);
      const len = Math.floor(8 + rand01(i + exportTime) * strength * 220);
      ctx.globalAlpha = 0.035 + strength * 0.18;
      ctx.fillStyle = rand01(i + exportTime * 9) > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x, y, len, 1);
    }
    const specks = Math.floor(strength * 1200);
    ctx.globalAlpha = 0.08 + strength * 0.20;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < specks; i++) {
      const x = Math.floor(rand01(exportTime * 11 + i * 1.11) * w);
      const y = Math.floor(rand01(exportTime * 13 + i * 1.37) * h);
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
  }

  if (scan > 0) {
    ctx.save();
    const gap = Math.max(2, Math.floor(8 - scan * 5));
    ctx.globalAlpha = 0.08 + scan * 0.35;
    ctx.fillStyle = '#000';
    for (let y = 0; y < h; y += gap) ctx.fillRect(0, y, w, 1 + Math.floor(scan * 2));
    ctx.globalAlpha = 0.04 + scan * 0.12;
    ctx.fillStyle = '#fff';
    for (let y = Math.floor((exportTime * 11) % gap); y < h; y += gap * 2) ctx.fillRect(0, y, w, 1);
    ctx.restore();
  }
}

let time = 0;
function render(exportTime = time) {
  const w = canvas.width, h = canvas.height;
  const text = controls.text.value || 'Y2K CHROME';
  const size = Number(controls.size.value);
  const depth = Number(controls.depth.value);
  const spacing = Number(controls.letterSpacing.value);
  const baseAngle = Number(controls.angle.value) * Math.PI / 180;
  const tailSpread = Number(controls.tailSpread.value) / 100;
  const perspective = Number(controls.perspective.value) / 100;
  const tilt = Number(controls.tilt.value) * Math.PI / 180;

  const phase = exportTime * 0.032;
  const spinCos = Math.cos(phase);
  const spinSin = Math.sin(phase);

  // Full spin without the old 'orbiting tail' bug:
  // - the face rotates by compressing/mirroring on X
  // - the extrusion direction stays fixed in screen space
  // - only the apparent tail length breathes with the turn
  // This keeps the back attached instead of swinging around like a loose arm.
  const faceScaleX = clamp(spinCos, -1, 1);
  const depthScale = 0.42 + 0.58 * Math.abs(spinSin);
  const dx = Math.cos(baseAngle) * 1.35 * tailSpread;
  const dy = Math.sin(baseAngle) * 1.35 * tailSpread;
  const zPush = perspective * Math.abs(spinSin) * 0.22;

  ctx.clearRect(0, 0, w, h);
  if (!controls.transparent.checked) {
    ctx.fillStyle = controls.bg.value;
    ctx.fillRect(0, 0, w, h);
  }

  const x = controls.pixelSnap.checked ? Math.round(w / 2) : w / 2;
  const y = controls.pixelSnap.checked ? Math.round(h / 2 + 12) : h / 2 + 12;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.font = `${size}px '${controls.font.value}', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (controls.shadow.checked) {
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 18;
  }

  ctx.filter = `blur(${Number(controls.blur.value)}px)`;
  const maxLayers = Number(controls.quality?.value ?? 42);
  const step = Math.max(1, Math.ceil(depth / Math.max(1, maxLayers)));
  for (let i = depth; i > 0; i -= step) {
    const t = i / Math.max(1, depth);
    const px = dx * i * depthScale / 1.8;
    const py = dy * i * (0.8 + perspective * 0.35) / 1.8;
    const scale = 1 + zPush * t;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(faceScaleX * scale, scale);
    ctx.fillStyle = shade(controls.extrude.value, i, depth);
    drawSpacedText(ctx, text, 0, 0, spacing, 'fill');
    ctx.restore();
  }

  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.scale(faceScaleX, 1);
  ctx.lineWidth = Number(controls.strokeWidth.value);
  ctx.strokeStyle = controls.stroke.value;
  ctx.fillStyle = controls.face.value;
  if (ctx.lineWidth > 0) drawSpacedText(ctx, text, 0, 0, spacing, 'stroke');
  drawSpacedText(ctx, text, 0, 0, spacing, 'fill');
  ctx.restore();

  ctx.restore();

  applyGlitch(Number(controls.glitch.value), Number(controls.rgbSplit.value), exportTime);
  applyNoise(Number(controls.noise.value), Number(controls.scanlines.value), exportTime);

  if (controls.centerGuide.checked) {
    ctx.strokeStyle = '#ff000099'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  }
}

let lastFrame = 0;
function tick(now = 0) {
  // 30 FPS is plenty for this effect and avoids melting Safari/mobile.
  if (now - lastFrame >= 33) {
    lastFrame = now;
    time += Number(controls.speed.value) / 55;
    render();
  }
  requestAnimationFrame(tick);
}

function applyPreset(name) {
  const p = presets[name];
  if (!p) return;
  controls.face.value = p.face; controls.extrude.value = p.extrude; controls.stroke.value = p.stroke; controls.bg.value = p.bg;
  controls.font.value = p.font; controls.depth.value = p.depth; controls.angle.value = p.angle; controls.tailSpread.value = p.tailSpread;
  controls.perspective.value = p.perspective; controls.glitch.value = p.glitch; controls.rgbSplit.value = p.rgbSplit;
  controls.noise.value = p.noise; controls.scanlines.value = p.scanlines; controls.blur.value = p.blur;
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('pngBtn').addEventListener('click', () => canvas.toBlob(b => downloadBlob(b, 'y2k-chrome.png')));
$('webmBtn').addEventListener('click', async () => {
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = () => downloadBlob(new Blob(chunks, { type:'video/webm' }), 'y2k-chrome.webm');
  rec.start();
  setTimeout(() => rec.stop(), 3000);
});
$('gifBtn').addEventListener('click', async () => {
  const mod = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
  const { GIFEncoder, quantize, applyPalette } = mod;
  const gif = GIFEncoder();
  const frames = 72;
  const oldTime = time;
  for (let f = 0; f < frames; f++) {
    render(f * 3.25);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(image.data, 256);
    const index = applyPalette(image.data, palette);
    gif.writeFrame(index, canvas.width, canvas.height, { palette, delay: 42 });
  }
  gif.finish();
  time = oldTime;
  downloadBlob(new Blob([gif.bytes()], { type: 'image/gif' }), 'y2k-chrome.gif');
});
$('randomizeBtn').addEventListener('click', () => {
  const presetNames = Object.keys(presets);
  applyPreset(presetNames[Math.floor(Math.random() * presetNames.length)]);
  controls.font.value = fonts[Math.floor(Math.random() * fonts.length)];
  controls.angle.value = Math.floor(190 + Math.random() * 80);
  controls.depth.value = Math.floor(40 + Math.random() * 160);
  controls.tailSpread.value = Math.floor(70 + Math.random() * 80);
});
controls.preset.addEventListener('change', e => applyPreset(e.target.value));
document.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', () => render()));

applyPreset('chrome');
render();
tick();

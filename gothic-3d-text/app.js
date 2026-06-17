const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d', { alpha: true });

const fonts = [
  'UnifrakturCook', 'UnifrakturMaguntia', 'Pirata One', 'Jacquard 12', 'Metal Mania',
  'New Rocker', 'MedievalSharp', 'Creepster', 'Frijole', 'Rye', 'Sancreek', 'Ewert',
  'Monoton', 'Faster One', 'Rubik Glitch', 'Rubik Iso', 'Rubik Moonrocks', 'Archivo Black', 'Bebas Neue'
];

const $ = (id) => document.getElementById(id);
const controls = {
  text: $('textInput'), font: $('fontSelect'), preset: $('presetSelect'),
  face: $('faceColor'), extrude: $('extrudeColor'), stroke: $('strokeColor'), bg: $('bgColor'),
  size: $('fontSize'), depth: $('depth'), angle: $('angle'), strokeWidth: $('strokeWidth'),
  letterSpacing: $('letterSpacing'), wobble: $('wobble'), speed: $('speed'), glitch: $('glitch'),
  blur: $('blur'), noise: $('noise'), transparent: $('transparent'), pixelSnap: $('pixelSnap'),
  shadow: $('shadow'), centerGuide: $('centerGuide')
};

for (const font of fonts) {
  const opt = document.createElement('option');
  opt.value = font;
  opt.textContent = font;
  controls.font.append(opt);
}
controls.font.value = 'UnifrakturCook';

const presets = {
  gothic: { face:'#ffffff', extrude:'#777777', stroke:'#000000', bg:'#050505', font:'UnifrakturCook', depth:80, angle:28, glitch:14, noise:8 },
  acid: { face:'#f7ff00', extrude:'#ff2a2a', stroke:'#000000', bg:'#070707', font:'Frijole', depth:62, angle:315, glitch:22, noise:18 },
  inferno: { face:'#ffffff', extrude:'#ff4b00', stroke:'#240000', bg:'#080000', font:'Metal Mania', depth:95, angle:38, glitch:8, noise:6 },
  terminal: { face:'#d7ffd7', extrude:'#16ff56', stroke:'#001806', bg:'#000000', font:'Rubik Glitch', depth:54, angle:22, glitch:30, noise:10 },
  bubblegum: { face:'#ffd6f5', extrude:'#8f6cff', stroke:'#18001d', bg:'#090012', font:'Monoton', depth:70, angle:335, glitch:10, noise:4 },
  void: { face:'#f2f2f2', extrude:'#202020', stroke:'#000000', bg:'#000000', font:'Pirata One', depth:135, angle:18, glitch:38, noise:24 }
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) { return a + (b - a) * t; }
function shade(hex, i, depth) {
  const [r, g, b] = hexToRgb(hex);
  const k = 0.35 + 0.65 * (i / Math.max(1, depth));
  return `rgb(${Math.round(mix(0, r, k))},${Math.round(mix(0, g, k))},${Math.round(mix(0, b, k))})`;
}


function rand01(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function applyGlitch(amount, exportTime) {
  if (amount <= 0) return;
  const w = canvas.width;
  const h = canvas.height;
  const strength = amount / 100;
  const source = ctx.getImageData(0, 0, w, h);

  // Hard horizontal slice displacement. This is the part that makes it
  // actually look broken instead of just adding tiny jitter inside the tail.
  const slices = Math.floor(4 + strength * 38);
  for (let s = 0; s < slices; s++) {
    const y = Math.floor(rand01(exportTime + s * 19.17) * h);
    const sliceH = Math.max(2, Math.floor(rand01(exportTime + s * 7.91) * (8 + strength * 42)));
    const dx = Math.floor((rand01(exportTime + s * 3.33) - 0.5) * strength * 120);
    ctx.putImageData(source, dx, 0, 0, y, w, Math.min(sliceH, h - y));
  }

  // RGB channel tear. Draw the whole canvas twice with blend-ish offsets.
  const temp = document.createElement('canvas');
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext('2d');
  tctx.putImageData(source, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(0.55, 0.12 + strength * 0.45);
  ctx.filter = 'sepia(1) saturate(8) hue-rotate(-45deg)';
  ctx.drawImage(temp, Math.floor(strength * 12), 0);
  ctx.filter = 'sepia(1) saturate(8) hue-rotate(145deg)';
  ctx.drawImage(temp, -Math.floor(strength * 10), 0);
  ctx.restore();

  // Occasional black/white data bars.
  ctx.save();
  for (let i = 0; i < Math.floor(strength * 18); i++) {
    const y = Math.floor(rand01(exportTime * 2 + i * 5.13) * h);
    const x = Math.floor(rand01(exportTime * 3 + i * 9.44) * w);
    const bw = Math.floor(20 + rand01(i + exportTime) * strength * 260);
    const bh = Math.floor(1 + rand01(i * 2 + exportTime) * 7);
    ctx.globalAlpha = 0.15 + strength * 0.45;
    ctx.fillStyle = rand01(i + exportTime * 8) > 0.5 ? '#fff' : '#000';
    ctx.fillRect(x, y, bw, bh);
  }
  ctx.restore();
}

function applyNoise(amount, exportTime) {
  if (amount <= 0) return;
  const w = canvas.width;
  const h = canvas.height;
  const strength = amount / 100;

  // Pixel noise over every-ish pixel, not every 9th pixel. Previous version
  // was too subtle on a high-res canvas.
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const step = strength > 0.55 ? 4 : 8;
  const amp = 28 + strength * 120;
  for (let i = 0; i < d.length; i += step) {
    const v = (Math.random() - 0.5) * amp;
    d[i] = Math.max(0, Math.min(255, d[i] + v));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + v));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + v));
  }
  ctx.putImageData(img, 0, 0);

  // CRT/static speckles and scanline dirt.
  ctx.save();
  ctx.globalAlpha = 0.08 + strength * 0.25;
  ctx.fillStyle = '#ffffff';
  const specks = Math.floor(strength * 1800);
  for (let i = 0; i < specks; i++) {
    const x = Math.floor(rand01(exportTime + i * 1.71) * w);
    const y = Math.floor(rand01(exportTime + i * 2.43) * h);
    ctx.fillRect(x, y, 1 + Math.floor(strength * 2), 1);
  }

  ctx.globalAlpha = 0.05 + strength * 0.18;
  ctx.fillStyle = '#000000';
  const gap = Math.max(2, Math.floor(7 - strength * 4));
  for (let y = 0; y < h; y += gap) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}

function drawSpacedText(context, text, x, y, spacing, mode = 'fill') {
  const lines = text.split('\n');
  const lineHeight = Number(controls.size.value) * 0.9;
  lines.forEach((line, lineIndex) => {
    const chars = [...line];
    const widths = chars.map(ch => context.measureText(ch).width + spacing);
    const total = widths.reduce((a, b) => a + b, 0) - spacing;
    let cx = x - total / 2;
    for (let i = 0; i < chars.length; i++) {
      const w = context.measureText(chars[i]).width;
      if (mode === 'stroke') context.strokeText(chars[i], cx + w / 2, y + (lineIndex - (lines.length - 1) / 2) * lineHeight);
      else context.fillText(chars[i], cx + w / 2, y + (lineIndex - (lines.length - 1) / 2) * lineHeight);
      cx += w + spacing;
    }
  });
}

let time = 0;
function render(exportTime = time) {
  const w = canvas.width, h = canvas.height;
  const text = controls.text.value || 'type something';
  const size = Number(controls.size.value);
  const depth = Number(controls.depth.value);
  const baseAngle = Number(controls.angle.value) * Math.PI / 180;
  const wobble = Number(controls.wobble.value) / 100;

  // Full fake-Y-axis spin.
  // Important: this is NOT Math.sin(phase). Math.sin() only eases back and forth.
  // Letting yRot increase forever gives a continuous 360° rotation.
  const phase = exportTime * 0.055;
  const yRot = phase;
  const spinCos = Math.cos(yRot);
  const spinSin = Math.sin(yRot);

  // Negative scaleX is intentional: when the text turns past 90°, the face mirrors,
  // which sells the illusion that you're seeing the back side of the same object.
  const faceScaleX = spinCos;
  const shearX = spinSin * 0.18 * wobble;

  // Keep the extrusion vector fixed in the text's LOCAL space.
  // Because the canvas transform below is applied to both the face and the extrusion,
  // the back part rotates with the letters instead of swinging around independently.
  const dx = Math.cos(baseAngle) * 1.45;
  const dy = Math.sin(baseAngle) * 1.45;
  const glitch = Number(controls.glitch.value);
  const spacing = Number(controls.letterSpacing.value);

  ctx.clearRect(0, 0, w, h);
  if (!controls.transparent.checked) {
    ctx.fillStyle = controls.bg.value;
    ctx.fillRect(0, 0, w, h);
  }

  const x = controls.pixelSnap.checked ? Math.round(w / 2) : w / 2;
  const y = controls.pixelSnap.checked ? Math.round(h / 2) : h / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.transform(faceScaleX, 0, shearX, 1, 0, 0);
  ctx.font = `${size}px '${controls.font.value}', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (controls.shadow.checked) {
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 22;
  }

  ctx.filter = `blur(${Number(controls.blur.value)}px)`;
  for (let i = depth; i > 0; i--) {
    const n = Math.sin(i * 12.9898 + exportTime) * 43758.5453;
    const jitter = glitch ? ((n - Math.floor(n)) - 0.5) * glitch * (i / Math.max(1, depth)) * 0.45 : 0;
    ctx.fillStyle = shade(controls.extrude.value, i, depth);
    drawSpacedText(ctx, text, dx * i + jitter, dy * i, spacing, 'fill');
  }

  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Number(controls.strokeWidth.value);
  ctx.strokeStyle = controls.stroke.value;
  ctx.fillStyle = controls.face.value;
  if (ctx.lineWidth > 0) drawSpacedText(ctx, text, 0, 0, spacing, 'stroke');
  drawSpacedText(ctx, text, 0, 0, spacing, 'fill');
  ctx.restore();

  applyGlitch(glitch, exportTime);
  applyNoise(Number(controls.noise.value), exportTime);
  if (controls.centerGuide.checked) {
    ctx.strokeStyle = '#ff000066';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  }
}

function tick() {
  time += Number(controls.speed.value) / 20;
  render();
  requestAnimationFrame(tick);
}

document.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', render));
controls.preset.addEventListener('change', () => {
  const p = presets[controls.preset.value];
  controls.face.value = p.face; controls.extrude.value = p.extrude; controls.stroke.value = p.stroke;
  controls.bg.value = p.bg; controls.font.value = p.font; controls.depth.value = p.depth;
  controls.angle.value = p.angle; controls.glitch.value = p.glitch; controls.noise.value = p.noise;
  render();
});

$('randomizeBtn').addEventListener('click', () => {
  controls.font.value = fonts[Math.floor(Math.random() * fonts.length)];
  controls.depth.value = Math.floor(30 + Math.random() * 130);
  controls.angle.value = Math.floor(Math.random() * 360);
  controls.wobble.value = Math.floor(Math.random() * 70);
  controls.glitch.value = Math.floor(Math.random() * 45);
  controls.noise.value = Math.floor(Math.random() * 30);
});

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

$('pngBtn').addEventListener('click', () => {
  render();
  canvas.toBlob(blob => downloadBlob(blob, '3d-type.png'), 'image/png');
});

$('webmBtn').addEventListener('click', async () => {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => downloadBlob(new Blob(chunks, { type: 'video/webm' }), '3d-type.webm');
  recorder.start();
  setTimeout(() => recorder.stop(), 3000);
});

$('gifBtn').addEventListener('click', async () => {
  const { GIFEncoder, quantize, applyPalette } = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm');
  const gif = GIFEncoder();
  const frames = 48;
  const delay = 50;
  for (let f = 0; f < frames; f++) {
    render(f * 2.2);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    await new Promise(r => setTimeout(r, 0));
  }
  gif.finish();
  downloadBlob(new Blob([gif.bytes()], { type: 'image/gif' }), '3d-type.gif');
});

tick();

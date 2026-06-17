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
  const spin = Math.sin(exportTime * 0.05) * wobble * Math.PI;
  const angle = baseAngle + spin;
  const dx = Math.cos(angle) * 1.55;
  const dy = Math.sin(angle) * 1.55;
  const glitch = Number(controls.glitch.value);
  const spacing = Number(controls.letterSpacing.value);

  ctx.clearRect(0, 0, w, h);
  if (!controls.transparent.checked) {
    ctx.fillStyle = controls.bg.value;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.save();
  ctx.font = `${size}px '${controls.font.value}', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const x = controls.pixelSnap.checked ? Math.round(w / 2) : w / 2;
  const y = controls.pixelSnap.checked ? Math.round(h / 2) : h / 2;

  if (controls.shadow.checked) {
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 22;
  }

  ctx.filter = `blur(${Number(controls.blur.value)}px)`;
  for (let i = depth; i > 0; i--) {
    const n = Math.sin(i * 12.9898 + exportTime) * 43758.5453;
    const jitter = glitch ? ((n - Math.floor(n)) - 0.5) * glitch * (i / depth) * 0.13 : 0;
    ctx.fillStyle = shade(controls.extrude.value, i, depth);
    drawSpacedText(ctx, text, x + dx * i + jitter, y + dy * i, spacing, 'fill');
  }

  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Number(controls.strokeWidth.value);
  ctx.strokeStyle = controls.stroke.value;
  ctx.fillStyle = controls.face.value;
  if (ctx.lineWidth > 0) drawSpacedText(ctx, text, x, y, spacing, 'stroke');
  drawSpacedText(ctx, text, x, y, spacing, 'fill');

  const noise = Number(controls.noise.value);
  if (noise > 0) {
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4 * 9) {
      const v = (Math.random() - 0.5) * noise;
      img.data[i] += v; img.data[i + 1] += v; img.data[i + 2] += v;
    }
    ctx.putImageData(img, 0, 0);
  }
  if (controls.centerGuide.checked) {
    ctx.strokeStyle = '#ff000066';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  }
  ctx.restore();
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

// app.js - Shared utilities and API wrapper
const API_BASE = '/api'; // update to your backend URL if needed


async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const options = { headers: { 'Content-Type': 'application/json' }, ...opts };
  if (options.body && typeof options.body !== 'string') options.body = JSON.stringify(options.body);
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || res.statusText);
    }
    return res.status === 204 ? null : await res.json();
  } catch (err) {
    console.error('apiFetch error', err);
    throw err;
  }
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function showToast(msg = '', type = 'info') {
  // Simple fallback toast - replace with UI later
  if (type === 'error') {
    alert('Error: ' + msg);
  } else {
    // use console for quiet messages so judges don't get annoyed
    console.log('Toast:', msg);
  }
}

function el(sel) { return document.querySelector(sel); }
function on(sel, ev, fn) { const e = document.querySelector(sel); if (e) e.addEventListener(ev, fn); }
// Smooth particle background
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let w, h;
const particles = [];

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Create particles
for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4
  });
}

function animate() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.15)";

  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    // wrap around edges
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();


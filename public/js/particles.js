// 氛围粒子：落叶、花瓣、雨雪、萤火、尘沙……
const PRESETS = {
  leaf: { n: 22, colors: ['#5d7444', '#7d8a4a', '#9a8a4c'], shape: 'leaf', size: [5, 9], vy: [0.4, 1.0], vx: [-0.3, 0.6], spin: true },
  goldleaf: { n: 28, colors: ['#e2b23a', '#d39b23', '#f0c95a'], shape: 'fan', size: [6, 10], vy: [0.4, 1.0], vx: [-0.2, 0.7], spin: true },
  petal: { n: 26, colors: ['#f2c6c8', '#eeb3b8', '#f7dcdc'], shape: 'leaf', size: [4, 7], vy: [0.35, 0.9], vx: [0.1, 0.8], spin: true },
  pinkpetal: { n: 32, colors: ['#f2b8bd', '#eaa0a8', '#f8d6d8'], shape: 'leaf', size: [4, 7], vy: [0.35, 0.9], vx: [0.1, 0.8], spin: true },
  redpetal: { n: 20, colors: ['#c8352b', '#d9553f', '#b22e25'], shape: 'leaf', size: [6, 10], vy: [0.6, 1.3], vx: [-0.3, 0.4], spin: true },
  maple: { n: 26, colors: ['#b8432f', '#c95a32', '#a83324', '#d98a3a'], shape: 'star', size: [6, 10], vy: [0.5, 1.1], vx: [-0.2, 0.7], spin: true },
  osmanthus: { n: 60, colors: ['#f6cf62', '#f2c14e', '#ffe08a'], shape: 'dot', size: [1.2, 2.6], vy: [0.2, 0.55], vx: [-0.15, 0.25], glow: true },
  snow: { n: 70, colors: ['#ffffff', '#f3f1ec'], shape: 'dot', size: [1.2, 3.2], vy: [0.3, 0.9], vx: [-0.25, 0.25], alpha: 0.85 },
  rain: { n: 120, colors: ['rgba(220,230,235,.45)'], shape: 'line', size: [10, 22], vy: [9, 14], vx: [-1.6, -1.0] },
  firefly: { n: 26, colors: ['#ffe9a3', '#d9f7a0'], shape: 'dot', size: [1.5, 2.6], wander: true, glow: true },
  dust: { n: 40, colors: ['rgba(255,240,210,.6)'], shape: 'dot', size: [0.8, 2], wander: true },
  mist: { n: 30, colors: ['rgba(255,255,255,.55)'], shape: 'dot', size: [1, 2.4], wander: true },
  sand: { n: 60, colors: ['rgba(240,200,140,.55)', 'rgba(255,225,180,.5)'], shape: 'dot', size: [0.8, 1.8], vy: [-0.05, 0.12], vx: [0.8, 2.0] },
};

const rand = (a, b) => a + Math.random() * (b - a);

export function startParticles(canvas, type) {
  const cfg = PRESETS[type];
  if (!cfg) return () => {};
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, raf = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const area = (W * H) / (1440 * 900);
  const count = Math.round(cfg.n * Math.max(0.5, Math.min(1.4, area)));
  const make = (initial) => ({
    x: rand(-50, W + 50),
    y: initial ? rand(0, H) : cfg.vx && cfg.vx[0] > 0.5 ? rand(0, H) : -20,
    s: rand(...cfg.size),
    vx: cfg.vx ? rand(...cfg.vx) : 0,
    vy: cfg.vy ? rand(...cfg.vy) : 0,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.03, 0.03),
    sw: rand(0.005, 0.02),
    ph: rand(0, Math.PI * 2),
    c: cfg.colors[(Math.random() * cfg.colors.length) | 0],
    a: cfg.alpha ?? rand(0.55, 0.95),
  });
  const ps = Array.from({ length: count }, () => make(true));
  if (cfg.vx && cfg.vx[0] > 0.5) ps.forEach((p) => (p.x = rand(-50, W)));

  let t = 0;
  const frame = () => {
    t++;
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      if (cfg.wander) {
        p.ph += p.sw;
        p.x += Math.cos(p.ph * 1.3) * 0.35;
        p.y += Math.sin(p.ph) * 0.3 - 0.05;
      } else {
        p.x += p.vx + Math.sin(t * p.sw + p.ph) * 0.4;
        p.y += p.vy;
        p.rot += p.vr;
      }
      if (p.y > H + 30 || p.x < -80 || p.x > W + 80 || p.y < -60) Object.assign(p, make(false), cfg.wander ? { y: rand(0, H) } : {});
      const alpha = cfg.glow && cfg.wander ? p.a * (0.35 + 0.65 * Math.abs(Math.sin(p.ph * 2))) : p.a;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;
      ctx.strokeStyle = p.c;
      if (cfg.glow) { ctx.shadowBlur = 10; ctx.shadowColor = p.c; } else ctx.shadowBlur = 0;
      ctx.save();
      ctx.translate(p.x, p.y);
      switch (cfg.shape) {
        case 'dot':
          ctx.beginPath(); ctx.arc(0, 0, p.s, 0, Math.PI * 2); ctx.fill(); break;
        case 'line':
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.vx * 1.6, p.s); ctx.stroke(); break;
        case 'leaf':
          ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(t * 0.03 + p.ph)) * 0.7 + 0.3);
          ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); ctx.fill(); break;
        case 'fan':
          ctx.rotate(p.rot); ctx.beginPath(); ctx.moveTo(0, p.s * 0.6); ctx.arc(0, p.s * 0.6, p.s, -Math.PI * 0.8, -Math.PI * 0.2); ctx.closePath(); ctx.fill(); break;
        case 'star':
          ctx.rotate(p.rot); ctx.beginPath();
          for (let i = 0; i < 10; i++) { const r = i % 2 ? p.s * 0.45 : p.s; const a = (i / 10) * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
          ctx.closePath(); ctx.fill(); break;
      }
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  };
  frame();
  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
}

// 工具函数
export const SVGNS = 'http://www.w3.org/2000/svg';

export function rng(seedStr) {
  let h = 2166136261;
  for (const c of String(seedStr)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}

export function svgEl(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
}

export const CARD_COLORS = {
  zhu: { name: '朱砂', fill: '#b8443a', text: '#f8ecd8' },
  yue: { name: '月白', fill: '#efe9dc', text: '#3a342c' },
  dai: { name: '黛青', fill: '#3f5560', text: '#e8e2d2' },
  xing: { name: '杏黄', fill: '#dcb85e', text: '#3a2c14' },
};

export function openModal(inner, { className = '', onClose } = {}) {
  const root = document.getElementById('modal-root');
  const backdrop = html(`<div class="modal-backdrop"><div class="modal ${className}"><button class="modal-close" aria-label="关闭">×</button></div></div>`);
  const modal = backdrop.querySelector('.modal');
  if (typeof inner === 'string') modal.insertAdjacentHTML('beforeend', inner);
  else modal.appendChild(inner);
  const close = () => {
    backdrop.style.animation = 'fade .25s ease reverse forwards';
    setTimeout(() => backdrop.remove(), 240);
    document.removeEventListener('keydown', onKey);
    onClose && onClose();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  backdrop.addEventListener('click', (e) => e.target === backdrop && close());
  modal.querySelector('.modal-close').onclick = close;
  document.addEventListener('keydown', onKey);
  root.appendChild(backdrop);
  return { modal, close };
}

export const api = {
  async cards(id) {
    const r = await fetch(`/api/cards?figure=${encodeURIComponent(id)}`);
    return r.json();
  },
  async counts() {
    const r = await fetch('/api/cards');
    return r.json();
  },
  async addCard(payload) {
    const r = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error((await r.json()).error || '挂载失败');
    return r.json();
  },
  async addOffering(payload) {
    const r = await fetch('/api/offerings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error((await r.json()).error || '奉上失败');
    return r.json();
  },
  async incense(id) {
    const r = await fetch('/api/incense', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ figureId: id }) });
    return r.json();
  },
};

export function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 年份数字转中文（用于落款）
export function yearsApart(death) {
  const now = new Date().getFullYear();
  return death < 0 ? now - death - 1 : now - death;
}

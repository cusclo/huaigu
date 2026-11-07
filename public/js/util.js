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

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function openModal(inner, { className = '', onClose, label = '' } = {}) {
  const root = document.getElementById('modal-root');
  const returnTo = document.activeElement;
  const backdrop = html(`<div class="modal-backdrop"><div class="modal ${className}" role="dialog" aria-modal="true" tabindex="-1"><button class="modal-close" aria-label="关闭">×</button></div></div>`);
  const modal = backdrop.querySelector('.modal');
  if (typeof inner === 'string') modal.insertAdjacentHTML('beforeend', inner);
  else modal.appendChild(inner);
  const heading = modal.querySelector('h3, .letter-to, .sh-head h3');
  if (label) modal.setAttribute('aria-label', label);
  else if (heading) {
    heading.id ||= `mh-${Math.random().toString(36).slice(2, 8)}`;
    modal.setAttribute('aria-labelledby', heading.id);
  }
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    backdrop.style.animation = 'fade .25s ease reverse forwards';
    setTimeout(() => backdrop.remove(), 240);
    document.removeEventListener('keydown', onKey, true);
    // 焦点归还给打开弹窗的控件
    if (returnTo && returnTo.isConnected && typeof returnTo.focus === 'function') returnTo.focus({ preventScroll: true });
    onClose && onClose();
  };
  const onKey = (e) => {
    // 只处理最上层弹窗
    if (root.lastElementChild !== backdrop) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    // 焦点圈定在弹窗内
    const items = [...modal.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) { e.preventDefault(); modal.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  backdrop.addEventListener('click', (e) => e.target === backdrop && close());
  modal.querySelector('.modal-close').onclick = close;
  document.addEventListener('keydown', onKey, true);
  root.appendChild(backdrop);
  // 初始焦点：首个表单控件，否则弹窗本身
  const firstField = modal.querySelector('input, textarea, select');
  (firstField || modal).focus({ preventScroll: true });
  return { modal, close };
}

export const api = {
  async cards(id) {
    try {
      const r = await fetch(`/api/cards?figure=${encodeURIComponent(id)}`);
      if (r.ok) return await r.json();
    } catch {}
    const local = JSON.parse(localStorage.getItem('huaigu_data_' + id) || '{}');
    return {
      cards: local.cards || [],
      offerings: local.offerings || [],
      incense: local.incense || 0,
    };
  },
  async counts() {
    try {
      const r = await fetch('/api/cards');
      if (r.ok) return await r.json();
    } catch {}
    return { counts: {}, offeringCounts: {} };
  },
  async addCard(payload) {
    try {
      const r = await fetch('/api/cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) return await r.json();
    } catch {}
    const id = payload.figureId;
    const local = JSON.parse(localStorage.getItem('huaigu_data_' + id) || '{"cards":[],"offerings":[],"incense":0}');
    const card = {
      id: Math.random().toString(36).slice(2, 10),
      name: payload.name || '无名氏',
      text: payload.text,
      color: payload.color || 'zhu',
      ts: Date.now(),
    };
    local.cards = local.cards || [];
    local.cards.push(card);
    localStorage.setItem('huaigu_data_' + id, JSON.stringify(local));
    return { card };
  },
  async addOffering(payload) {
    try {
      const r = await fetch('/api/offerings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) return await r.json();
    } catch {}
    const id = payload.figureId;
    const local = JSON.parse(localStorage.getItem('huaigu_data_' + id) || '{"cards":[],"offerings":[],"incense":0}');
    const offering = {
      id: Math.random().toString(36).slice(2, 10),
      itemId: payload.itemId,
      name: payload.name || '无名氏',
      note: payload.note || '聊表寸心',
      ts: Date.now(),
    };
    local.offerings = local.offerings || [];
    local.offerings.push(offering);
    localStorage.setItem('huaigu_data_' + id, JSON.stringify(local));
    return { offering };
  },
  async incense(id) {
    try {
      const r = await fetch('/api/incense', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ figureId: id }) });
      if (r.ok) return await r.json();
    } catch {}
    const local = JSON.parse(localStorage.getItem('huaigu_data_' + id) || '{"cards":[],"offerings":[],"incense":0}');
    local.incense = (local.incense || 0) + 1;
    localStorage.setItem('huaigu_data_' + id, JSON.stringify(local));
    return { incense: local.incense };
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

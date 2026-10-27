// 舆图视图：Albers 投影 + 平移缩放 + 水系名湖 + 先贤/古迹双域筛选 + 百贤画像与古迹检索
import { ENTITIES, ONLY_FIGURES, ONLY_SITES, ERAS, FIGURE_ROLES, SITE_ROLES, ROLE_META } from './data.js';
import { project } from './core/spatial.js';
import { svgEl, html, esc, api } from './util.js';
import { renderPortraitHtml } from './core/portraits.js';
import { isSoundEnabled, toggleSound, playChime, playZither } from './core/sound.js';

// 历史水系（黄河、长江、淮河、珠江）
const RIVERS = {
  黄河: [[96.0, 35.0], [98.2, 34.9], [100.5, 34.6], [101.6, 35.9], [103.4, 36.1], [104.8, 37.4], [105.9, 37.5], [106.5, 38.9], [107.0, 40.3], [108.5, 40.8], [110.0, 40.6], [111.3, 40.2], [111.0, 39.0], [110.6, 37.5], [110.4, 35.5], [110.3, 34.6], [111.3, 34.8], [112.5, 34.9], [113.6, 34.9], [114.6, 35.0], [115.6, 35.7], [116.5, 36.3], [117.5, 37.0], [118.6, 37.6], [119.2, 37.8]],
  长江: [[91.0, 33.5], [94.0, 33.4], [97.0, 33.0], [98.6, 31.0], [99.2, 28.5], [100.0, 26.8], [100.5, 26.0], [101.8, 26.6], [103.0, 26.2], [104.6, 28.8], [105.4, 28.8], [106.6, 29.6], [108.0, 30.5], [109.5, 31.0], [110.8, 30.8], [111.4, 30.4], [112.2, 30.1], [113.0, 29.5], [114.3, 30.6], [115.5, 29.9], [116.6, 29.8], [117.4, 30.6], [118.4, 31.4], [118.8, 32.1], [119.9, 32.2], [121.0, 31.8], [121.9, 31.4]],
  淮河: [[113.4, 32.5], [114.8, 32.4], [116.2, 32.6], [117.5, 33.0], [118.8, 33.3], [119.6, 33.6]],
  珠江: [[106.5, 24.5], [108.4, 23.7], [110.2, 23.4], [111.8, 23.2], [113.2, 22.9], [113.8, 22.2]],
};

const CANALS = {
  京杭运河: [[116.4, 39.9], [117.1, 39.1], [116.8, 37.2], [116.1, 35.4], [117.3, 34.3], [119.4, 32.4], [120.6, 31.3], [120.2, 30.2]],
};

// 著名大湖（洞庭湖、鄱阳湖、太湖、青海湖）
const LAKES = {
  洞庭湖: [[112.4, 29.4], [112.8, 29.6], [113.1, 29.3], [112.9, 28.9], [112.5, 29.0]],
  鄱阳湖: [[116.0, 29.4], [116.4, 29.6], [116.6, 29.1], [116.3, 28.7], [115.9, 29.0]],
  太湖:   [[119.9, 31.3], [120.4, 31.4], [120.6, 31.1], [120.3, 30.9], [119.9, 31.0]],
  青海湖: [[99.6, 36.8], [100.2, 37.0], [100.8, 36.9], [100.5, 36.5], [99.8, 36.6]],
};

// 古九州人文地理印记
const REGIONS = [
  { t: '关 中', at: [108.6, 34.4], size: 14 },
  { t: '中 原', at: [113.6, 34.5], size: 14 },
  { t: '齐 鲁', at: [118.0, 36.4], size: 14 },
  { t: '江 南', at: [119.7, 30.8], size: 14 },
  { t: '巴 蜀', at: [104.2, 30.5], size: 14 },
  { t: '荆 襄', at: [112.2, 31.3], size: 13 },
  { t: '幽 燕', at: [116.8, 40.2], size: 13 },
  { t: '塞 北', at: [111.5, 41.6], size: 13 },
  { t: '岭 南', at: [113.2, 23.4], size: 13 },
  { t: '西 域', at: [86.5, 41.8], size: 14 },
];

const LABELS = [
  { t: '黄 河', at: [108.6, 41.5], cls: 'map-river-label', size: 12 },
  { t: '长 江', at: [111.6, 29.6], cls: 'map-river-label', size: 12 },
  { t: '淮 河', at: [117.2, 33.3], cls: 'map-river-label', size: 11 },
  { t: '珠 江', at: [111.5, 23.6], cls: 'map-river-label', size: 11 },
  { t: '大运河', at: [118.8, 33.8], cls: 'map-canal-label', size: 11 },
  { t: '东 海', at: [124.5, 28.5], cls: 'map-sea-label', size: 15 },
  { t: '黄 海', at: [123.0, 35.5], cls: 'map-sea-label', size: 15 },
  { t: '南 海', at: [114.5, 18.6], cls: 'map-sea-label', size: 15 },
  { t: '渤 海', at: [120.2, 38.6], cls: 'map-sea-label', size: 14 },
];

const MOUNTAINS = [
  [84, 29.5], [88, 28.8], [92, 29.6], [83, 43], [87.5, 43.3],
  [99, 37.5], [107.5, 33.9], [112.8, 37.8], [117.1, 36.3], [118.2, 30.1],
  [111.5, 27.3], [101.8, 30.2]
];

let geoCache = null;
async function loadGeo() {
  if (geoCache) return geoCache;
  const gj = await (await fetch('/data/china.json')).json();
  let d = '';
  for (const f of gj.features) {
    const g = f.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      for (const ring of poly) {
        let last = null;
        let seg = '';
        let count = 0;
        for (const [lon, lat] of ring) {
          const [x, y] = project(lon, lat);
          if (last && Math.hypot(x - last[0], y - last[1]) < 0.9) continue;
          seg += (seg ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
          last = [x, y];
          count++;
        }
        if (count > 2) d += seg + 'Z';
      }
    }
  }
  geoCache = d;
  return d;
}

function smooth(points) {
  const p = points.map(([a, b]) => project(a, b));
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function smoothClosed(points) {
  const p = points.map(([a, b]) => project(a, b));
  const n = p.length;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

// 视图状态在页面间保留，返回舆图时不重置
let saved = null;
let savedEra = '全部';
let savedRole = '全部';
let savedKind = 'all'; // 'all' | 'figure' | 'site'

export function renderMap(root) {
  const view = html(`
    <section class="view map-view">
      <svg class="map-svg"></svg>
      <div class="brand">
        <div class="brand-title">怀古</div>
        <div class="brand-col">
          <span class="seal">千载</span>
          <span class="brand-sub">一图寻故人</span>
        </div>
      </div>
      <div class="map-top-right">
        <div class="map-hint">
          <b class="visible-count">${ENTITIES.length}</b> 处人文坐标 · ${ONLY_FIGURES.length} 先贤 / ${ONLY_SITES.length} 古迹<br/>
          ● 先贤陵寝 · ◆ 名胜古迹 · 滚轮缩放 · 点击印记
        </div>
        <div class="top-right-btns">
          <div class="kind-switch" role="group" aria-label="舆图图层切换">
            <button type="button" data-kind="all">全部</button>
            <button type="button" data-kind="figure">● 先贤陵墓</button>
            <button type="button" data-kind="site">◆ 名胜古迹</button>
          </div>
          <button class="roster-trigger" type="button" title="打开百贤与古迹名录检索">
            <span class="rt-seal">录</span>
            <span>名录检索</span>
          </button>
        </div>
      </div>
      <div class="filter-dock">
        <nav class="role-bar" aria-label="人物身份与古迹类别筛选"></nav>
        <nav class="era-bar" aria-label="历史朝代筛选"></nav>
      </div>
      <div class="map-tools">
        <button class="icon-btn sound-toggle" title="金石声律切换"><span class="sound-icon">${isSoundEnabled() ? '🎵' : '🔇'}</span></button>
        <button class="icon-btn" data-z="in" title="放大">＋</button>
        <button class="icon-btn" data-z="out" title="缩小">－</button>
        <button class="icon-btn" data-z="reset" title="复位">◎</button>
      </div>
      <aside class="roster-drawer" aria-hidden="true">
        <div class="rd-head">
          <div>
            <h3>神州怀古录</h3>
            <p>${ONLY_FIGURES.length} 位历代先贤 · ${ONLY_SITES.length} 处名胜古迹</p>
          </div>
          <button class="rd-close" type="button" aria-label="关闭名录">×</button>
        </div>
        <div class="rd-search-wrap">
          <input type="search" class="rd-search" placeholder="搜姓名、古战场、宫殿、考古遗址、朝代、地域……" />
        </div>
        <div class="rd-list"></div>
      </aside>
    </section>`);
  root.appendChild(view);

  const svg = view.querySelector('.map-svg');
  const world = svgEl('g', {}, svg);
  const overlay = svgEl('g', {}, svg);
  const markerLayer = svgEl('g', {}, svg);
  const focusLayer = svgEl('g', { style: 'pointer-events:none' }, svg);
  let pop = null;
  let state = { k: 1, x: 0, y: 0 };
  let fit = null;
  const W = () => svg.clientWidth, H = () => svg.clientHeight;

  // 世界层（随地图平移缩放）
  const shadow = svgEl('path', { class: 'map-land-shadow' }, world);
  const land = svgEl('path', { class: 'map-land' }, world);

  // 湖泊（洞庭湖、鄱阳湖、太湖、青海湖）
  for (const pts of Object.values(LAKES)) {
    svgEl('path', { class: 'map-lake', d: smoothClosed(pts) }, world);
  }

  // 大运河（虚线）
  for (const pts of Object.values(CANALS)) {
    svgEl('path', { class: 'map-canal', d: smooth(pts) }, world);
  }

  // 水系（黄河、长江、淮河、珠江）
  for (const pts of Object.values(RIVERS)) {
    svgEl('path', { class: 'map-river', d: smooth(pts) }, world);
  }

  loadGeo().then((d) => {
    land.setAttribute('d', d);
    shadow.setAttribute('d', d);
  });

  // 屏幕层：古九州水印、山形、地理注记
  const regionEls = REGIONS.map((r) => {
    const t = svgEl('text', { class: 'map-region-label', 'font-size': r.size, 'text-anchor': 'middle' }, overlay);
    t.textContent = r.t;
    return t;
  });

  const mountainEls = MOUNTAINS.map(() => svgEl('path', { class: 'map-mountain', d: 'M-12 4 L-5 -5 L0 1 L5 -7 L13 4' }, overlay));

  const labelEls = LABELS.map((l) => {
    const t = svgEl('text', { class: l.cls, 'font-size': l.size, 'text-anchor': 'middle' }, overlay);
    t.textContent = l.t;
    return t;
  });

  // 悬停高亮浮动层
  const focusGroup = svgEl('g', { opacity: 0 }, focusLayer);
  const focusRing = svgEl('circle', { r: 10, fill: 'none', stroke: '#a8322d', 'stroke-width': 2.2 }, focusGroup);
  const focusName = svgEl('text', { class: 'm-label', x: 13, y: 4.5, 'font-size': 15.5, 'font-weight': 'bold' }, focusGroup);
  const focusSub = svgEl('text', { class: 'm-sub', x: 42, y: 3.5, 'font-size': 10.5 }, focusGroup);

  const markers = ENTITIES.map((f, i) => {
    const roleColor = ROLE_META[f.role]?.color || '#a8322d';
    const isSite = f.kind === 'site';
    const g = svgEl('g', { class: `marker ${isSite ? 'is-site' : 'is-figure'}`, tabindex: 0 }, markerLayer);

    // 点击热区
    svgEl('circle', { class: 'm-hit', r: 13, fill: 'transparent' }, g);
    svgEl('circle', { class: 'm-ripple', r: 7, style: `stroke:${roleColor}; animation-delay:${(i % 7) * 0.45}s` }, g);

    // 先贤陵墓用圆印 (●)，名胜古迹用方胜菱印 (◆)
    const dot = isSite
      ? svgEl('rect', { class: 'm-dot m-diamond', x: -4.5, y: -4.5, width: 9, height: 9, rx: 1.2, transform: 'rotate(45)', style: `fill:${roleColor}` }, g)
      : svgEl('circle', { class: 'm-dot', r: 4.8, style: `fill:${roleColor}` }, g);

    const label = svgEl('text', { class: 'm-label', x: 9.5, y: 4.5, 'font-size': 14.5 }, g);
    label.textContent = f.name;
    const sub = svgEl('text', { class: 'm-sub', x: 9.5 + f.name.length * 14.5 + 4, y: 3.5, 'font-size': 10 }, g);
    sub.textContent = isSite ? f.role.replace('遗址', '') : f.dynasty.split(/[·（(]/)[0];

    const mObj = { f, g, dot, label, sub, isSite, roleColor, p: project(f.lon, f.lat), hovered: false };

    g.addEventListener('pointerenter', () => {
      if (g.classList.contains('dim')) return;
      mObj.hovered = true;
      layout();
    });
    g.addEventListener('pointerleave', () => {
      mObj.hovered = false;
      layout();
    });
    g.addEventListener('click', (e) => {
      if (moved) return;
      e.stopPropagation();
      openPop(f, g);
    });
    g.addEventListener('keydown', (e) => e.key === 'Enter' && openPop(f, g));
    return mObj;
  });

  function layout() {
    const { k, x, y } = state;
    const tf = (p) => [p[0] * k + x, p[1] * k + y];
    world.setAttribute('transform', `matrix(${k} 0 0 ${k} ${x} ${y})`);

    const zoomRatio = fit ? k / fit.k : 1;

    // 古九州区域水印透明度控制（宏观时凸显，细节缩小时淡出留白）
    const regionOpacity = Math.max(0.12, Math.min(0.55, 0.7 - (zoomRatio - 1) * 0.2));
    REGIONS.forEach((r, i) => {
      const [sx, sy] = tf(project(...r.at));
      regionEls[i].setAttribute('x', sx.toFixed(1));
      regionEls[i].setAttribute('y', sy.toFixed(1));
      regionEls[i].style.opacity = regionOpacity;
    });

    MOUNTAINS.forEach((m, i) => {
      const [sx, sy] = tf(project(...m));
      mountainEls[i].setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    });

    LABELS.forEach((l, i) => {
      const [sx, sy] = tf(project(...l.at));
      labelEls[i].setAttribute('x', sx.toFixed(1));
      labelEls[i].setAttribute('y', sy.toFixed(1));
    });

    const dotR = Math.max(4.0, Math.min(6.5, 4.0 + (zoomRatio - 1) * 0.7));
    const padX = zoomRatio < 1.5 ? 22 : zoomRatio < 2.6 ? 11 : 3;
    const padY = zoomRatio < 1.5 ? 11 : zoomRatio < 2.6 ? 5 : 2;

    const boxes = [];
    for (const m of markers) {
      const [sx, sy] = tf(m.p);
      m.sx = sx; m.sy = sy;
      if (m.isSite) {
        const s = dotR * 1.75;
        m.dot.setAttribute('x', (-s / 2).toFixed(1));
        m.dot.setAttribute('y', (-s / 2).toFixed(1));
        m.dot.setAttribute('width', s.toFixed(1));
        m.dot.setAttribute('height', s.toFixed(1));
      } else {
        m.dot.setAttribute('r', dotR.toFixed(1));
      }
      m.g.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    }

    // 悬停高亮标记置于顶层
    const focused = markers.find((m) => m.hovered && !m.g.classList.contains('dim'))
      || markers.find((m) => m.g.classList.contains('active') && !m.g.classList.contains('dim'));

    if (focused) {
      focusGroup.setAttribute('opacity', '1');
      focusGroup.setAttribute('transform', `translate(${focused.sx.toFixed(1)} ${focused.sy.toFixed(1)})`);
      focusRing.setAttribute('stroke', focused.roleColor);
      focusName.textContent = focused.f.name;
      focusSub.setAttribute('x', 13 + focused.f.name.length * 15.5 + 5);
      focusSub.textContent = focused.isSite ? focused.f.role : focused.f.dynasty.split(/[·（(]/)[0];
    } else {
      focusGroup.setAttribute('opacity', '0');
    }

    const order = [...markers].sort((a, b) => {
      const aPri = (a.hovered || a.g.classList.contains('active')) ? 2 : a.g.classList.contains('dim') ? 0 : 1;
      const bPri = (b.hovered || b.g.classList.contains('active')) ? 2 : b.g.classList.contains('dim') ? 0 : 1;
      return bPri - aPri;
    });

    for (const m of order) {
      const isDim = m.g.classList.contains('dim');
      const isFocus = m.hovered || m.g.classList.contains('active');
      if (isDim && !isFocus) {
        m.label.style.opacity = 0;
        m.sub.style.opacity = 0;
        continue;
      }
      const w = m.f.name.length * 14.5 + 32;
      const box = [m.sx + 6 - padX, m.sy - 10 - padY, m.sx + 6 + w + padX, m.sy + 8 + padY];
      const hit = boxes.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]));
      const show = isFocus || !hit || zoomRatio > 4.0;
      m.label.style.opacity = show ? 1 : 0;
      m.sub.style.opacity = show && (isFocus || zoomRatio > 1.35) ? 0.85 : 0;
      if (show) boxes.push(box);
    }
    if (pop && pop._m) placePop(pop._m);
  }

  function fitView() {
    const [x0, y0] = project(73, 54), [x1] = project(135, 40), [, y1] = project(110, 17.5);
    const xl = project(73, 40)[0];
    const bw = x1 - xl, bh = y1 - y0;
    const k = Math.min((W() - 80) / bw, (H() - 165) / bh);
    fit = { k, x: (W() - bw * k) / 2 - xl * k, y: (H() - bh * k) / 2 - y0 * k + 6 };
    return { ...fit };
  }

  state = saved ? { ...saved } : fitView();
  if (!fit) fitView();
  layout();

  const clampK = (k) => Math.max(fit.k * 0.7, Math.min(fit.k * 10, k));
  function zoomAt(px, py, factor, animate = false) {
    const k2 = clampK(state.k * factor);
    const f = k2 / state.k;
    const target = { k: k2, x: px - (px - state.x) * f, y: py - (py - state.y) * f };
    animate ? animateTo(target) : ((state = target), layout());
  }

  let raf = 0;
  function animateTo(target, ms = 520, onDone) {
    cancelAnimationFrame(raf);
    const from = { ...state }, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      state = { k: from.k + (target.k - from.k) * e, x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e };
      layout();
      if (p < 1) raf = requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    raf = requestAnimationFrame(step);
  }

  function flyToFigure(f) {
    const m = markers.find((item) => item.f.id === f.id);
    if (!m) return;
    const targetK = Math.max(state.k, fit.k * 2.8);
    const targetX = W() / 2 - m.p[0] * targetK;
    const targetY = H() / 2 - m.p[1] * targetK;
    animateTo({ k: targetK, x: targetX, y: targetY }, 600, () => {
      openPop(f, m.g);
    });
  }

  // 滚轮缩放
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0018));
  }, { passive: false });

  // 触控与鼠标拖拽平移，带温和回弹边界保护
  const pointers = new Map();
  let moved = false, start = null, pinch = null;
  svg.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    start = { x: e.clientX, y: e.clientY, sx: state.x, sy: state.y };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: state.k };
    }
  });

  window.addEventListener('pointermove', onMove);
  function onMove(e) {
    if (!pointers.has(e.pointerId) || !start) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = svg.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch.k * d) / pinch.d / state.k);
      moved = true;
      return;
    }
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!moved && Math.hypot(dx, dy) > 6) {
      moved = true;
      svg.classList.add('dragging');
    }
    if (moved) {
      const [cx, cy] = project(104, 35);
      const marginX = W() * 0.65;
      const marginY = H() * 0.65;
      const targetX = start.sx + dx;
      const targetY = start.sy + dy;

      // 边界约束，避免整幅九州地图被拖拽出视口
      const minX = W() - cx * state.k - marginX;
      const maxX = marginX - cx * state.k;
      const minY = H() - cy * state.k - marginY;
      const maxY = marginY - cy * state.k;

      state.x = Math.max(minX, Math.min(maxX, targetX));
      state.y = Math.max(minY, Math.min(maxY, targetY));
      layout();
    }
  }

  const onUp = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      start = { x: p.x, y: p.y, sx: state.x, sy: state.y };
    }
    svg.classList.remove('dragging');
    setTimeout(() => (moved = false), 0);
  };
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  svg.addEventListener('dblclick', (e) => {
    const r = svg.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, 2, true);
  });
  svg.addEventListener('click', () => !moved && closePop());

  const soundBtn = view.querySelector('.sound-toggle');
  if (soundBtn) {
    soundBtn.onclick = () => {
      const on = toggleSound();
      soundBtn.querySelector('.sound-icon').textContent = on ? '🎵' : '🔇';
      soundBtn.title = on ? '金石声律已开' : '金石声律已静音';
    };
  }

  view.querySelector('.map-tools').addEventListener('click', (e) => {
    const z = e.target.closest('button')?.dataset.z;
    if (z === 'in') zoomAt(W() / 2, H() / 2, 1.6, true);
    if (z === 'out') zoomAt(W() / 2, H() / 2, 1 / 1.6, true);
    if (z === 'reset') animateTo(fitView());
  });

  // 顶部图层切换与筛选
  const kindSwitch = view.querySelector('.kind-switch');
  const eraBar = view.querySelector('.era-bar');
  const roleBar = view.querySelector('.role-bar');
  const visibleCountEl = view.querySelector('.visible-count');

  kindSwitch.querySelectorAll('button').forEach((btn) => {
    btn.onclick = () => {
      savedKind = btn.dataset.kind;
      if (savedKind === 'figure' && SITE_ROLES.includes(savedRole)) savedRole = '全部';
      if (savedKind === 'site' && FIGURE_ROLES.includes(savedRole)) savedRole = '全部';
      rebuildRoleBar();
      applyFilters();
    };
  });

  ['全部', ...ERAS].forEach((era) => {
    const b = html(`<button type="button" data-era="${era}">${era}</button>`);
    b.onclick = () => { savedEra = era; applyFilters(); };
    eraBar.appendChild(b);
  });

  function rebuildRoleBar() {
    roleBar.innerHTML = '';
    const activeRoles = savedKind === 'figure'
      ? ['全部', ...FIGURE_ROLES]
      : savedKind === 'site'
        ? ['全部', ...SITE_ROLES]
        : ['全部', ...FIGURE_ROLES, '|', ...SITE_ROLES];

    activeRoles.forEach((role) => {
      if (role === '|') {
        roleBar.appendChild(html(`<span class="role-sep"></span>`));
        return;
      }
      const isSiteRole = SITE_ROLES.includes(role);
      const dot = role === '全部'
        ? ''
        : `<i class="role-dot ${isSiteRole ? 'is-diamond' : ''}" style="background:${ROLE_META[role]?.color || '#a8322d'}"></i>`;
      const b = html(`<button type="button" data-role="${role}">${dot}${role}</button>`);
      b.onclick = () => { savedRole = role; applyFilters(); };
      roleBar.appendChild(b);
    });
  }

  function applyFilters() {
    kindSwitch.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.kind === savedKind));
    [...eraBar.children].forEach((b) => b.classList.toggle('on', b.dataset.era === savedEra));
    roleBar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.role === savedRole));

    let shown = 0;
    markers.forEach((m) => {
      const matchKind = savedKind === 'all' || m.f.kind === savedKind;
      const matchEra = savedEra === '全部' || m.f.era === savedEra;
      const matchRole = savedRole === '全部' || m.f.role === savedRole;
      const ok = matchKind && matchEra && matchRole;
      if (ok) shown++;
      m.g.classList.toggle('dim', !ok);
    });
    visibleCountEl.textContent = shown;
    closePop();
    layout();
    renderRosterList();
  }

  // 名录抽屉与全文检索
  const drawer = view.querySelector('.roster-drawer');
  const searchInput = view.querySelector('.rd-search');
  const listEl = view.querySelector('.rd-list');

  view.querySelector('.roster-trigger').onclick = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    renderRosterList();
  };
  view.querySelector('.rd-close').onclick = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  };
  searchInput.addEventListener('input', renderRosterList);

  function renderRosterList() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = ENTITIES.filter((f) => {
      const matchKind = savedKind === 'all' || f.kind === savedKind;
      const matchEra = savedEra === '全部' || f.era === savedEra;
      const matchRole = savedRole === '全部' || f.role === savedRole;
      if (!matchKind || !matchEra || !matchRole) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        (f.zi && f.zi.toLowerCase().includes(q)) ||
        (f.dynasty && f.dynasty.toLowerCase().includes(q)) ||
        (f.role && f.role.toLowerCase().includes(q)) ||
        (f.title && f.title.toLowerCase().includes(q)) ||
        (f.place && f.place.toLowerCase().includes(q))
      );
    });

    if (!filtered.length) {
      listEl.innerHTML = `<div class="rd-empty">未寻得匹配的先贤或古迹，可尝试调整筛选条件。</div>`;
      return;
    }

    const groups = ERAS.map((era) => ({
      era,
      items: filtered.filter((f) => f.era === era),
    })).filter((g) => g.items.length > 0);

    listEl.innerHTML = groups.map((g) => `
      <div class="rd-group">
        <div class="rd-group-title"><span>${esc(g.era)}</span><em>${g.items.length} 处</em></div>
        <div class="rd-items">
          ${g.items.map((f) => `
            <button type="button" class="rd-item" data-fid="${esc(f.id)}">
              ${renderPortraitHtml(f, 'sm')}
              <div class="rd-info">
                <div class="rd-name">${esc(f.name)} <small>${esc(f.dynasty)} · ${esc(f.title || f.role)}</small></div>
                <div class="rd-place">${esc(f.place)}</div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.rd-item').forEach((btn) => {
      btn.onclick = () => {
        const fig = ENTITIES.find((f) => f.id === btn.dataset.fid);
        if (!fig) return;
        playZither('jiao');
        if (window.innerWidth <= 760) {
          drawer.classList.remove('open');
        }
        flyToFigure(fig);
      };
    });
  }

  rebuildRoleBar();
  applyFilters();

  // 人物画像 / 古迹胜迹浮卡
  function openPop(f, g) {
    closePop();
    playChime(f.kind === 'site' ? 440 : 523.25);
    markers.forEach((m) => m.g.classList.toggle('active', m.g === g));
    layout();
    const roleColor = ROLE_META[f.role]?.color || '#a8322d';
    const isSite = f.kind === 'site';

    pop = html(`
      <div class="figure-pop">
        <button class="fp-close" aria-label="关闭">×</button>
        <div class="fp-top">
          <div class="fp-avatar-col">
            ${renderPortraitHtml(f, 'md')}
          </div>
          <div class="fp-meta-col">
            <div class="fp-tags">
              <span class="seal fp-title" style="background:${roleColor}">${esc(f.role || f.title)}</span>
              <span class="fp-dynasty-badge">${esc(f.dynasty)}</span>
            </div>
            <div class="fp-name">${esc(f.name)}</div>
            ${f.zi ? `<div class="fp-zi">${esc(f.zi)}</div>` : ''}
            <div class="fp-years">${esc(f.years)}</div>
          </div>
        </div>
        <blockquote class="fp-motto">“${esc(f.motto)}”</blockquote>
        <div class="fp-place">${isSite ? '◆' : '◉'} ${esc(f.place)} <span class="fp-count"></span></div>
        <div class="fp-actions">
          <a class="btn zhu" href="#/tomb/${f.id}">${isSite ? '凭吊遗址' : '拜谒墓园'}</a>
          <a class="btn" href="#/life/${f.id}">${isSite ? '遗址考略' : '生平事迹'}</a>
          ${!isSite ? `<a class="btn fp-talk-btn" href="#/talk/${f.id}">古今对话</a>` : ''}
        </div>
      </div>`);

    pop._m = markers.find((m) => m.g === g);
    pop.querySelector('.fp-close').onclick = closePop;
    pop.addEventListener('pointerdown', (e) => e.stopPropagation());
    view.appendChild(pop);
    placePop(pop._m);

    api.counts().then(({ counts, offeringCounts }) => {
      const nc = counts?.[f.id] || 0;
      const no = offeringCounts?.[f.id] || 0;
      const parts = [];
      if (nc) parts.push(`${nc} 张${isSite ? '凭吊卡' : '缅怀卡'}`);
      if (no) parts.push(`${no} 件${isSite ? '信物' : '供品'}`);
      if (pop && parts.length) pop.querySelector('.fp-count').textContent = ` · ${parts.join(' · ')}`;
    }).catch(() => {});
  }

  function placePop(m) {
    if (window.innerWidth <= 760) return;
    const pw = 325, ph = pop.offsetHeight || 260;
    let left = m.sx + 24, top = m.sy - ph / 2;
    if (left + pw > W() - 16) left = m.sx - pw - 24;
    top = Math.max(16, Math.min(H() - ph - 115, top));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function closePop() {
    if (!pop) return;
    pop.remove();
    pop = null;
    markers.forEach((m) => m.g.classList.remove('active'));
    layout();
  }

  const onResize = () => { fitView(); layout(); };
  window.addEventListener('resize', onResize);

  return () => {
    saved = { ...state };
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('resize', onResize);
  };
}

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

// 视图状态在页面间保留，返回舆图时不重置（连同当时的视口尺寸，便于尺寸变化后保持中心）
let saved = null; // { state, w, h, userMoved }
let savedEra = '全部';
let savedRole = '全部';
let savedKind = 'all'; // 'all' | 'figure' | 'site'
let savedHideDim = false; // 筛选时隐去未选印记（而非淡显）

export function renderMap(root) {
  const view = html(`
    <section class="view map-view">
      <svg class="map-svg"></svg>
      <div class="map-loading" role="status" aria-live="polite">
        <div class="ml-ink"></div>
        <div class="ml-text">展 卷 中</div>
      </div>
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
          <button class="dim-toggle" type="button" hidden aria-pressed="false" title="筛选时隐去或淡显未选中的印记">隐去未选</button>
          <button class="roster-trigger" type="button" title="打开百贤与古迹名录检索（快捷键 /）">
            <span class="rt-seal">录</span>
            <span>名录检索</span>
          </button>
        </div>
      </div>
      <button class="filter-fab" type="button" aria-expanded="false">
        <span class="ff-icon" aria-hidden="true">筛</span><span class="ff-text">筛选</span><em class="ff-badge" hidden></em>
      </button>
      <div class="sheet-backdrop" hidden></div>
      <div class="filter-dock" id="map-filter-dock">
        <div class="sheet-head">
          <b>筛选印记</b>
          <button type="button" class="sheet-reset">重置</button>
          <button type="button" class="sheet-done">完成</button>
        </div>
        <div class="sheet-label">身份 · 类别</div>
        <nav class="role-bar" aria-label="人物身份与古迹类别筛选"></nav>
        <div class="sheet-label">朝代</div>
        <nav class="era-bar" aria-label="历史朝代筛选"></nav>
      </div>
      <div class="map-tools">
        <button class="icon-btn sound-toggle" type="button" title="金石声律切换" aria-label="金石声律" aria-pressed="${isSoundEnabled()}"><span class="sound-icon" aria-hidden="true">${isSoundEnabled() ? '🎵' : '🔇'}</span></button>
        <button class="icon-btn" type="button" data-z="in" title="放大" aria-label="放大舆图">＋</button>
        <button class="icon-btn" type="button" data-z="out" title="缩小" aria-label="缩小舆图">－</button>
        <button class="icon-btn" type="button" data-z="reset" title="复位" aria-label="复位舆图视野">◎</button>
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
  const clusterLayer = svgEl('g', { class: 'cluster-layer' }, svg);
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

  const loadingEl = view.querySelector('.map-loading');
  const finishLoading = () => {
    view.classList.add('map-ready');
    loadingEl.classList.add('done');
    setTimeout(() => loadingEl.remove(), 700);
  };
  loadGeo().then((d) => {
    land.setAttribute('d', d);
    shadow.setAttribute('d', d);
    finishLoading();
  }).catch(() => {
    loadingEl.querySelector('.ml-text').textContent = '舆图展卷失败 · 请刷新重试';
    view.classList.add('map-ready');
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
    const g = svgEl('g', {
      class: `marker ${isSite ? 'is-site' : 'is-figure'}`, tabindex: -1, role: 'button',
      'aria-label': `${f.name} · ${isSite ? f.role : f.dynasty} · ${f.place}`,
    }, markerLayer);

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
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPop(f, g); }
    });
    return mObj;
  });

  // 聚合印记：同屏过密的标记合并为「数字圆」，点击放大展开
  const clusterPool = [];
  function clusterEl(i) {
    if (clusterPool[i]) return clusterPool[i];
    const g = svgEl('g', { class: 'cluster', tabindex: 0, role: 'button' }, clusterLayer);
    svgEl('circle', { class: 'c-halo', r: 17 }, g);
    svgEl('circle', { class: 'c-body', r: 12.5 }, g);
    const t = svgEl('text', { class: 'c-num', 'text-anchor': 'middle', y: 4.5 }, g);
    const title = svgEl('title', {}, g);
    const go = (e) => { e.stopPropagation(); if (!moved && g._members) zoomToMembers(g._members); };
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go(e)));
    g.addEventListener('pointerdown', (e) => e.stopPropagation());
    clusterPool[i] = { g, t, title };
    return clusterPool[i];
  }
  function zoomToMembers(members) {
    userMoved = true;
    closePop();
    const xs = members.map((m) => m.p[0]), ys = members.map((m) => m.p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const vw = W() - rightInset();
    const fitK = Math.min((vw - 220) / Math.max(1, x1 - x0), (H() - 280) / Math.max(1, y1 - y0));
    const k = clampK(Math.min(state.k * 4, Math.max(state.k * 1.8, fitK)));
    animateTo({ k, x: vw / 2 - ((x0 + x1) / 2) * k, y: H() / 2 - ((y0 + y1) / 2) * k }, 560);
  }

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

    // 聚合：以屏幕距离贪心合并（悬停/选中/未选印记不参与）
    const CLUSTER_R = 22;
    const clusters = [];
    const clustered = new Set();
    if (zoomRatio < 6) {
      const cand = markers.filter((m) => !m.g.classList.contains('dim') && !m.hovered && !m.g.classList.contains('active'));
      for (const m of cand) {
        if (clustered.has(m)) continue;
        const members = cand.filter((o) => !clustered.has(o) && Math.abs(o.sx - m.sx) < CLUSTER_R && Math.abs(o.sy - m.sy) < CLUSTER_R && Math.hypot(o.sx - m.sx, o.sy - m.sy) < CLUSTER_R);
        if (members.length >= 3) {
          members.forEach((o) => clustered.add(o));
          clusters.push(members);
        }
      }
    }
    // 二次合并：中心过近的聚合圆彼此遮挡，合为一个
    const centroid = (ms) => [ms.reduce((a, m) => a + m.sx, 0) / ms.length, ms.reduce((a, m) => a + m.sy, 0) / ms.length];
    for (let merged = true; merged;) {
      merged = false;
      outer: for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const [ax, ay] = centroid(clusters[i]), [bx, by] = centroid(clusters[j]);
          if (Math.hypot(ax - bx, ay - by) < 30) {
            clusters[i] = clusters[i].concat(clusters[j]);
            clusters.splice(j, 1);
            merged = true;
            break outer;
          }
        }
      }
    }
    markers.forEach((m) => m.g.classList.toggle('clustered', clustered.has(m)));
    clusters.forEach((members, i) => {
      const c = clusterEl(i);
      const [cx, cy] = centroid(members);
      c.g._members = members;
      c.g.style.display = '';
      c.g.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
      c.t.textContent = members.length;
      const names = members.slice(0, 6).map((m) => m.f.name).join('、');
      c.title.textContent = `${names}${members.length > 6 ? ' 等' : ''} ${members.length} 处 · 点击展开`;
      c.g.setAttribute('aria-label', c.title.textContent);
      boxes.push([cx - 18, cy - 18, cx + 18, cy + 18]);
    });
    for (let i = clusters.length; i < clusterPool.length; i++) {
      clusterPool[i].g.style.display = 'none';
      clusterPool[i].g._members = null;
    }

    const order = [...markers].sort((a, b) => {
      const aPri = (a.hovered || a.g.classList.contains('active')) ? 2 : a.g.classList.contains('dim') ? 0 : 1;
      const bPri = (b.hovered || b.g.classList.contains('active')) ? 2 : b.g.classList.contains('dim') ? 0 : 1;
      return bPri - aPri;
    });

    for (const m of order) {
      const isDim = m.g.classList.contains('dim');
      const isFocus = m.hovered || m.g.classList.contains('active');
      if ((isDim && !isFocus) || clustered.has(m)) {
        m.label.style.opacity = 0;
        m.sub.style.opacity = 0;
        continue;
      }
      const w = m.f.name.length * 14.5 + 32;
      const box = [m.sx + 6 - padX, m.sy - 10 - padY, m.sx + 6 + w + padX, m.sy + 8 + padY];
      const hit = boxes.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]));
      const show = isFocus || !hit;
      m.label.style.opacity = show ? 1 : 0;
      m.sub.style.opacity = show && (isFocus || zoomRatio > 1.35) ? 0.85 : 0;
      if (show) boxes.push(box);
    }
    // 键盘 Tab 仅停留在视口内、可见且未被聚合的印记上，避免 161 个焦点
    const vw = W(), vh = H();
    for (const m of markers) {
      const reachable = m.sx > 0 && m.sx < vw && m.sy > 0 && m.sy < vh && !clustered.has(m) && !m.g.classList.contains('dim');
      const ti = reachable ? '0' : '-1';
      if (m.g.getAttribute('tabindex') !== ti) m.g.setAttribute('tabindex', ti);
    }
    if (pop && pop._m) placePop(pop._m);
  }

  // 名录抽屉在宽屏下常驻右侧时，地图可视区域需扣除其宽度
  const rightInset = () => {
    const d = view.querySelector('.roster-drawer');
    return d && d.classList.contains('open') && window.innerWidth > 760 ? d.offsetWidth : 0;
  };
  // 用户是否手动平移/缩放过：未动过时尺寸变化自动重新居中，动过则保持视觉中心
  let userMoved = false;
  let lastSize = { w: 0, h: 0 };

  function fitView() {
    if (W() <= 0 || H() <= 0) return { ...(fit || state) };
    const [x0, y0] = project(73, 54), [x1] = project(135, 40), [, y1] = project(110, 17.5);
    const xl = project(73, 40)[0];
    const bw = x1 - xl, bh = y1 - y0;
    // 为顶部标识与底部筛选预留的纵向空间；矮屏（横屏手机）筛选已收为面板，少留一些
    const reserveY = H() < 500 ? 70 : 165;
    const k = Math.min((W() - 80) / bw, (H() - reserveY) / bh);
    fit = { k, x: (W() - bw * k) / 2 - xl * k, y: (H() - bh * k) / 2 - y0 * k + 6 };
    return { ...fit };
  }

  function initView() {
    if (W() <= 0 || H() <= 0) return false;
    fitView();
    if (saved) {
      // 恢复上次视图，并按视口尺寸差平移，保持原先的视觉中心
      state = {
        k: saved.state.k,
        x: saved.state.x + (W() - saved.w) / 2,
        y: saved.state.y + (H() - saved.h) / 2,
      };
      userMoved = saved.userMoved;
    } else {
      state = { ...fit };
    }
    lastSize = { w: W(), h: H() };
    return true;
  }
  let ready = initView();
  if (ready) layout();

  const clampK = (k) => Math.max(fit.k * 0.7, Math.min(fit.k * 10, k));
  function zoomAt(px, py, factor, animate = false) {
    userMoved = true;
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
    userMoved = true;
    const targetK = Math.max(state.k, fit.k * 2.8);
    const targetX = (W() - rightInset()) / 2 - m.p[0] * targetK;
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
      userMoved = true;
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
      soundBtn.setAttribute('aria-pressed', String(on));
    };
  }

  view.querySelector('.map-tools').addEventListener('click', (e) => {
    const z = e.target.closest('button')?.dataset.z;
    if (z === 'in') zoomAt(W() / 2, H() / 2, 1.6, true);
    if (z === 'out') zoomAt(W() / 2, H() / 2, 1 / 1.6, true);
    if (z === 'reset') { userMoved = false; animateTo(fitView()); }
  });

  // 顶部图层切换与筛选
  const kindSwitch = view.querySelector('.kind-switch');
  const eraBar = view.querySelector('.era-bar');
  const roleBar = view.querySelector('.role-bar');
  const visibleCountEl = view.querySelector('.visible-count');
  const dimToggle = view.querySelector('.dim-toggle');
  const syncDimToggle = () => {
    dimToggle.setAttribute('aria-pressed', String(savedHideDim));
    dimToggle.textContent = savedHideDim ? '淡显未选' : '隐去未选';
  };
  syncDimToggle();
  dimToggle.onclick = () => {
    savedHideDim = !savedHideDim;
    syncDimToggle();
    view.classList.toggle('hide-dim', savedHideDim);
  };

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
    requestAnimationFrame(updateFades);
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
    const filtering = savedKind !== 'all' || savedEra !== '全部' || savedRole !== '全部';
    dimToggle.hidden = !filtering;
    const nActive = (savedEra !== '全部') + (savedRole !== '全部');
    fabBadge.hidden = !nActive;
    fabBadge.textContent = nActive ? `${shown}` : '';
    fab.classList.toggle('on', !!nActive);
    view.classList.toggle('hide-dim', filtering && savedHideDim);
    view.classList.toggle('few-shown', filtering && shown <= 30);
    closePop();
    layout();
    // 名录抽屉关闭时不渲染（避免每次筛选都重建 161 条带画像的条目）
    if (drawer.classList.contains('open')) renderRosterList();
  }

  // 名录抽屉与全文检索
  const drawer = view.querySelector('.roster-drawer');
  const searchInput = view.querySelector('.rd-search');
  const listEl = view.querySelector('.rd-list');

  const rosterTrigger = view.querySelector('.roster-trigger');
  const openDrawer = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    renderRosterList();
    setTimeout(() => searchInput.focus({ preventScroll: true }), 60);
  };
  const closeDrawer = () => {
    if (!drawer.classList.contains('open')) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (drawer.contains(document.activeElement)) rosterTrigger.focus();
  };
  rosterTrigger.onclick = () => (drawer.classList.contains('open') ? closeDrawer() : openDrawer());
  view.querySelector('.rd-close').onclick = closeDrawer;
  searchInput.addEventListener('input', () => { kbIndex = -1; renderRosterList(); });

  // 名录键盘操作：↑↓ 选择、回车飞往、Esc 收起
  let kbIndex = -1;
  const setKb = (i) => {
    const items = [...listEl.querySelectorAll('.rd-item')];
    if (!items.length) return;
    kbIndex = Math.max(0, Math.min(items.length - 1, i));
    items.forEach((b, j) => b.classList.toggle('kb', j === kbIndex));
    items[kbIndex].scrollIntoView({ block: 'nearest' });
  };
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setKb(kbIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setKb(kbIndex - 1); }
    else if (e.key === 'Enter' && e.target === searchInput) {
      e.preventDefault();
      const items = listEl.querySelectorAll('.rd-item');
      (items[kbIndex >= 0 ? kbIndex : 0])?.click();
    } else if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); }
  });
  // 全局快捷键：/ 打开名录检索，Esc 关闭浮卡/面板
  const onGlobalKey = (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !document.querySelector('.modal-backdrop')) {
      e.preventDefault();
      openDrawer();
    } else if (e.key === 'Escape' && !typing) {
      if (view.classList.contains('sheet-open')) setSheet(false);
      else if (pop) closePop();
    }
  };
  document.addEventListener('keydown', onGlobalKey);

  // 手机端：筛选栏收为底部弹出面板
  const fab = view.querySelector('.filter-fab');
  const fabBadge = view.querySelector('.ff-badge');
  const sheetBackdrop = view.querySelector('.sheet-backdrop');
  function setSheet(open) {
    view.classList.toggle('sheet-open', open);
    sheetBackdrop.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) { closePop(); requestAnimationFrame(updateFades); }
  }
  fab.onclick = () => setSheet(!view.classList.contains('sheet-open'));
  sheetBackdrop.onclick = () => setSheet(false);
  view.querySelector('.sheet-done').onclick = () => setSheet(false);
  view.querySelector('.sheet-reset').onclick = () => {
    savedEra = '全部'; savedRole = '全部';
    applyFilters();
  };

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
      kbIndex = -1;
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
        if (window.innerWidth <= 760) closeDrawer();
        flyToFigure(fig);
      };
    });
  }

  // 筛选栏可横向滑动时，在可继续滑动的一侧显示渐隐遮罩
  const updateFade = (bar) => {
    const max = bar.scrollWidth - bar.clientWidth;
    bar.classList.toggle('fade-l', max > 2 && bar.scrollLeft > 2);
    bar.classList.toggle('fade-r', max > 2 && bar.scrollLeft < max - 2);
  };
  const updateFades = () => { updateFade(roleBar); updateFade(eraBar); };
  [roleBar, eraBar].forEach((bar) => {
    bar.addEventListener('scroll', () => updateFade(bar), { passive: true });
    // 桌面端鼠标滚轮纵向滚动转为横向滑动
    bar.addEventListener('wheel', (e) => {
      if (bar.scrollWidth <= bar.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    }, { passive: false });
  });
  const barRo = new ResizeObserver(updateFades);
  barRo.observe(roleBar);
  barRo.observe(eraBar);

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
          <a class="btn fp-talk-btn" href="#/talk/${f.id}">${isSite ? '时空回响' : '古今对话'}</a>
        </div>
      </div>`);

    pop._m = markers.find((m) => m.g === g);
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', `${f.name} · ${isSite ? '古迹' : '先贤'}简介`);
    // 由键盘打开时把焦点移入浮卡，关闭后归还
    pop._return = document.activeElement === g ? g : null;
    pop.querySelector('.fp-close').onclick = closePop;
    pop.addEventListener('pointerdown', (e) => e.stopPropagation());
    view.appendChild(pop);
    placePop(pop._m);
    if (pop._return) pop.querySelector('.fp-actions a')?.focus({ preventScroll: true });

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
    const maxRight = W() - rightInset() - 16;
    if (left + pw > maxRight) left = m.sx - pw - 24;
    left = Math.max(16, left);
    top = Math.max(16, Math.min(H() - ph - 115, top));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function closePop() {
    if (!pop) return;
    const ret = pop._return;
    const hadFocus = pop.contains(document.activeElement);
    pop.remove();
    if (ret && hadFocus && ret.isConnected) ret.focus({ preventScroll: true });
    pop = null;
    markers.forEach((m) => m.g.classList.remove('active'));
    layout();
  }

  // 尺寸变化（首屏容器尚未布局、窗口缩放、手机横竖屏切换）
  const onResize = () => {
    const w = W(), h = H();
    if (w <= 0 || h <= 0) return;
    if (!ready) { ready = initView(); layout(); return; }
    if (w === lastSize.w && h === lastSize.h) return;
    fitView();
    if (!userMoved) {
      cancelAnimationFrame(raf);
      state = { ...fit };
    } else {
      state = { ...state, x: state.x + (w - lastSize.w) / 2, y: state.y + (h - lastSize.h) / 2 };
    }
    lastSize = { w, h };
    layout();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(svg);

  return () => {
    if (ready) saved = { state: { ...state }, w: lastSize.w, h: lastSize.h, userMoved };
    cancelAnimationFrame(raf);
    ro.disconnect();
    barRo.disconnect();
    document.removeEventListener('keydown', onGlobalKey);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };
}

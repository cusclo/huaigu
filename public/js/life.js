// 生平详情页：立传 · 纪年 · 传世诗文 · 历史画像 · 金石影痕
import { html, esc } from './util.js';
import { inkTravel } from './transition.js';
import { renderPortraitHtml } from './core/portraits.js';
import { getArchiveItem, openArchiveModal } from './core/archives.js';

export function renderLife(root, fig) {
  const isSite = fig.kind === 'site';
  const archiveItem = getArchiveItem(fig.id);
  const view = html(`
    <section class="view life-view">
      <header class="top-bar">
        <a class="back-link" href="#/">舆图</a>
        <a class="back-link" href="#/tomb/${fig.id}">${isSite ? '返回遗址实景' : '返回墓园'}</a>
      </header>
      <div class="life-wrap">
        <aside class="life-side">
          <div class="life-portrait-card">
            ${renderPortraitHtml(fig, 'lg')}
            <div class="life-portrait-caption">${isSite ? '遗迹图志' : '典藏画赞'}</div>
          </div>
          <div class="life-side-text">
            <div class="life-name">${esc(fig.name)}</div>
            <div class="life-side-meta">
              <span class="seal">${esc(fig.title)}</span>
              <span>${esc(fig.zi)}</span>
              <span>${esc(fig.dynasty)} · ${esc(fig.years)}</span>
              <span>${esc(fig.place)}</span>
            </div>
          </div>
        </aside>
        <div class="life-main">
          <blockquote class="life-motto">
            ${esc(fig.motto)}
            <small>—— ${esc(fig.name)} · ${esc(fig.epitaph)}</small>
          </blockquote>

          ${fig.scene?.archLabel ? `
            <div class="life-arch-bar">
              <span class="arch-badge">${isSite ? '遗迹规制' : '陵寝规制'}</span>
              <span class="arch-desc">${esc(fig.scene.archLabel)}</span>
            </div>
          ` : ''}

          <section class="life-bio">
            <h2>${isSite ? '遗址考略' : '生平小传'}</h2>
            ${fig.bio.map((p) => `<p>${esc(p)}</p>`).join('')}
          </section>

          <section>
            <h2>${isSite ? '千秋纪事与发掘' : '行迹纪年'}</h2>
            <div class="timeline">
              ${fig.deeds.map((d) => `<div class="tl-item"><div class="tl-t">${esc(d.t)}</div><div class="tl-e">${esc(d.e)}</div></div>`).join('')}
            </div>
          </section>

          <section>
            <h2>${isSite ? '传世铭文与吟咏' : '传世诗文'}</h2>
            <div class="works">
              ${fig.works.map((w) => `<article class="work"><h4>${esc(w.title)}</h4><p>${esc(w.text)}</p></article>`).join('')}
            </div>
          </section>

          ${archiveItem ? `
            <section class="life-archives-section">
              <h2>${isSite ? '千秋遗痕 · 百年旧影与金石测绘' : '神道存影 · 陵寝石像生与历史旧影'}</h2>
              <div class="archive-preview-card">
                <div class="apc-head">
                  <span class="seal apc-tag">${esc(archiveItem.category)}</span>
                  <div class="apc-title">${esc(archiveItem.title)}</div>
                  <div class="apc-era">${esc(archiveItem.era)} · ${esc(archiveItem.source)}</div>
                </div>
                <div class="apc-statues"><b>【${isSite ? '出土规制与遗存' : '神道石像生规制'}】</b>${esc(archiveItem.statues)}</div>
                <p class="apc-desc">${esc(archiveItem.desc)}</p>
                <div class="apc-actions">
                  <button class="btn btn-view-archive" type="button">📷 展开银盐湿版历史旧影与考据图志</button>
                </div>
              </div>
            </section>
          ` : ''}

          <section class="life-cta">
            <a class="btn zhu" href="#/tomb/${fig.id}">${isSite ? '凭吊遗址 · 题壁抒怀' : '拜谒墓园 · 敬奉供品'}</a>
            <button class="btn" data-go-talk>${isSite ? '轻触碑铭 · 时空回响' : '轻触碑石 · 古今对话'}</button>
          </section>
        </div>
      </div>
    </section>`);
  root.appendChild(view);

  const archiveBtn = view.querySelector('.btn-view-archive');
  if (archiveBtn) {
    archiveBtn.onclick = () => openArchiveModal(fig);
  }

  view.querySelector('[data-go-talk]').addEventListener('click', (e) => {
    inkTravel({ x: e.clientX, y: e.clientY, text: isSite ? '时空回响' : '穿越千年' }, () => (location.hash = `#/talk/${fig.id}`));
  });
  return () => {};
}

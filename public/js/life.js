// 生平详情页：立传 · 纪年 · 传世诗文
import { html, esc } from './util.js';
import { inkTravel } from './transition.js';

export function renderLife(root, fig) {
  const isSite = fig.kind === 'site';
  const view = html(`
    <section class="view life-view">
      <header class="top-bar">
        <a class="back-link" href="#/">舆图</a>
        <a class="back-link" href="#/tomb/${fig.id}">${isSite ? '返回遗址实景' : '返回墓园'}</a>
      </header>
      <div class="life-wrap">
        <aside class="life-side">
          <div class="life-name">${esc(fig.name)}</div>
          <div class="life-side-meta">
            <span class="seal">${esc(fig.title)}</span>
            <span>${esc(fig.zi)}</span>
            <span>${esc(fig.dynasty)} · ${esc(fig.years)}</span>
            <span>${esc(fig.place)}</span>
            ${fig.scene?.archLabel ? `<span>规制：${esc(fig.scene.archLabel)}</span>` : ''}
          </div>
        </aside>
        <div class="life-main">
          <blockquote class="life-motto">
            ${esc(fig.motto)}
            <small>—— ${esc(fig.name)} · ${esc(fig.epitaph)}</small>
          </blockquote>

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

          <section class="life-cta">
            <a class="btn zhu" href="#/tomb/${fig.id}">${isSite ? '凭吊遗址 · 敬献信物' : '拜谒墓园 · 敬奉供品'}</a>
            <button class="btn" data-go-talk>轻触碑石 · 古今对话</button>
          </section>
        </div>
      </div>
    </section>`);
  root.appendChild(view);

  view.querySelector('[data-go-talk]').addEventListener('click', (e) => {
    inkTravel({ x: e.clientX, y: e.clientY, text: '穿越千年' }, () => (location.hash = `#/talk/${fig.id}`));
  });
  return () => {};
}

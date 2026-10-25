// 怀古 · 路由调度中心
import { getEntity } from './data.js';
import { renderMap } from './map.js';
import { renderTomb } from './tomb.js';
import { renderLife } from './life.js';
import { renderTalk } from './talk.js';

const app = document.getElementById('app');
let cleanup = null;

function route() {
  const [, page, id] = (location.hash.replace(/^#/, '') || '/').split('/');
  const fig = getEntity(id);
  if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
  app.innerHTML = '';
  document.getElementById('modal-root').innerHTML = '';
  document.body.classList.remove('dark');

  if ((page === 'tomb' || page === 'site') && fig) cleanup = renderTomb(app, fig);
  else if (page === 'life' && fig) cleanup = renderLife(app, fig);
  else if (page === 'talk' && fig) cleanup = renderTalk(app, fig);
  else cleanup = renderMap(app);

  document.title = fig ? `${fig.name} · 怀古` : '怀古 · 千载风流一图寻';
}

window.addEventListener('hashchange', route);
route();

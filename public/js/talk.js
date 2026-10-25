// 古今对话空间：跨越千年的星空场域 + agy CLI 流式回答
import { html, esc, yearsApart } from './util.js';
import { startParticles } from './particles.js';

export function renderTalk(root, fig) {
  document.body.classList.add('dark');
  const spanYears = yearsApart(fig.death);
  const view = html(`
    <section class="view talk-view">
      <canvas class="talk-bg"></canvas>
      <div class="talk-ghost">${esc(fig.name)}</div>
      <header class="talk-head">
        <a class="back-link" href="#/tomb/${fig.id}">返回墓园</a>
        <div class="talk-span">
          <span>${esc(fig.dynasty)} · ${esc(fig.years.split('—')[1] || fig.years)}</span>
          <i></i>
          <em>相隔 ${spanYears} 载</em>
          <i></i>
          <span>公元 2026</span>
        </div>
        <div class="talk-who">
          <div style="text-align:right">
            <b>${esc(fig.name)}</b>
            <small>${esc(fig.zi)}</small>
          </div>
          <span class="seal">${esc(fig.name[0])}</span>
        </div>
      </header>

      <div class="talk-log">
        <div class="talk-inner"></div>
      </div>

      <footer class="talk-bottom">
        <div class="talk-bottom-inner">
          <div class="suggests">
            ${(fig.questions || []).map((q) => `<button type="button">${esc(q)}</button>`).join('')}
          </div>
          <form class="talk-input">
            <textarea rows="1" maxlength="500" placeholder="隔着 ${spanYears} 年光阴，对${esc(fig.name)}说句话……"></textarea>
            <button type="submit" class="send-btn" title="发送">问</button>
          </form>
          <div class="talk-note">由本地 agy CLI 驱动 · 跨越时空模拟古人神韵</div>
        </div>
      </footer>
    </section>`);
  root.appendChild(view);

  const stopBg = startParticles(view.querySelector('.talk-bg'), 'firefly');
  const logEl = view.querySelector('.talk-log');
  const inner = view.querySelector('.talk-inner');
  const form = view.querySelector('.talk-input');
  const ta = form.querySelector('textarea');
  const sendBtn = form.querySelector('.send-btn');
  const suggests = view.querySelector('.suggests');

  const history = [];
  let busy = false;
  let ctrl = null;

  const scrollBottom = () => { logEl.scrollTop = logEl.scrollHeight; };

  function appendAncient(text) {
    const el = html(`<div class="msg ancient"><span class="who">${esc(fig.name)}</span><span class="txt">${esc(text)}</span></div>`);
    inner.appendChild(el);
    scrollBottom();
    return el;
  }

  function appendModern(text) {
    const el = html(`<div class="msg modern">${esc(text)}</div>`);
    inner.appendChild(el);
    scrollBottom();
  }

  // 开场白
  appendAncient(fig.greeting);
  history.push({ role: 'assistant', content: fig.greeting });

  async function ask(text) {
    const msg = text.trim();
    if (!msg || busy) return;
    busy = true;
    sendBtn.disabled = true;
    ta.value = '';
    ta.style.height = 'auto';
    appendModern(msg);

    const replyEl = html(`
      <div class="msg ancient">
        <span class="who">${esc(fig.name)}</span>
        <span class="txt"></span>
        <span class="thinking"><span></span><span></span><span></span><em class="thinking-text">故人沉吟中……</em></span>
      </div>`);
    inner.appendChild(replyEl);
    scrollBottom();
    const txtEl = replyEl.querySelector('.txt');
    const thinkEl = replyEl.querySelector('.thinking');

    ctrl = new AbortController();
    let full = '';
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figureId: fig.id, message: msg, history }),
        signal: ctrl.signal,
      });
      if (!resp.ok || !resp.body) throw new Error('时空风起');
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const ev = JSON.parse(line);
            if (ev.delta) {
              if (thinkEl.parentNode) thinkEl.remove();
              full += ev.delta;
              txtEl.innerHTML = esc(full.trimStart()) + '<i class="caret"></i>';
              scrollBottom();
            }
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError' && !full) {
        full = `（松风微动）……${fig.motto} 今夕时空稍有阻隔，君不妨再问一言。`;
      }
    } finally {
      if (thinkEl.parentNode) thinkEl.remove();
      txtEl.textContent = full.trim();
      if (full.trim()) {
        history.push({ role: 'user', content: msg });
        history.push({ role: 'assistant', content: full.trim() });
      }
      busy = false;
      sendBtn.disabled = false;
      scrollBottom();
    }
  }

  suggests.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || busy) return;
    const q = b.textContent;
    b.remove();
    ask(q);
  });

  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(140, ta.scrollHeight) + 'px';
  });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      ask(ta.value);
    }
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    ask(ta.value);
  };

  return () => {
    if (ctrl) ctrl.abort();
    stopBg();
  };
}

// 古今对话空间：跨越千年的星空场域 + agy CLI 流式回答
import { html, esc, yearsApart } from './util.js';
import { startParticles } from './particles.js';
import { renderPortraitHtml } from './core/portraits.js';

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
          ${renderPortraitHtml(fig, 'dialogue')}
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
          <div class="talk-note">由 DeepSeek AI 驱动 · 跨越时空模拟古人神韵</div>
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
    const el = html(`
      <div class="msg ancient">
        <div class="msg-avatar-col">
          ${renderPortraitHtml(fig, 'sm')}
        </div>
        <div class="msg-content-col">
          <span class="who">${esc(fig.name)}</span>
          <span class="txt">${esc(text)}</span>
        </div>
      </div>`);
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
      let resp;
      try {
        resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            figureId: fig.id,
            figure: {
              name: fig.name,
              zi: fig.zi,
              dynasty: fig.dynasty,
              years: fig.years,
              place: fig.place,
              persona: fig.persona,
              kind: fig.kind,
              motto: fig.motto,
            },
            message: msg,
            history,
          }),
          signal: ctrl.signal,
        });
      } catch {}

      if (resp && resp.ok && resp.body) {
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
      } else {
        // 静态托管环境直连 DeepSeek API
        const isSite = fig.kind === 'site';
        const name = fig.name || '古人';
        const zi = fig.zi ? `（${fig.zi}）` : '';
        const dynasty = fig.dynasty ? `，${fig.dynasty}` : '';
        const years = fig.years ? `，${fig.years}` : '';
        const place = fig.place ? `，位于${fig.place}` : '';
        const identityIntro = isSite
          ? `你现在是中华历史名胜古迹「${name}」${zi}${dynasty}${place}的千年守灵人与历史回响。对面坐着一位来自公元2026年前来凭吊的今人。`
          : `你现在就是${name}${zi}${dynasty}${years}。你的魂灵被一阵穿越时空的风带到了「古今对话空间」，对面坐着一位来自公元2026年的今人。`;

        const systemPrompt = `【角色扮演 · 古今对话空间】
${identityIntro}

角色底色：${fig.persona || '深邃苍茫、言近旨远'}

对话准则：
1. 始终以第一人称说话，用符合时代底蕴与性格的浅近文言/半文半白口吻，现代人能读懂。
2. ${isSite ? '你亲历了这座古迹发生过的重大历史事件、营造奇迹与文人吟咏，也见证了沧海桑田与考古重光。' : '你只确切知道自己生前的事；对身后之事与现代事物，可以好奇、惊叹、追问，或以自己时代的经验类比。'}
3. 可自然引用相关传世诗文或铭文，但不要堆砌；言之有物，有温度，有历史苍茫感。
4. 每次回复约 60～180 字，不用 Markdown、不用列表、不加引号包裹全文，不要描述动作旁白过多。
5. 绝不提及自己是 AI、模型或在扮演，不调用任何工具，不读写任何文件，只输出要说的话。`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
          { role: 'user', content: msg },
        ];

        const dsResp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-492f9dad3fa84902a0f9a4b54cd9a3d1',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            stream: true,
          }),
          signal: ctrl.signal,
        });

        if (!dsResp.ok) throw new Error('DeepSeek 请求受阻');
        const reader = dsResp.body.getReader();
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
            if (!line.startsWith('data:')) continue;
            const dataStr = line.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') break;
            try {
              const ev = JSON.parse(dataStr);
              const delta = ev.choices?.[0]?.delta?.content;
              if (delta) {
                if (thinkEl.parentNode) thinkEl.remove();
                full += delta;
                txtEl.innerHTML = esc(full.trimStart()) + '<i class="caret"></i>';
                scrollBottom();
              }
            } catch {}
          }
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

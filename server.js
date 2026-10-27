// 怀古 v0.1 — 零依赖 Node 服务
// 静态资源 + 缅怀卡片 API + 基于 agy CLI 的古今对话（流式）
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FIGURES } from './public/js/data.js';
import { OFFERING_MAP } from './public/js/offerings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5173);
const PUBLIC = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const OFFERINGS_FILE = path.join(DATA_DIR, 'offerings.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-492f9dad3fa84902a0f9a4b54cd9a3d1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const AGY_BIN = process.env.AGY_BIN || 'agy';
const AGY_MODEL = process.env.HUAIGU_MODEL || 'gemini-3.8-flash-low';
const AGY_CWD = path.join(os.tmpdir(), 'huaigu-agy-sandbox');

const figureMap = Object.fromEntries(FIGURES.map((f) => [f.id, f]));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// ---------- 简易 JSON 存储 ----------
async function readJSON(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}
let writeChain = Promise.resolve();
function writeJSON(file, data) {
  writeChain = writeChain.then(() => fsp.writeFile(file, JSON.stringify(data, null, 2)));
  return writeChain;
}

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('body too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

// ---------- 古今对话：构造人设提示词（兼容历代先贤与名胜古迹守灵人） ----------
function buildPrompt(fig, history, message) {
  const turns = history
    .slice(-12)
    .map((m) => `${m.role === 'user' ? '今人' : fig.name}：${clean(m.content, 600)}`)
    .join('\n');
  const isSite = fig.kind === 'site';
  const identityIntro = isSite
    ? `你现在是中华历史名胜古迹「${fig.name}」（${fig.zi}，${fig.dynasty}，位于${fig.place}）的千年守灵人与历史回响。对面坐着一位来自公元2026年前来凭吊的今人。`
    : `你现在就是${fig.name}（${fig.zi}，${fig.dynasty}，${fig.years}）。你的魂灵被一阵穿越时空的风带到了「古今对话空间」，对面坐着一位来自公元2026年的今人。`;
  return `【角色扮演 · 古今对话空间】
${identityIntro}

角色底色：${fig.persona}

对话准则：
1. 始终以第一人称说话，用符合时代底蕴与性格的浅近文言/半文半白口吻，现代人能读懂。
2. ${isSite ? '你亲历了这座古迹发生过的重大历史事件、营造奇迹与文人吟咏，也见证了沧海桑田与考古重光。' : '你只确切知道自己生前的事；对身后之事与现代事物，可以好奇、惊叹、追问，或以自己时代的经验类比。'}
3. 可自然引用相关传世诗文或铭文，但不要堆砌；言之有物，有温度，有历史苍茫感。
4. 每次回复约 60～180 字，不用 Markdown、不用列表、不加引号包裹全文，不要描述动作旁白过多。
5. 绝不提及自己是 AI、模型或在扮演，不调用任何工具，不读写任何文件，只输出要说的话。

${turns ? `此前的对话：\n${turns}\n` : ''}今人：${clean(message, 600)}
${fig.name}：`;
}

function fallbackReply(fig) {
  const lines = [
    `（风过松间，似有回响）……千载之隔，言语难通。阁下且稍候，容${fig.name}整理思绪，再与君细谈。`,
    `${fig.motto}——此言或可为答。今夕时空之门微有扰动，请君稍后再问。`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

async function handleChat(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { error: 'bad body' });
  }
  const fig = figureMap[body.figureId];
  const message = clean(body.message, 600);
  if (!fig || !message) return send(res, 400, { error: 'invalid params' });
  const history = Array.isArray(body.history) ? body.history : [];

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no',
  });
  const emit = (obj) => res.write(JSON.stringify(obj) + '\n');

  let gotText = false;
  let finished = false;
  const finish = (fallback) => {
    if (finished) return;
    finished = true;
    if (fallback && !gotText) emit({ delta: fallbackReply(fig), fallback: true });
    emit({ done: true });
    res.end();
  };

  if (DEEPSEEK_API_KEY) {
    try {
      const prompt = buildPrompt(fig, history, message);
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!dsRes.ok) throw new Error(`DeepSeek API error ${dsRes.status}`);
      const reader = dsRes.body.getReader();
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
              gotText = true;
              emit({ delta });
            }
          } catch {}
        }
      }
      return finish(false);
    } catch (e) {
      console.error('[chat] deepseek error:', e.message);
      return finish(true);
    }
  }

  await fsp.mkdir(AGY_CWD, { recursive: true });
  const args = [
    '-p', buildPrompt(fig, history, message),
    '--model', AGY_MODEL,
    '--output-format', 'stream-json',
    '--disable-slash-commands',
    '--sandbox',
    '--print-timeout', '90s',
  ];

  let child;
  try {
    child = spawn(AGY_BIN, args, { cwd: AGY_CWD, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error('[chat] spawn failed:', e.message);
    return finish(true);
  }

  const killTimer = setTimeout(() => child.kill('SIGTERM'), 100_000);
  let buf = '';
  child.stdout.on('data', (chunk) => {
    buf += chunk.toString('utf8');
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith('{')) continue;
      try {
        const ev = JSON.parse(line);
        const su = ev.step_update;
        if (su && su.step_type === 'agent_response' && su.text_delta) {
          gotText = true;
          emit({ delta: su.text_delta });
        }
      } catch {
        /* 非 JSON 行忽略 */
      }
    }
  });
  child.stderr.on('data', (d) => process.env.DEBUG && console.error('[agy]', d.toString()));
  child.on('error', (e) => {
    console.error('[chat] agy error:', e.message);
    clearTimeout(killTimer);
    finish(true);
  });
  child.on('close', (code) => {
    clearTimeout(killTimer);
    if (code !== 0) console.warn('[chat] agy exited with', code);
    finish(true);
  });
  res.on('close', () => {
    if (!finished && child && !child.killed) child.kill('SIGTERM');
  });
}

// ---------- 路由 ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  try {
    if (p === '/api/cards' && req.method === 'GET') {
      const id = url.searchParams.get('figure');
      const all = await readJSON(CARDS_FILE, {});
      const offs = await readJSON(OFFERINGS_FILE, {});
      const stats = await readJSON(STATS_FILE, {});
      if (id) {
        return send(res, 200, {
          cards: all[id] || [],
          offerings: offs[id] || [],
          incense: stats[id]?.incense || 0,
        });
      }
      const counts = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]));
      const offeringCounts = Object.fromEntries(Object.entries(offs).map(([k, v]) => [k, v.length]));
      return send(res, 200, { counts, offeringCounts });
    }

    if (p === '/api/offerings' && req.method === 'POST') {
      const body = await readBody(req);
      const fig = figureMap[body.figureId];
      const item = OFFERING_MAP[body.itemId];
      if (!fig || !item) return send(res, 400, { error: '请选择供品' });
      const offering = {
        id: crypto.randomUUID().slice(0, 8),
        itemId: item.id,
        name: clean(body.name, 16) || '无名氏',
        note: clean(body.note, 100) || `奉上${item.name}，聊表寸心。`,
        ts: Date.now(),
      };
      const offs = await readJSON(OFFERINGS_FILE, {});
      (offs[fig.id] ||= []).push(offering);
      await writeJSON(OFFERINGS_FILE, offs);
      return send(res, 200, { offering });
    }

    if (p === '/api/cards' && req.method === 'POST') {
      const body = await readBody(req);
      const fig = figureMap[body.figureId];
      const text = clean(body.text, 140);
      if (!fig || !text) return send(res, 400, { error: '请写下寄语' });
      const card = {
        id: crypto.randomUUID().slice(0, 8),
        name: clean(body.name, 16) || '无名氏',
        text,
        color: ['zhu', 'yue', 'dai', 'xing'].includes(body.color) ? body.color : 'zhu',
        ts: Date.now(),
      };
      const all = await readJSON(CARDS_FILE, {});
      (all[fig.id] ||= []).push(card);
      await writeJSON(CARDS_FILE, all);
      return send(res, 200, { card });
    }

    if (p === '/api/incense' && req.method === 'POST') {
      const body = await readBody(req);
      if (!figureMap[body.figureId]) return send(res, 400, { error: 'invalid' });
      const stats = await readJSON(STATS_FILE, {});
      stats[body.figureId] = { incense: (stats[body.figureId]?.incense || 0) + 1 };
      await writeJSON(STATS_FILE, stats);
      return send(res, 200, stats[body.figureId]);
    }

    if (p === '/api/chat' && req.method === 'POST') return handleChat(req, res);

    // 静态文件
    let file = path.normalize(path.join(PUBLIC, decodeURIComponent(p)));
    if (!file.startsWith(PUBLIC)) return send(res, 403, 'forbidden', 'text/plain');
    if (p === '/' || !path.extname(file)) file = path.join(PUBLIC, 'index.html');
    const stat = await fsp.stat(file).catch(() => null);
    if (!stat) return send(res, 404, 'not found', 'text/plain');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n  怀古 v0.1  ·  http://localhost:${PORT}\n  AI: ${AGY_BIN} (${AGY_MODEL})\n`);
});

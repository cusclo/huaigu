// Cloudflare Pages Function: /api/chat
export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.DEEPSEEK_API_KEY || 'sk-492f9dad3fa84902a0f9a4b54cd9a3d1';
  const baseURL = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = env.DEEPSEEK_MODEL || 'deepseek-chat';

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: '无效请求' }), { status: 400 });
  }

  const { figure = {}, figureId, message, history = [] } = body;
  const clean = (s, max = 600) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

  const isSite = figure.kind === 'site';
  const name = figure.name || figureId || '古人';
  const zi = figure.zi ? `（${figure.zi}）` : '';
  const dynasty = figure.dynasty ? `，${figure.dynasty}` : '';
  const years = figure.years ? `，${figure.years}` : '';
  const place = figure.place ? `，位于${figure.place}` : '';

  const identityIntro = isSite
    ? `你现在是中华历史名胜古迹「${name}」${zi}${dynasty}${place}的千年守灵人与历史回响。对面坐着一位来自公元2026年前来凭吊的今人。`
    : `你现在就是${name}${zi}${dynasty}${years}。你的魂灵被一阵穿越时空的风带到了「古今对话空间」，对面坐着一位来自公元2026年的今人。`;

  const systemPrompt = `【角色扮演 · 古今对话空间】
${identityIntro}

角色底色：${figure.persona || '深邃苍茫、言近旨远'}

对话准则：
1. 始终以第一人称说话，用符合时代底蕴与性格的浅近文言/半文半白口吻，现代人能读懂。
2. ${isSite ? '你亲历了这座古迹发生过的重大历史事件、营造奇迹与文人吟咏，也见证了沧海桑田与考古重光。' : '你只确切知道自己生前的事；对身后之事与现代事物，可以好奇、惊叹、追问，或以自己时代的经验类比。'}
3. 可自然引用相关传世诗文或铭文，但不要堆砌；言之有物，有温度，有历史苍茫感。
4. 每次回复约 60～180 字，不用 Markdown、不用列表、不加引号包裹全文，不要描述动作旁白过多。
5. 绝不提及自己是 AI、模型或在扮演，不调用任何工具，不读写任何文件，只输出要说的话。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: clean(m.content),
    })),
    { role: 'user', content: clean(message) },
  ];

  try {
    const dsRes = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!dsRes.ok) {
      const err = await dsRes.text();
      return new Response(JSON.stringify({ delta: `（时空微澜）……连接受阻：${err.slice(0, 80)}` }) + '\n', {
        headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = dsRes.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line.startsWith('data:')) continue;
            const dataStr = line.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                await writer.write(encoder.encode(JSON.stringify({ delta }) + '\n'));
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error('Stream processing error:', e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ delta: `（松风微动）……今夕时空稍有阻隔，君不妨稍后再问。` }) + '\n', {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
    });
  }
}

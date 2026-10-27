export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('figure');
  if (id) {
    return new Response(JSON.stringify({ cards: [], offerings: [], incense: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ counts: {}, offeringCounts: {} }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const card = {
    id: Math.random().toString(36).slice(2, 10),
    name: body.name || '无名氏',
    text: body.text || '',
    color: body.color || 'zhu',
    ts: Date.now(),
  };
  return new Response(JSON.stringify({ card }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

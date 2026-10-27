export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const offering = {
    id: Math.random().toString(36).slice(2, 10),
    itemId: body.itemId,
    name: body.name || '无名氏',
    note: body.note || '聊表寸心',
    ts: Date.now(),
  };
  return new Response(JSON.stringify({ offering }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

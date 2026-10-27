export async function onRequestPost(context) {
  return new Response(JSON.stringify({ incense: 1 }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

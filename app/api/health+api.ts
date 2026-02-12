export async function GET() {
  console.log('[Health API] Health check hit');
  return new Response(
    JSON.stringify({ ok: true, ts: Date.now(), version: '1.0.0' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

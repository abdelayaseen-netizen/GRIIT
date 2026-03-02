export async function GET() {
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

// Cloudflare Worker: Simple CORS proxy for binary archives (tgz/tar)
// Usage: https://<your-worker>.workers.dev/fetch?url=https%3A%2F%2Fexample.com%2Fcoreconf.tgz
// Optional: restrictByHost to allowlist domains

const restrictByHost = [];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname !== '/fetch') {
      return new Response('OK', { headers: corsHeaders() });
    }

    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', { status: 400, headers: corsHeaders() });
    }

    try {
      const t = new URL(target);
      if (!/^https?:$/.test(t.protocol)) throw new Error('Invalid protocol');
      if (restrictByHost.length && !restrictByHost.includes(t.host)) {
        return new Response('Host not allowed', { status: 403, headers: corsHeaders() });
      }

      const upstream = await fetch(t.toString(), { redirect: 'follow' });
      const respHeaders = new Headers(upstream.headers);
      // Ensure binary content-type fallback
      if (!respHeaders.get('content-type')) respHeaders.set('content-type', 'application/octet-stream');
      for (const [k, v] of Object.entries(corsHeaders())) respHeaders.set(k, v);
      return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
    } catch (e) {
      return new Response('Fetch error: ' + e.message, { status: 502, headers: corsHeaders() });
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Vary': 'Origin'
  };
}


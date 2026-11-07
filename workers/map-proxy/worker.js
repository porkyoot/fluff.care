import { connect } from 'cloudflare:sockets';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function buildRawHttpRequest(request, originHost, originPort) {
  const url = new URL(request.url);
  const pathAndQuery = (url.pathname || '/') + (url.search || '');
  const lines = [
    `${request.method} ${pathAndQuery} HTTP/1.1`,
    `Host: ${originHost}:${originPort}`,
    `User-Agent: ${request.headers.get('User-Agent') || 'CareFluff-MapProxy/1.0'}`,
    `Accept: ${request.headers.get('Accept') || '*/*'}`,
    'Connection: close',
    '',
    '',
  ];
  return new TextEncoder().encode(lines.join('\r\n'));
}

async function readStreamToBytes(readable) {
  const reader = readable.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

function findHeaderBoundary(buffer) {
  for (let i = 0; i < buffer.length - 3; i++) {
    const isCrLf = buffer[i] === 13 && buffer[i + 1] === 10;
    const isDouble = isCrLf && buffer[i + 2] === 13 && buffer[i + 3] === 10;
    if (isDouble) return i;
  }
  return -1;
}

function parseHttpHeaders(headerText) {
  const lines = headerText.split('\r\n');
  const match = (lines[0] || '').match(/HTTP\/\d\.\d\s+(\d+)/);
  const status = match ? Number(match[1]) : 200;
  const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
  for (const line of lines.slice(1)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (!/^(transfer-encoding|connection)$/i.test(key)) {
        headers.set(key, val);
      }
    }
  }
  return { status, headers };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const originHost = env.ORIGIN_HOST || 'carefur.nitro.games';
    const originPort = Number(env.ORIGIN_PORT || 25969);
    try {
      const socket = connect({ hostname: originHost, port: originPort });
      const writer = socket.writable.getWriter();
      await writer.write(buildRawHttpRequest(request, originHost, originPort));
      await writer.close();
      const raw = await readStreamToBytes(socket.readable);
      const splitIdx = findHeaderBoundary(raw);
      if (splitIdx === -1) {
        return new Response('BlueMap starting on 25969', { status: 502 });
      }
      const headerStr = new TextDecoder().decode(raw.subarray(0, splitIdx));
      const { status, headers } = parseHttpHeaders(headerStr);
      return new Response(raw.subarray(splitIdx + 4), { status, headers });
    } catch (err) {
      return new Response(`BlueMap Proxy Error: ${err.message}`, {
        status: 502,
      });
    }
  },
};

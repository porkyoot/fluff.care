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
    'Accept-Encoding: identity',
    '',
    '',
  ];
  return new TextEncoder().encode(lines.join('\r\n'));
}

function concatChunks(chunks, total) {
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

function findHeaderBoundary(buf) {
  for (let i = 0; i < buf.length - 3; i++) {
    if (
      buf[i] === 13 &&
      buf[i + 1] === 10 &&
      buf[i + 2] === 13 &&
      buf[i + 3] === 10
    ) {
      return i;
    }
  }
  return -1;
}

function parseHttpHeaders(headerText) {
  const lines = headerText.split('\r\n');
  const match = (lines[0] || '').match(/HTTP\/\d\.\d\s+(\d+)/);
  const status = match ? Number(match[1]) : 200;
  const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
  let isChunked = false;
  let contentLength = -1;
  for (const line of lines.slice(1)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (/^transfer-encoding$/i.test(key) && /chunked/i.test(val)) {
        isChunked = true;
      } else if (/^content-length$/i.test(key)) {
        contentLength = Number(val);
      } else if (!/^(transfer-encoding|connection|content-length)$/i.test(key)) {
        headers.set(key, val);
      }
    }
  }
  return { status, headers, isChunked, contentLength };
}

function decodeChunkedBody(buf) {
  const pieces = [];
  let total = 0;
  let pos = 0;
  while (pos < buf.length) {
    let lineEnd = -1;
    for (let i = pos; i < buf.length - 1; i++) {
      if (buf[i] === 13 && buf[i + 1] === 10) {
        lineEnd = i;
        break;
      }
    }
    if (lineEnd === -1) return { complete: false, body: null };
    const sizeHex = new TextDecoder()
      .decode(buf.subarray(pos, lineEnd))
      .split(';')[0]
      .trim();
    const chunkSize = parseInt(sizeHex, 16);
    if (Number.isNaN(chunkSize)) return { complete: false, body: null };
    if (chunkSize === 0) {
      if (buf.length >= lineEnd + 4) {
        return { complete: true, body: concatChunks(pieces, total) };
      }
      return { complete: false, body: null };
    }
    const dataStart = lineEnd + 2;
    const dataEnd = dataStart + chunkSize;
    if (buf.length < dataEnd + 2) return { complete: false, body: null };
    pieces.push(buf.subarray(dataStart, dataEnd));
    total += chunkSize;
    pos = dataEnd + 2;
  }
  return { complete: false, body: null };
}

async function readHttpResponse(readable, method) {
  const reader = readable.getReader();
  const chunks = [];
  let total = 0;
  let parsed = null;
  let bodyOffset = -1;

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
    const buf = concatChunks(chunks, total);
    if (!parsed) {
      const splitIdx = findHeaderBoundary(buf);
      if (splitIdx !== -1) {
        const headerStr = new TextDecoder().decode(buf.subarray(0, splitIdx));
        parsed = parseHttpHeaders(headerStr);
        bodyOffset = splitIdx + 4;
      }
    }
    if (parsed) {
      if (method === 'HEAD' || parsed.status === 204 || parsed.status === 304) {
        return { ...parsed, body: new Uint8Array(0) };
      }
      const rawBody = buf.subarray(bodyOffset);
      if (parsed.isChunked) {
        const decoded = decodeChunkedBody(rawBody);
        if (decoded.complete) {
          return { ...parsed, body: decoded.body };
        }
      } else if (parsed.contentLength >= 0) {
        if (rawBody.byteLength >= parsed.contentLength) {
          return {
            ...parsed,
            body: rawBody.subarray(0, parsed.contentLength),
          };
        }
      } else if (done) {
        return { ...parsed, body: rawBody };
      }
    }
    if (done) break;
  }
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const originHost = env.ORIGIN_HOST || 'carefur.nitro.games';
    const originPort = Number(env.ORIGIN_PORT || 25969);
    const socket = connect({ hostname: originHost, port: originPort });
    try {
      const writer = socket.writable.getWriter();
      await writer.write(buildRawHttpRequest(request, originHost, originPort));
      writer.releaseLock();
      const res = await readHttpResponse(socket.readable, request.method);
      socket.close();
      if (!res) {
        return new Response('BlueMap starting on 25969', { status: 502 });
      }
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    } catch (err) {
      socket.close();
      return new Response(`BlueMap Proxy Error: ${err.message}`, {
        status: 502,
      });
    }
  },
};

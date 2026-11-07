import { connect } from 'cloudflare:sockets';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function buildRawHttpRequest(request, originHost, originPort) {
  const url = new URL(request.url);
  const pathAndQuery = (url.pathname || '/') + (url.search || '');
  const acceptEnc = request.headers.get('Accept-Encoding') || 'gzip';
  const lines = [
    `${request.method === 'HEAD' ? 'GET' : request.method} ${pathAndQuery} HTTP/1.1`,
    `Host: ${originHost}:${originPort}`,
    `User-Agent: ${request.headers.get('User-Agent') || 'CareFluff-MapProxy/1.0'}`,
    `Accept: ${request.headers.get('Accept') || '*/*'}`,
    `Accept-Encoding: ${acceptEnc.includes('gzip') ? 'gzip' : 'identity'}`,
    '',
    '',
  ];
  return new TextEncoder().encode(lines.join('\r\n'));
}

function concatChunks(chunks, total) {
  if (chunks.length === 1) return chunks[0];
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

function endsWithZeroChunk(chunks) {
  const n = chunks.length;
  if (n === 0) return false;
  const last = chunks[n - 1];
  const len = last.byteLength;
  if (len >= 5) {
    return (
      last[len - 5] === 48 &&
      last[len - 4] === 13 &&
      last[len - 3] === 10 &&
      last[len - 2] === 13 &&
      last[len - 1] === 10
    );
  }
  if (n < 2) return false;
  const prev = chunks[n - 2];
  const tail = new Uint8Array(prev.byteLength + len);
  tail.set(prev, 0);
  tail.set(last, prev.byteLength);
  const tLen = tail.byteLength;
  if (tLen < 5) return false;
  return (
    tail[tLen - 5] === 48 &&
    tail[tLen - 4] === 13 &&
    tail[tLen - 3] === 10 &&
    tail[tLen - 2] === 13 &&
    tail[tLen - 1] === 10
  );
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

function parseHexSize(buf, start, end) {
  let val = 0;
  let digits = 0;
  for (let i = start; i < end; i++) {
    const c = buf[i];
    if (c === 59 || c === 32) break;
    let d = -1;
    if (c >= 48 && c <= 57) d = c - 48;
    else if (c >= 97 && c <= 102) d = c - 87;
    else if (c >= 65 && c <= 70) d = c - 55;
    if (d === -1) return -1;
    val = val * 16 + d;
    digits++;
  }
  return digits > 0 ? val : -1;
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
    const chunkSize = parseHexSize(buf, pos, lineEnd);
    if (chunkSize < 0) return { complete: false, body: null };
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
    if (value && value.byteLength > 0) {
      chunks.push(value);
      total += value.byteLength;
    }
    if (!parsed && total > 0) {
      const headBuf = concatChunks(chunks, total);
      const splitIdx = findHeaderBoundary(headBuf);
      if (splitIdx !== -1) {
        const headerStr = new TextDecoder().decode(
          headBuf.subarray(0, splitIdx)
        );
        parsed = parseHttpHeaders(headerStr);
        bodyOffset = splitIdx + 4;
      }
    }
    if (parsed) {
      if (method === 'HEAD' || parsed.status === 204 || parsed.status === 304) {
        return { ...parsed, body: null };
      }
      if (parsed.isChunked) {
        if (done || endsWithZeroChunk(chunks)) {
          const fullBuf = concatChunks(chunks, total);
          const decoded = decodeChunkedBody(fullBuf.subarray(bodyOffset));
          if (decoded.complete) {
            return { ...parsed, body: decoded.body };
          }
        }
      } else if (parsed.contentLength >= 0) {
        if (total - bodyOffset >= parsed.contentLength) {
          const fullBuf = concatChunks(chunks, total);
          return {
            ...parsed,
            body: fullBuf.subarray(
              bodyOffset,
              bodyOffset + parsed.contentLength
            ),
          };
        }
      } else if (done) {
        const fullBuf = concatChunks(chunks, total);
        return { ...parsed, body: fullBuf.subarray(bodyOffset) };
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
    const url = new URL(request.url);
    if (url.pathname.endsWith('/live/sse')) {
      return new Response(null, {
        status: 404,
        headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
      });
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
        return new Response('BlueMap starting on 25969', {
          status: 502,
          headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
        });
      }
      const isNullBody =
        request.method === 'HEAD' || res.status === 204 || res.status === 304;
      return new Response(isNullBody ? null : res.body, {
        status: res.status,
        headers: res.headers,
        encodeBody: 'manual',
      });
    } catch (err) {
      socket.close();
      return new Response(`BlueMap Proxy Error: ${err.message}`, {
        status: 502,
        headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' },
      });
    }
  },
};

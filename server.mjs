import { createHash, randomUUID } from 'node:crypto';
import { link, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';

const storage = process.env.SIGNUP_DIR;
if (!storage) throw new Error('Set SIGNUP_DIR to a private, persistent directory.');
await mkdir(storage, { recursive: true, mode: 0o700 });
const page = await readFile(new URL('./index.html', import.meta.url));
const scopes = new Set(['both', 'restoration', 'design']);

const server = createServer(async (request, response) => {
  const path = request.url.split('?')[0];
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET' && ['/', '/bid-radar', '/bid-radar/'].includes(path)) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return response.end(page);
  }
  const reply = (status, message) => {
    response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SEMU Bid Radar</title><main><h1>${message}</h1><a href="/bid-radar/">Return to Bid Radar</a></main></html>`);
  };
  if (request.method !== 'POST' || path !== '/bid-radar/signup') return reply(404, 'Page unavailable.');
  if (request.headers['content-type']?.split(';')[0] !== 'application/x-www-form-urlencoded') {
    return reply(415, 'Please use the signup form.');
  }
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 8192) return reply(413, 'The signup form is too large.');
      chunks.push(chunk);
    }
    const form = new URLSearchParams(Buffer.concat(chunks).toString());
    const email = (form.get('email') ?? '').trim().toLowerCase();
    const firm = (form.get('firm') ?? '').trim();
    const region = (form.get('region') ?? '').trim();
    const scope = form.get('scope');
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !firm || firm.length > 120 || region.length > 160 ||
        !scopes.has(scope) || form.get('consent') !== 'yes') {
      return reply(400, 'Check the required fields and consent, then try again.');
    }
    const id = createHash('sha256').update(email).digest('hex');
    const temporary = join(storage, `.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, JSON.stringify({ email, firm, scope, region, consent: true, requestedAt: new Date().toISOString() }) + '\n', { mode: 0o600, flag: 'wx' });
      await link(temporary, join(storage, `${id}.json`));
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    } finally {
      await unlink(temporary).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
    return reply(200, 'Your trial request was received.');
  } catch {
    return reply(503, 'Signup is temporarily unavailable. Please try again.');
  }
});
server.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');

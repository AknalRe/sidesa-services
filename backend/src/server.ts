import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { ensureDatabaseSchema } from './db';
import authRouter from './routes/auth';
import publicRouter from './routes/public';
import adminRouter from './routes/admin';
import superadminRouter from './routes/superadmin';

const PORT = Number(process.env.PORT || 5000);
export const UPLOAD_DIR = path.resolve(process.env.SIDESA_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

async function start() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fastify = Fastify({ logger: false, bodyLimit: 12 * 1024 * 1024 });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
  await fastify.register(cookie);

  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'reneo-sidesa',
    timestamp: new Date().toISOString(),
  }));

  fastify.get<{ Params: { filename: string } }>('/api/uploads/:filename', async (req, reply) => {
    const rawName = String(req.params.filename || '').trim();
    const safeName = path.basename(rawName);
    if (!safeName || safeName !== rawName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
      return reply.status(400).send({ success: false, error: 'Nama file tidak valid.' });
    }
    const filePath = path.join(UPLOAD_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ success: false, error: 'File tidak ditemukan.' });
    }
    const ext = path.extname(safeName).toLowerCase();
    reply.header('Content-Type', MIME_BY_EXT[ext] || 'application/octet-stream');
    reply.header('Cache-Control', 'public, max-age=31536000, immutable');
    return reply.send(fs.createReadStream(filePath));
  });

  await fastify.register(authRouter, { prefix: '/api/auth' });
  await fastify.register(publicRouter, { prefix: '/api/public' });
  await fastify.register(adminRouter, { prefix: '/api/admin' });
  await fastify.register(superadminRouter, { prefix: '/api/superadmin' });

  await ensureDatabaseSchema();

  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[Reneo SIDesa] Backend listening on http://0.0.0.0:${PORT}`);
}

start().catch((err) => {
  console.error('[Reneo SIDesa] Fatal startup error:', err);
  process.exit(1);
});

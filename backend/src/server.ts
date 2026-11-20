import 'dotenv/config';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { ensureDatabaseSchema } from './db';
import authRouter from './routes/auth';
import publicRouter from './routes/public';
import adminRouter from './routes/admin';
import superadminRouter from './routes/superadmin';

const PORT = Number(process.env.PORT || 5000);

async function start() {
  const fastify = Fastify({ logger: false });

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

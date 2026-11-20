import crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { count, eq } from 'drizzle-orm';
import { db, getDefaultVillage } from '../db';
import { DEFAULT_VILLAGE_ID, villages, villageUsers } from '../db/schema';

export const SESSION_COOKIE = 'sidesa_session';

function getSigningSecret(): string {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || 'sidesa-dev-secret-key';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

export interface SessionUser {
  id: string;
  villageId: string;
  name: string;
  email: string;
  role: string;
}

function signToken(payload: SessionUser): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 86400_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): SessionUser | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', getSigningSecret()).update(data).digest('base64url');
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (!parsed?.id || (parsed.exp && Date.now() > parsed.exp)) return null;
    return {
      id: parsed.id,
      villageId: parsed.villageId || DEFAULT_VILLAGE_ID,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role || 'ADMIN',
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(req: FastifyRequest): Promise<SessionUser | null> {
  const raw = (req.cookies as Record<string, string | undefined>)?.[SESSION_COOKIE];
  if (!raw) return null;
  return verifyToken(raw);
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const user = await getCurrentUser(req);
  if (!user) {
    return reply.status(401).send({ success: false, error: 'Silakan masuk sebagai Perangkat Desa terlebih dahulu.' });
  }
  (req as any).sidesaUser = user;
}

export default async function authRouter(fastify: FastifyInstance) {
  fastify.get('/status', async (req) => {
    const [{ total }] = await db.select({ total: count() }).from(villageUsers);
    const user = await getCurrentUser(req);
    const village = user
      ? (await db.select().from(villages).where(eq(villages.id, user.villageId)).limit(1))[0] ||
        (await getDefaultVillage())
      : await getDefaultVillage();
    return {
      success: true,
      data: {
        initialized: total > 0,
        authenticated: Boolean(user),
        user,
        village: village
          ? { id: village.id, name: village.name, slug: village.slug, district: village.district, regency: village.regency }
          : null,
      },
    };
  });

  fastify.post<{ Body: { name: string; email: string; password: string; villageName?: string } }>(
    '/setup',
    async (req, reply) => {
      const [{ total }] = await db.select({ total: count() }).from(villageUsers);
      if (total > 0) {
        return reply.status(409).send({ success: false, error: 'Akun admin desa sudah diinisialisasi. Silakan login.' });
      }
      const name = String(req.body?.name || '').trim();
      const email = String(req.body?.email || '').trim().toLowerCase();
      const password = String(req.body?.password || '');
      if (!name || !email || password.length < 6) {
        return reply.status(400).send({
          success: false,
          error: 'Nama, email, dan kata sandi (minimal 6 karakter) wajib diisi.',
        });
      }
      const village = await getDefaultVillage();
      const villageId = village?.id || DEFAULT_VILLAGE_ID;
      if (req.body?.villageName?.trim() && village) {
        await db
          .update(villages)
          .set({ name: req.body.villageName.trim(), updatedAt: new Date() })
          .where(eq(villages.id, village.id));
      }
      const userId = crypto.randomUUID();
      await db.insert(villageUsers).values({
        id: userId,
        villageId,
        name,
        email,
        passwordHash: hashPassword(password),
        role: 'ADMIN',
        position: 'Administrator Desa',
      });
      const sessionUser: SessionUser = { id: userId, villageId, name, email, role: 'ADMIN' };
      reply.setCookie(SESSION_COOKIE, signToken(sessionUser), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 86400,
      });
      return { success: true, data: { user: sessionUser } };
    }
  );

  fastify.post<{ Body: { email: string; password: string } }>('/login', async (req, reply) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return reply.status(400).send({ success: false, error: 'Email dan kata sandi wajib diisi.' });
    }
    const [found] = await db
      .select()
      .from(villageUsers)
      .where(eq(villageUsers.email, email))
      .limit(1);
    if (!found || !found.active || !verifyPassword(password, found.passwordHash)) {
      return reply.status(401).send({ success: false, error: 'Email atau kata sandi salah.' });
    }
    const sessionUser: SessionUser = {
      id: found.id,
      villageId: found.villageId,
      name: found.name,
      email: found.email,
      role: found.role,
    };
    reply.setCookie(SESSION_COOKIE, signToken(sessionUser), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });
    return { success: true, data: { user: sessionUser } };
  });

  fastify.post('/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { success: true };
  });
}

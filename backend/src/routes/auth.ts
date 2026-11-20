import crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { count, eq } from 'drizzle-orm';
import { db, getDefaultVillage } from '../db';
import { DEFAULT_VILLAGE_ID, villageIndicators, villages, villageUsers } from '../db/schema';
import { slugifyTitle } from '../lib/helpers';

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

  fastify.post<{
    Body: {
      villageName: string;
      slug?: string;
      district?: string;
      regency?: string;
      province?: string;
      kodeDesa?: string;
      name: string;
      email: string;
      password: string;
    };
  }>('/register-village', async (req, reply) => {
    const villageName = String(req.body?.villageName || '').trim();
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!villageName || !name || !email || password.length < 6) {
      return reply.status(400).send({
        success: false,
        error: 'Nama desa, nama perangkat admin, email, dan kata sandi (minimal 6 karakter) wajib diisi.',
      });
    }

    const [existingUser] = await db.select().from(villageUsers).where(eq(villageUsers.email, email)).limit(1);
    if (existingUser) {
      return reply.status(409).send({ success: false, error: 'Email tersebut sudah terdaftar. Silakan login.' });
    }

    const baseSlug = slugifyTitle(req.body?.slug?.trim() || villageName.replace(/^desa\s+/i, '')) || 'desa';
    let finalSlug = baseSlug;
    const [existingSlug] = await db.select().from(villages).where(eq(villages.slug, finalSlug)).limit(1);
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const villageId = `village-${finalSlug}`;
    const district = String(req.body?.district || 'Kecamatan').trim();
    const regency = String(req.body?.regency || 'Kabupaten').trim();
    const province = String(req.body?.province || 'Jawa Timur').trim();

    await db.insert(villages).values({
      id: villageId,
      name: villageName,
      slug: finalSlug,
      kodeDesa: String(req.body?.kodeDesa || '35.00.00.2001').trim(),
      district,
      regency,
      province,
      postalCode: '60000',
      headName: name,
      headTitle: 'Kepala Desa',
      headGreeting: `Selamat datang di Website Resmi ${villageName}, Kecamatan ${district}, Kabupaten ${regency}. Portal ini menjadi sarana pelayanan publik mandiri dan keterbukaan informasi bagi seluruh warga.`,
      vision: `Terwujudnya ${villageName} yang Maju, Mandiri, Transparan, dan Sejahtera.`,
      mission: `1. Meningkatkan kualitas pelayanan administrasi dan persuratan warga secara digital.\n2. Mewujudkan keterbukaan informasi publik dan akuntabilitas APBDes.\n3. Mengembangkan potensi ekonomi warga dan UMKM desa.`,
      history: `${villageName} merupakan desa di wilayah Kecamatan ${district}, Kabupaten ${regency}, Provinsi ${province} yang terus berbenah meningkatkan pelayanan publik dan pembangunan masyarakat.`,
      address: `Kantor Balai ${villageName}, Kec. ${district}, Kab. ${regency}`,
      areaKm2: 4.5,
      boundariesJson: JSON.stringify({ north: 'Desa Sebelah Utara', east: 'Desa Sebelah Timur', south: 'Desa Sebelah Selatan', west: 'Desa Sebelah Barat' }),
    });

    await db.insert(villageIndicators).values({
      id: crypto.randomUUID(),
      villageId,
      year: new Date().getFullYear(),
      idmScore: 0.752,
      idmStatus: 'MAJU',
      sdgsScore: 74.5,
      stuntingCases: 0,
      stuntingRate: 0,
      dimensionsJson: JSON.stringify([
        { name: 'Layanan Dasar', score: 82 },
        { name: 'Sosial', score: 78 },
        { name: 'Ekonomi', score: 74 },
        { name: 'Lingkungan', score: 76 },
        { name: 'Aksesibilitas', score: 80 },
        { name: 'Tata Kelola Pemerintahan Desa', score: 85 },
      ]),
    });

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
    return reply.status(201).send({
      success: true,
      data: { user: sessionUser, villageSlug: finalSlug },
    });
  });

  fastify.post('/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { success: true };
  });
}

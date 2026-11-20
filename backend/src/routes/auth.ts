import crypto from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { count, eq } from 'drizzle-orm';
import { calculateSubscriptionAmount, db, getDefaultVillage } from '../db';
import {
  DEFAULT_VILLAGE_ID,
  subscriptionInvoices,
  subscriptionPlans,
  villageIndicators,
  villages,
  villageUsers,
} from '../db/schema';
import { slugifyTitle } from '../lib/helpers';
import { verifyStudentPddikti } from '../services/pddikti.service';

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
  villageId: string | null;
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
      villageId: parsed.villageId ?? null,
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
    return reply.status(401).send({ success: false, error: 'Silakan masuk terlebih dahulu.' });
  }
  (req as any).sidesaUser = user;
}

export async function requireSuperadmin(req: FastifyRequest, reply: FastifyReply) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'SUPERADMIN') {
    return reply.status(403).send({ success: false, error: 'Akses ditolak. Khusus Superadmin Platform Reneo SIDesa.' });
  }
  (req as any).sidesaUser = user;
}

function generateInvoiceNumber(): string {
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rnd = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-SIDESA-${ym}-${rnd}`;
}

export default async function authRouter(fastify: FastifyInstance) {
  fastify.get('/status', async (req) => {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(villageUsers);
    const [{ totalSuperadmins }] = await db
      .select({ totalSuperadmins: count() })
      .from(villageUsers)
      .where(eq(villageUsers.role, 'SUPERADMIN'));
    const user = await getCurrentUser(req);
    const village = user?.villageId
      ? (await db.select().from(villages).where(eq(villages.id, user.villageId)).limit(1))[0] || null
      : null;
    return {
      success: true,
      data: {
        initialized: totalUsers > 0,
        superadminInitialized: totalSuperadmins > 0,
        authenticated: Boolean(user),
        user,
        village: village
          ? {
              id: village.id,
              name: village.name,
              slug: village.slug,
              district: village.district,
              regency: village.regency,
              status: village.status,
              licenseStatus: village.licenseStatus,
              licensePlan: village.licensePlan,
              licenseExpiresAt: village.licenseExpiresAt,
            }
          : null,
      },
    };
  });

  // Setup akun SUPERADMIN Platform Reneo SIDesa pertama kali
  fastify.post<{ Body: { name: string; email: string; password: string } }>('/setup', async (req, reply) => {
    const [{ totalSuperadmins }] = await db
      .select({ totalSuperadmins: count() })
      .from(villageUsers)
      .where(eq(villageUsers.role, 'SUPERADMIN'));
    if (totalSuperadmins > 0) {
      return reply
        .status(409)
        .send({ success: false, error: 'Akun Superadmin Platform sudah terdaftar. Silakan masuk.' });
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
    const [existingEmail] = await db.select().from(villageUsers).where(eq(villageUsers.email, email)).limit(1);
    if (existingEmail) {
      return reply.status(409).send({ success: false, error: 'Email tersebut sudah terdaftar.' });
    }
    const userId = crypto.randomUUID();
    await db.insert(villageUsers).values({
      id: userId,
      villageId: null,
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'SUPERADMIN',
      position: 'Superadmin Platform SIDesa',
    });
    const sessionUser: SessionUser = { id: userId, villageId: null, name, email, role: 'SUPERADMIN' };
    reply.setCookie(SESSION_COOKIE, signToken(sessionUser), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });
    return { success: true, data: { user: sessionUser } };
  });

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
      planCode?: string;
      durationMonths?: number;
      paymentMethod?: string;
      studentNim?: string;
      studentName?: string;
      studentUniversity?: string;
      studentProgram?: string;
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

    const planCode = String(req.body?.planCode || 'PRO').toUpperCase();
    let studentIdentityJson: string | null = null;
    if (planCode === 'KKN') {
      const nim = String(req.body?.studentNim || '').trim();
      const studentName = String(req.body?.studentName || name).trim();
      const university = String(req.body?.studentUniversity || '').trim();
      const studyProgram = String(req.body?.studentProgram || '').trim();
      if (!nim || !studentName || !university) {
        return reply.status(400).send({
          success: false,
          error: 'Paket Mahasiswa KKN wajib menyertakan NIM, Nama Mahasiswa, dan Perguruan Tinggi.',
        });
      }
      const verification = await verifyStudentPddikti({ nim, studentName, university, studyProgram });
      if (verification.status === 'NON_AKTIF') {
        return reply.status(400).send({ success: false, error: verification.message });
      }
      studentIdentityJson = JSON.stringify({
        nim,
        studentName,
        university,
        studyProgram,
        verification,
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

    const durationMonths = [1, 6, 12, 24].includes(Number(req.body?.durationMonths))
      ? Number(req.body?.durationMonths)
      : 12;
    const paymentMethod = String(req.body?.paymentMethod || 'TRANSFER_BANK').toUpperCase();

    const [selectedPlan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.code, planCode))
      .limit(1);
    const plan = selectedPlan || {
      code: 'PRO',
      name: 'Paket Desa Digital Pro',
      priceMonthly: 250000,
      priceYearly: 2500000,
    };
    const totalAmount = calculateSubscriptionAmount(plan, durationMonths);

    const villageId = `village-${finalSlug}`;
    const district = String(req.body?.district || 'Kecamatan').trim();
    const regency = String(req.body?.regency || 'Kabupaten').trim();
    const province = String(req.body?.province || 'Jawa Timur').trim();

    await db.insert(villages).values({
      id: villageId,
      name: villageName,
      slug: finalSlug,
      kodeDesa: String(req.body?.kodeDesa || '').trim() || null,
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
      boundariesJson: JSON.stringify({ north: '-', east: '-', south: '-', west: '-' }),
      status: 'PENDING_PAYMENT',
      licenseStatus: 'PENDING_PAYMENT',
      licensePlan: plan.name,
      licenseExpiresAt: null,
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

    // Terbitkan Invoice Berlangganan layaknya hosting
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = generateInvoiceNumber();
    const [invoice] = await db
      .insert(subscriptionInvoices)
      .values({
        id: invoiceId,
        invoiceNumber,
        villageId,
        planCode: plan.code,
        planName: plan.name,
        durationMonths,
        amount: totalAmount,
        status: 'UNPAID',
        paymentMethod,
        studentIdentityJson,
      })
      .returning();

    const sessionUser: SessionUser = { id: userId, villageId, name, email, role: 'ADMIN' };
    reply.setCookie(SESSION_COOKIE, signToken(sessionUser), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });
    return reply.status(201).send({
      success: true,
      data: { user: sessionUser, villageSlug: finalSlug, invoice },
    });
  });

  // Klaim desa yang sudah dipublikasikan Superadmin namun belum diklaim perangkat desa
  fastify.post<{
    Body: {
      villageSlug: string;
      name: string;
      position?: string;
      phone?: string;
      email: string;
      password: string;
      planCode?: string;
      durationMonths?: number;
      paymentMethod?: string;
      studentNim?: string;
      studentName?: string;
      studentUniversity?: string;
      studentProgram?: string;
    };
  }>('/claim-village', async (req, reply) => {
    const villageSlug = String(req.body?.villageSlug || '').trim();
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!villageSlug || !name || !email || password.length < 6) {
      return reply.status(400).send({
        success: false,
        error: 'Desa, nama perangkat desa, email, dan kata sandi (minimal 6 karakter) wajib diisi.',
      });
    }

    const planCode = String(req.body?.planCode || 'PRO').toUpperCase();
    let studentIdentityJson: string | null = null;
    if (planCode === 'KKN') {
      const nim = String(req.body?.studentNim || '').trim();
      const studentName = String(req.body?.studentName || name).trim();
      const university = String(req.body?.studentUniversity || '').trim();
      const studyProgram = String(req.body?.studentProgram || '').trim();
      if (!nim || !studentName || !university) {
        return reply.status(400).send({
          success: false,
          error: 'Paket Mahasiswa KKN wajib menyertakan NIM, Nama Mahasiswa, dan Perguruan Tinggi.',
        });
      }
      const verification = await verifyStudentPddikti({ nim, studentName, university, studyProgram });
      if (verification.status === 'NON_AKTIF') {
        return reply.status(400).send({ success: false, error: verification.message });
      }
      studentIdentityJson = JSON.stringify({
        nim,
        studentName,
        university,
        studyProgram,
        verification,
      });
    }

    const [village] = await db.select().from(villages).where(eq(villages.slug, villageSlug)).limit(1);
    if (!village) {
      return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    }
    if (village.isClaimed) {
      return reply.status(409).send({
        success: false,
        error: 'Desa ini sudah diklaim dan dikelola oleh perangkat desa resmi.',
      });
    }

    const [existingUser] = await db.select().from(villageUsers).where(eq(villageUsers.email, email)).limit(1);
    if (existingUser) {
      return reply.status(409).send({ success: false, error: 'Email tersebut sudah terdaftar. Silakan gunakan email lain.' });
    }

    const durationMonths = [1, 6, 12, 24].includes(Number(req.body?.durationMonths))
      ? Number(req.body?.durationMonths)
      : 12;
    const paymentMethod = String(req.body?.paymentMethod || 'TRANSFER_BANK').toUpperCase();

    const [selectedPlan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.code, planCode))
      .limit(1);
    const plan = selectedPlan || {
      code: 'PRO',
      name: 'Paket Desa Digital Pro',
      priceMonthly: 250000,
      priceYearly: 2500000,
    };
    const totalAmount = calculateSubscriptionAmount(plan, durationMonths);

    const userId = crypto.randomUUID();
    await db.insert(villageUsers).values({
      id: userId,
      villageId: village.id,
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'ADMIN',
      phone: String(req.body?.phone || '').trim() || null,
      position: String(req.body?.position || 'Administrator Desa').trim(),
    });

    await db
      .update(villages)
      .set({
        isClaimed: true,
        licenseStatus: 'PENDING_PAYMENT',
        licensePlan: plan.name,
        updatedAt: new Date(),
      })
      .where(eq(villages.id, village.id));

    const invoiceNumber = generateInvoiceNumber();
    const [invoice] = await db
      .insert(subscriptionInvoices)
      .values({
        id: crypto.randomUUID(),
        invoiceNumber,
        villageId: village.id,
        planCode: plan.code,
        planName: plan.name,
        durationMonths,
        amount: totalAmount,
        status: 'UNPAID',
        paymentMethod,
        studentIdentityJson,
      })
      .returning();

    const sessionUser: SessionUser = { id: userId, villageId: village.id, name, email, role: 'ADMIN' };
    reply.setCookie(SESSION_COOKIE, signToken(sessionUser), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });

    return reply.status(201).send({
      success: true,
      data: { user: sessionUser, villageSlug: village.slug, invoice },
    });
  });

  fastify.post('/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { success: true };
  });
}

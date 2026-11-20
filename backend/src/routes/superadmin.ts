import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  platformSettings,
  subscriptionInvoices,
  subscriptionPlans,
  villageIndicators,
  villages,
  villageUsers,
} from '../db/schema';
import { slugifyTitle } from '../lib/helpers';
import { getWilayahDetail } from '../services/wilayah.service';
import { getReneoPaymentMethods, isReneoPaymentEcosystemEnabled } from '../services/reneoPayment.service';
import { requireSuperadmin } from './auth';

export default async function superadminRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireSuperadmin);

  // Ringkasan Platform SaaS SIDesa
  fastify.get('/overview', async () => {
    const [allVillages, allInvoices, allUsers] = await Promise.all([
      db.select().from(villages).orderBy(desc(villages.createdAt)),
      db.select().from(subscriptionInvoices).orderBy(desc(subscriptionInvoices.createdAt)),
      db.select().from(villageUsers),
    ]);

    const activeVillages = allVillages.filter((v) => v.status === 'ACTIVE' && v.licenseStatus === 'ACTIVE').length;
    const pendingVillages = allVillages.filter((v) => v.licenseStatus === 'PENDING_PAYMENT').length;
    const waitingVerificationInvoices = allInvoices.filter((i) => i.status === 'WAITING_VERIFICATION').length;
    const unpaidInvoices = allInvoices.filter((i) => i.status === 'UNPAID').length;
    const totalRevenuePaid = allInvoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    return {
      success: true,
      data: {
        totalVillages: allVillages.length,
        activeVillages,
        pendingVillages,
        waitingVerificationInvoices,
        unpaidInvoices,
        totalRevenuePaid,
        totalAdmins: allUsers.filter((u) => u.role !== 'SUPERADMIN').length,
      },
    };
  });

  // Daftar seluruh desa terdaftar beserta admin & masa aktif langganan
  fastify.get('/villages', async () => {
    const [rows, users] = await Promise.all([
      db.select().from(villages).orderBy(desc(villages.createdAt)),
      db.select().from(villageUsers),
    ]);
    const adminMap = new Map<string, { name: string; email: string }>();
    for (const u of users) {
      if (u.villageId && !adminMap.has(u.villageId)) {
        adminMap.set(u.villageId, { name: u.name, email: u.email });
      }
    }
    return {
      success: true,
      data: rows.map((v) => ({
        ...v,
        adminName: adminMap.get(v.id)?.name || '-',
        adminEmail: adminMap.get(v.id)?.email || '-',
      })),
    };
  });

  // Superadmin membuat desa baru (bisa langsung dipublikasikan & belum diklaim agar bisa diklaim perangkat desa)
  fastify.post<{
    Body: {
      name: string;
      slug?: string;
      kodeDesa?: string;
      district?: string;
      regency?: string;
      province?: string;
      headName?: string;
      logoUrl?: string;
      heroImageUrl?: string;
      publishNow?: boolean;
    };
  }>('/villages', async (req, reply) => {
    const name = String(req.body?.name || '').trim();
    if (!name) {
      return reply.status(400).send({ success: false, error: 'Nama desa wajib diisi.' });
    }
    const baseSlug = slugifyTitle(req.body?.slug?.trim() || name.replace(/^desa\s+/i, '')) || 'desa';
    let finalSlug = baseSlug;
    const [existingSlug] = await db.select().from(villages).where(eq(villages.slug, finalSlug)).limit(1);
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }
    const villageId = `village-${finalSlug}`;
    const district = String(req.body?.district || '').trim();
    const regency = String(req.body?.regency || '').trim();
    const province = String(req.body?.province || 'Jawa Timur').trim();
    const publishNow = req.body?.publishNow !== false;
    const kodeDesaClean = String(req.body?.kodeDesa || '').trim() || null;

    let mapLat = -7.2575;
    let mapLng = 112.0125;
    let postalCode = '';
    if (kodeDesaClean) {
      const geo = await getWilayahDetail(kodeDesaClean).catch(() => null);
      if (geo?.coordinates?.lat && geo?.coordinates?.lng) {
        mapLat = Number(geo.coordinates.lat);
        mapLng = Number(geo.coordinates.lng);
      }
      if (geo?.kodepos) postalCode = String(geo.kodepos);
    }

    const [created] = await db
      .insert(villages)
      .values({
        id: villageId,
        name,
        slug: finalSlug,
        kodeDesa: kodeDesaClean,
        district,
        regency,
        province,
        postalCode,
        mapLat,
        mapLng,
        headName: String(req.body?.headName || '').trim(),
        headTitle: 'Kepala Desa',
        headGreeting: `Selamat datang di Website Resmi ${name}${district ? `, Kecamatan ${district}` : ''}${regency ? `, Kabupaten ${regency}` : ''}.`,
        vision: `Terwujudnya ${name} yang Maju, Mandiri, Transparan, dan Sejahtera.`,
        mission: `1. Meningkatkan pelayanan administrasi dan persuratan warga secara digital.\n2. Mewujudkan keterbukaan informasi publik dan transparansi APBDes.\n3. Mengembangkan potensi ekonomi dan UMKM warga desa.`,
        history: `${name} merupakan desa di wilayah ${district ? `Kecamatan ${district}, ` : ''}${regency ? `Kabupaten ${regency}, ` : ''}Provinsi ${province}.`,
        address: `Kantor Balai ${name}`,
        logoUrl: req.body?.logoUrl?.trim() || null,
        heroImageUrl: req.body?.heroImageUrl?.trim() || null,
        status: publishNow ? 'ACTIVE' : 'DRAFT',
        isClaimed: false,
        licenseStatus: 'UNCLAIMED',
        licensePlan: 'Belum Diklaim',
        licenseExpiresAt: null,
      })
      .returning();

    await db.insert(villageIndicators).values({
      id: crypto.randomUUID(),
      villageId,
      year: new Date().getFullYear(),
      idmScore: 0.75,
      idmStatus: 'MAJU',
      sdgsScore: 74.0,
      stuntingCases: 0,
      stuntingRate: 0,
      dimensionsJson: JSON.stringify([
        { name: 'Layanan Dasar', score: 80 },
        { name: 'Sosial', score: 78 },
        { name: 'Ekonomi', score: 74 },
        { name: 'Lingkungan', score: 76 },
      ]),
    });

    return reply.status(201).send({ success: true, data: created });
  });

  // Ubah status desa / publikasi / perpanjang masa aktif langganan secara manual
  fastify.patch<{
    Params: { id: string };
    Body: { status?: string; licenseStatus?: string; licensePlan?: string; isClaimed?: boolean; extendMonths?: number };
  }>('/villages/:id', async (req, reply) => {
    const [existing] = await db.select().from(villages).where(eq(villages.id, req.params.id)).limit(1);
    if (!existing) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });

    let nextExpiry = existing.licenseExpiresAt ? new Date(existing.licenseExpiresAt) : null;
    if (req.body?.extendMonths && Number(req.body.extendMonths) > 0) {
      const base = nextExpiry && nextExpiry > new Date() ? nextExpiry : new Date();
      base.setMonth(base.getMonth() + Number(req.body.extendMonths));
      nextExpiry = base;
    }

    const nextStatus = req.body?.status || existing.status;
    const nextLicenseStatus = req.body?.licenseStatus || existing.licenseStatus;

    const [updated] = await db
      .update(villages)
      .set({
        status: nextStatus,
        isClaimed: req.body?.isClaimed !== undefined ? Boolean(req.body.isClaimed) : existing.isClaimed,
        licenseStatus: nextLicenseStatus,
        licensePlan: req.body?.licensePlan || existing.licensePlan,
        licenseExpiresAt: nextExpiry,
        updatedAt: new Date(),
      })
      .where(eq(villages.id, existing.id))
      .returning();

    return { success: true, data: updated };
  });

  // Hapus desa beserta datanya
  fastify.delete<{ Params: { id: string } }>('/villages/:id', async (req) => {
    await db.delete(villages).where(eq(villages.id, req.params.id));
    return { success: true };
  });

  // Daftar seluruh tagihan/invoice berlangganan desa
  fastify.get('/invoices', async () => {
    const [invoices, allVillages] = await Promise.all([
      db.select().from(subscriptionInvoices).orderBy(desc(subscriptionInvoices.createdAt)),
      db.select().from(villages),
    ]);
    const vMap = new Map(allVillages.map((v) => [v.id, v]));
    return {
      success: true,
      data: invoices.map((inv) => ({
        ...inv,
        villageName: vMap.get(inv.villageId)?.name || 'Desa Dihapus',
        villageSlug: vMap.get(inv.villageId)?.slug || '',
      })),
    };
  });

  // Konfirmasi pembayaran lunas -> otomatis aktifkan desa & tambah durasi langganan
  fastify.patch<{ Params: { id: string } }>('/invoices/:id/approve', async (req, reply) => {
    const [inv] = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, req.params.id))
      .limit(1);
    if (!inv) return reply.status(404).send({ success: false, error: 'Invoice tidak ditemukan.' });

    const [village] = await db.select().from(villages).where(eq(villages.id, inv.villageId)).limit(1);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa terkait tidak ditemukan.' });

    const now = new Date();
    const currentExp = village.licenseExpiresAt ? new Date(village.licenseExpiresAt) : null;
    const baseDate = currentExp && currentExp > now ? currentExp : now;
    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + Number(inv.durationMonths || 12));

    const [updatedInv] = await db
      .update(subscriptionInvoices)
      .set({
        status: 'PAID',
        paidAt: now,
      })
      .where(eq(subscriptionInvoices.id, inv.id))
      .returning();

    await db
      .update(villages)
      .set({
        status: 'ACTIVE',
        licenseStatus: 'ACTIVE',
        licensePlan: inv.planName,
        licenseExpiresAt: newExpiry,
        updatedAt: now,
      })
      .where(eq(villages.id, village.id));

    return { success: true, data: { invoice: updatedInv, licenseExpiresAt: newExpiry } };
  });

  fastify.patch<{ Params: { id: string } }>('/invoices/:id/cancel', async (req, reply) => {
    const [inv] = await db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.id, req.params.id))
      .limit(1);
    if (!inv) return reply.status(404).send({ success: false, error: 'Invoice tidak ditemukan.' });
    const [updated] = await db
      .update(subscriptionInvoices)
      .set({ status: 'CANCELLED' })
      .where(eq(subscriptionInvoices.id, inv.id))
      .returning();
    return { success: true, data: updated };
  });

  // Kelola Paket Langganan
  fastify.get('/plans', async () => {
    const rows = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
    return { success: true, data: rows };
  });

  fastify.patch<{
    Params: { id: string };
    Body: { name?: string; description?: string; priceMonthly?: number; priceYearly?: number; active?: boolean };
  }>('/plans/:id', async (req, reply) => {
    const [existing] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, req.params.id)).limit(1);
    if (!existing) return reply.status(404).send({ success: false, error: 'Paket tidak ditemukan.' });
    const [updated] = await db
      .update(subscriptionPlans)
      .set({
        name: req.body?.name?.trim() || existing.name,
        description: req.body?.description ?? existing.description,
        priceMonthly: req.body?.priceMonthly !== undefined ? Number(req.body.priceMonthly) : existing.priceMonthly,
        priceYearly: req.body?.priceYearly !== undefined ? Number(req.body.priceYearly) : existing.priceYearly,
        active: req.body?.active !== undefined ? Boolean(req.body.active) : existing.active,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionPlans.id, existing.id))
      .returning();
    return { success: true, data: updated };
  });

  // Pengaturan Rekening Pembayaran / QRIS / WA Konfirmasi
  fastify.get('/payment-config', async () => {
    const [rows, reneoPaymentMethods] = await Promise.all([
      db.select().from(platformSettings),
      getReneoPaymentMethods(),
    ]);
    const config: Record<string, any> = {};
    for (const r of rows) config[r.key] = r.value;
    config.reneoEcosystemEnabled = isReneoPaymentEcosystemEnabled();
    config.reneoPaymentMethods = reneoPaymentMethods;
    return { success: true, data: config };
  });

  fastify.patch<{ Body: Record<string, string> }>('/payment-config', async (req) => {
    const body = req.body || {};
    const allowed = ['bankName', 'bankAccountNumber', 'bankAccountHolder', 'qrisNote', 'whatsappSupport'];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        await db
          .insert(platformSettings)
          .values({ key, value: String(body[key]), updatedAt: new Date() })
          .onConflictDoUpdate({
            target: platformSettings.key,
            set: { value: String(body[key]), updatedAt: new Date() },
          });
      }
    }
    const rows = await db.select().from(platformSettings);
    const config: Record<string, string> = {};
    for (const r of rows) config[r.key] = r.value;
    return { success: true, data: config };
  });
}

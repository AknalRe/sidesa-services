import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db, getDefaultVillage } from '../db';
import {
  apbdesItems,
  bansosRecipients,
  complaints,
  letterRequests,
  newsArticles,
  officials,
  platformSettings,
  ppidDocuments,
  ppidRequests,
  residents,
  subscriptionPlans,
  umkmProducts,
  villageIndicators,
  villagePlaces,
  villages,
} from '../db/schema';
import {
  aggregateDemographics,
  generateTrackingCode,
  LETTER_TYPES,
  summarizeApbdes,
} from '../lib/helpers';
import { buildLetterStatusMessage, sendWahaNotification } from '../services/wahaNotify.service';
import { verifyStudentPddikti } from '../services/pddikti.service';
import {
  getWilayahDetail,
  listWilayahDistricts,
  listWilayahProvinces,
  listWilayahRegencies,
  listWilayahVillages,
  searchWilayah,
} from '../services/wilayah.service';

async function resolvePublicVillage(slug?: string) {
  if (slug) {
    const rows = await db
      .select()
      .from(villages)
      .where(and(eq(villages.slug, slug), eq(villages.status, 'ACTIVE')))
      .limit(1);
    return rows[0] || null;
  }
  return getDefaultVillage();
}

export default async function publicRouter(fastify: FastifyInstance) {
  // Resolve custom domain (.desa.id / custom host) ke portal desa terkait
  fastify.get<{ Querystring: { host?: string } }>('/resolve-host', async (req) => {
    const rawHost = String(
      req.query?.host || req.headers['x-forwarded-host'] || req.headers.host || ''
    )
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, '')
      .replace(/^www\./, '');

    if (!rawHost || rawHost === 'localhost' || rawHost === '127.0.0.1') {
      return { success: true, data: { matched: false } };
    }

    const [found] = await db
      .select({
        id: villages.id,
        slug: villages.slug,
        name: villages.name,
        customDomain: villages.customDomain,
      })
      .from(villages)
      .where(
        and(
          eq(villages.status, 'ACTIVE'),
          sql`LOWER(COALESCE(${villages.customDomain}, '')) = ${rawHost}`
        )
      )
      .limit(1);

    if (!found) {
      return { success: true, data: { matched: false } };
    }
    return {
      success: true,
      data: {
        matched: true,
        slug: found.slug,
        name: found.name,
        customDomain: found.customDomain,
      },
    };
  });

  // List ONLY published (status = ACTIVE) villages (either active subscription OR published unclaimed showcase by Superadmin)
  fastify.get('/villages', async () => {
    const list = await db
      .select({
        id: villages.id,
        name: villages.name,
        slug: villages.slug,
        kodeDesa: villages.kodeDesa,
        district: villages.district,
        regency: villages.regency,
        province: villages.province,
        headName: villages.headName,
        logoUrl: villages.logoUrl,
        heroImageUrl: villages.heroImageUrl,
        isClaimed: villages.isClaimed,
        licenseStatus: villages.licenseStatus,
        licensePlan: villages.licensePlan,
        licenseExpiresAt: villages.licenseExpiresAt,
      })
      .from(villages)
      .where(
        and(
          eq(villages.status, 'ACTIVE'),
          or(eq(villages.licenseStatus, 'ACTIVE'), eq(villages.isClaimed, false))
        )
      )
      .orderBy(villages.createdAt);
    return { success: true, data: list };
  });

  // List SaaS subscription plans + payment config for registration & landing page
  fastify.get('/plans', async () => {
    const [plans, settings] = await Promise.all([
      db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.active, true))
        .orderBy(subscriptionPlans.sortOrder),
      db.select().from(platformSettings),
    ]);
    const paymentConfig: Record<string, string> = {};
    for (const s of settings) paymentConfig[s.key] = s.value;
    return {
      success: true,
      data: {
        plans: plans.map((p) => ({
          ...p,
          features: (() => {
            try {
              return JSON.parse(p.featuresJson || '[]');
            } catch {
              return [];
            }
          })(),
        })),
        paymentConfig,
      },
    };
  });

  // Verifikasi status mahasiswa aktif PDDikti untuk Paket Mahasiswa KKN
  fastify.post<{
    Body: { nim: string; studentName: string; university: string; studyProgram?: string };
  }>('/verify-student', async (req) => {
    const result = await verifyStudentPddikti({
      nim: req.body?.nim || '',
      studentName: req.body?.studentName || '',
      university: req.body?.university || '',
      studyProgram: req.body?.studyProgram || '',
    });
    return { success: true, data: result };
  });

  // Mapping Wilayah & Geospasial Polygon Boundaries via wilayah.smartartstudio.my.id
  fastify.get<{ Querystring: { name?: string } }>('/wilayah/search', async (req) => {
    const rows = await searchWilayah(req.query.name || '');
    return { success: true, data: rows };
  });

  fastify.get<{ Params: { code: string } }>('/wilayah/detail/:code', async (req, reply) => {
    const detail = await getWilayahDetail(req.params.code);
    if (!detail) return reply.status(404).send({ success: false, error: 'Data wilayah tidak ditemukan.' });
    return { success: true, data: detail };
  });

  fastify.get('/wilayah/provinces', async () => {
    return { success: true, data: await listWilayahProvinces() };
  });

  fastify.get<{ Params: { code: string } }>('/wilayah/provinces/:code/regencies', async (req) => {
    return { success: true, data: await listWilayahRegencies(req.params.code) };
  });

  fastify.get<{ Params: { code: string } }>('/wilayah/regencies/:code/districts', async (req) => {
    return { success: true, data: await listWilayahDistricts(req.params.code) };
  });

  fastify.get<{ Params: { code: string } }>('/wilayah/districts/:code/villages', async (req) => {
    return { success: true, data: await listWilayahVillages(req.params.code) };
  });

  // Complete public village portal bootstrap (Beranda + Profil + SOTK + Ringkasan)
  fastify.get<{ Querystring: { village?: string } }>('/village', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) {
      return reply.status(404).send({ success: false, error: 'Data desa belum tersedia.' });
    }
    const [
      officialList,
      residentList,
      apbdesList,
      newsList,
      umkmList,
      placesList,
      indicatorList,
      bansosList,
    ] = await Promise.all([
      db.select().from(officials).where(and(eq(officials.villageId, village.id), eq(officials.active, true))).orderBy(officials.sortOrder),
      db.select().from(residents).where(eq(residents.villageId, village.id)),
      db.select().from(apbdesItems).where(eq(apbdesItems.villageId, village.id)),
      db.select().from(newsArticles).where(and(eq(newsArticles.villageId, village.id), eq(newsArticles.published, true))).orderBy(desc(newsArticles.publishedAt)).limit(6),
      db.select().from(umkmProducts).where(and(eq(umkmProducts.villageId, village.id), eq(umkmProducts.available, true))).orderBy(desc(umkmProducts.createdAt)).limit(8),
      db.select().from(villagePlaces).where(eq(villagePlaces.villageId, village.id)).orderBy(desc(villagePlaces.createdAt)),
      db.select().from(villageIndicators).where(eq(villageIndicators.villageId, village.id)).orderBy(desc(villageIndicators.year)).limit(1),
      db.select().from(bansosRecipients).where(eq(bansosRecipients.villageId, village.id)),
    ]);

    let boundaries = { north: '-', east: '-', south: '-', west: '-' };
    if (village.boundariesJson) {
      try {
        boundaries = { ...boundaries, ...JSON.parse(village.boundariesJson) };
      } catch {
        // ignore
      }
    }

    let officialStats: any = null;
    if (village.officialStatsJson) {
      try {
        officialStats = JSON.parse(village.officialStatsJson);
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      data: {
        village: { ...village, boundaries, officialStats },
        officials: officialList,
        demographics: aggregateDemographics(residentList),
        apbdes: summarizeApbdes(apbdesList),
        indicator: indicatorList[0]
          ? {
              ...indicatorList[0],
              dimensions: (() => {
                try {
                  return indicatorList[0].dimensionsJson ? JSON.parse(indicatorList[0].dimensionsJson) : [];
                } catch {
                  return [];
                }
              })(),
            }
          : null,
        bansosCount: bansosList.length,
        latestNews: newsList,
        umkm: umkmList,
        places: placesList,
        letterTypes: LETTER_TYPES,
      },
    };
  });

  // Infografis (Penduduk, APBDes by year, Bansos summary, IDM/SDGs/Stunting)
  fastify.get<{ Querystring: { village?: string; year?: string } }>('/infografis', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const yearParam = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const [residentList, apbdesList, bansosList, indicatorList] = await Promise.all([
      db.select().from(residents).where(eq(residents.villageId, village.id)),
      db.select().from(apbdesItems).where(eq(apbdesItems.villageId, village.id)),
      db.select().from(bansosRecipients).where(eq(bansosRecipients.villageId, village.id)),
      db.select().from(villageIndicators).where(eq(villageIndicators.villageId, village.id)).orderBy(desc(villageIndicators.year)),
    ]);

    const bansosByProgram = new Map<string, number>();
    for (const b of bansosList) {
      bansosByProgram.set(b.program, (bansosByProgram.get(b.program) || 0) + 1);
    }

    return {
      success: true,
      data: {
        demographics: aggregateDemographics(residentList),
        apbdes: summarizeApbdes(apbdesList, yearParam),
        bansos: {
          totalRecipients: bansosList.length,
          byProgram: Array.from(bansosByProgram.entries()).map(([program, total]) => ({ program, total })),
        },
        indicators: indicatorList.map((ind) => ({
          ...ind,
          dimensions: (() => {
            try {
              return ind.dimensionsJson ? JSON.parse(ind.dimensionsJson) : [];
            } catch {
              return [];
            }
          })(),
        })),
      },
    };
  });

  // Cek Penerima Bansos by NIK or Name (masks NIK for privacy)
  fastify.get<{ Querystring: { q?: string; village?: string } }>('/bansos/check', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const q = String(req.query.q || '').trim();
    if (q.length < 3) {
      return reply.status(400).send({ success: false, error: 'Masukkan minimal 3 karakter NIK atau nama lengkap.' });
    }
    const rows = await db
      .select()
      .from(bansosRecipients)
      .where(
        and(
          eq(bansosRecipients.villageId, village.id),
          or(ilike(bansosRecipients.nik, `%${q}%`), ilike(bansosRecipients.fullName, `%${q}%`))
        )
      )
      .limit(20);
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        maskedNik: r.nik.length > 8 ? `${r.nik.slice(0, 4)}********${r.nik.slice(-4)}` : '****',
        program: r.program,
        period: r.period,
        amount: r.amount,
        status: r.status,
        dusun: r.dusun,
      })),
    };
  });

  // Berita Desa (list & detail by slug)
  fastify.get<{ Querystring: { village?: string; category?: string } }>('/berita', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const list = await db
      .select()
      .from(newsArticles)
      .where(and(eq(newsArticles.villageId, village.id), eq(newsArticles.published, true)))
      .orderBy(desc(newsArticles.publishedAt));
    const cat = req.query.category?.trim();
    return {
      success: true,
      data: cat ? list.filter((a) => a.category.toLowerCase() === cat.toLowerCase()) : list,
    };
  });

  fastify.get<{ Params: { slug: string }; Querystring: { village?: string } }>('/berita/:slug', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const [article] = await db
      .select()
      .from(newsArticles)
      .where(and(eq(newsArticles.villageId, village.id), eq(newsArticles.slug, req.params.slug)))
      .limit(1);
    if (!article) return reply.status(404).send({ success: false, error: 'Berita tidak ditemukan.' });
    await db
      .update(newsArticles)
      .set({ views: sql`${newsArticles.views} + 1` })
      .where(eq(newsArticles.id, article.id))
      .catch(() => {});
    return { success: true, data: { ...article, views: article.views + 1 } };
  });

  // Beli Dari Desa (UMKM)
  fastify.get<{ Querystring: { village?: string } }>('/belanja', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const list = await db
      .select()
      .from(umkmProducts)
      .where(and(eq(umkmProducts.villageId, village.id), eq(umkmProducts.available, true)))
      .orderBy(desc(umkmProducts.createdAt));
    return { success: true, data: list };
  });

  // PPID Documents & Public Info Request
  fastify.get<{ Querystring: { village?: string; category?: string } }>('/ppid', async (req, reply) => {
    const village = await resolvePublicVillage(req.query.village);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const docs = await db
      .select()
      .from(ppidDocuments)
      .where(eq(ppidDocuments.villageId, village.id))
      .orderBy(desc(ppidDocuments.year), desc(ppidDocuments.publishedAt));
    const cat = req.query.category?.trim();
    return {
      success: true,
      data: cat ? docs.filter((d) => d.category === cat) : docs,
    };
  });

  fastify.post<{
    Body: {
      villageSlug?: string;
      requesterName: string;
      requesterNik: string;
      requesterPhone: string;
      requesterEmail?: string;
      informationNeeded: string;
      purpose: string;
    };
  }>('/ppid/request', async (req, reply) => {
    const village = await resolvePublicVillage(req.body?.villageSlug);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const { requesterName, requesterNik, requesterPhone, requesterEmail, informationNeeded, purpose } = req.body || {};
    if (!requesterName?.trim() || !requesterNik?.trim() || !requesterPhone?.trim() || !informationNeeded?.trim()) {
      return reply.status(400).send({ success: false, error: 'Nama, NIK, nomor WhatsApp, dan rincian informasi wajib diisi.' });
    }
    const ticketCode = generateTrackingCode('PPID');
    const [created] = await db
      .insert(ppidRequests)
      .values({
        id: crypto.randomUUID(),
        villageId: village.id,
        ticketCode,
        requesterName: requesterName.trim(),
        requesterNik: requesterNik.trim(),
        requesterPhone: requesterPhone.trim(),
        requesterEmail: requesterEmail?.trim() || null,
        informationNeeded: informationNeeded.trim(),
        purpose: purpose?.trim() || 'Keperluan informasi publik',
      })
      .returning();
    void sendWahaNotification(
      requesterPhone,
      `*${village.name} — PPID*\nPermohonan informasi publik Anda telah tercatat dengan nomor tiket *${ticketCode}*. Petugas PPID akan segera menindaklanjuti.`
    );
    return reply.status(201).send({ success: true, data: created });
  });

  // Pengaduan Warga Online + Tracking
  fastify.post<{
    Body: {
      villageSlug?: string;
      reporterName: string;
      reporterPhone: string;
      category?: string;
      location?: string;
      description: string;
    };
  }>('/pengaduan', async (req, reply) => {
    const village = await resolvePublicVillage(req.body?.villageSlug);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const { reporterName, reporterPhone, category, location, description } = req.body || {};
    if (!reporterName?.trim() || !reporterPhone?.trim() || !description?.trim()) {
      return reply.status(400).send({ success: false, error: 'Nama pelapor, nomor WhatsApp, dan uraian pengaduan wajib diisi.' });
    }
    const ticketCode = generateTrackingCode('ADU');
    const [created] = await db
      .insert(complaints)
      .values({
        id: crypto.randomUUID(),
        villageId: village.id,
        ticketCode,
        reporterName: reporterName.trim(),
        reporterPhone: reporterPhone.trim(),
        category: category?.trim() || 'Infrastruktur',
        location: location?.trim() || '',
        description: description.trim(),
      })
      .returning();
    void sendWahaNotification(
      reporterPhone,
      `*${village.name} — Pengaduan Warga*\nTerima kasih ${reporterName.trim()}. Pengaduan Anda telah diterima dengan kode tiket *${ticketCode}*.`
    );
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.get<{ Params: { code: string } }>('/pengaduan/track/:code', async (req, reply) => {
    const [found] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.ticketCode, req.params.code.trim().toUpperCase()))
      .limit(1);
    if (!found) return reply.status(404).send({ success: false, error: 'Tiket pengaduan tidak ditemukan.' });
    return { success: true, data: found };
  });

  // Layanan Surat Mandiri Warga + Tracking
  fastify.post<{
    Body: {
      villageSlug?: string;
      letterType: string;
      applicantNik: string;
      applicantName: string;
      applicantPhone: string;
      purpose: string;
      notes?: string;
    };
  }>('/surat/request', async (req, reply) => {
    const village = await resolvePublicVillage(req.body?.villageSlug);
    if (!village) return reply.status(404).send({ success: false, error: 'Desa tidak ditemukan.' });
    const { letterType, applicantNik, applicantName, applicantPhone, purpose, notes } = req.body || {};
    if (!letterType?.trim() || !applicantNik?.trim() || !applicantName?.trim() || !applicantPhone?.trim() || !purpose?.trim()) {
      return reply.status(400).send({ success: false, error: 'Jenis surat, NIK, nama pemohon, nomor WA, dan keperluan wajib diisi.' });
    }
    const trackingCode = generateTrackingCode('SRT');
    const [created] = await db
      .insert(letterRequests)
      .values({
        id: crypto.randomUUID(),
        villageId: village.id,
        trackingCode,
        letterType: letterType.trim(),
        applicantNik: applicantNik.trim(),
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        purpose: purpose.trim(),
        notes: notes?.trim() || null,
      })
      .returning();
    void sendWahaNotification(
      applicantPhone,
      buildLetterStatusMessage({
        villageName: village.name,
        applicantName: created.applicantName,
        letterType: created.letterType,
        trackingCode: created.trackingCode,
        status: created.status,
      })
    );
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.get<{ Params: { code: string } }>('/surat/track/:code', async (req, reply) => {
    const [found] = await db
      .select()
      .from(letterRequests)
      .where(eq(letterRequests.trackingCode, req.params.code.trim().toUpperCase()))
      .limit(1);
    if (!found) return reply.status(404).send({ success: false, error: 'Kode pengajuan surat tidak ditemukan.' });
    return { success: true, data: found };
  });
}

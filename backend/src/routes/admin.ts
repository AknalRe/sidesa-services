import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  apbdesItems,
  attendanceLogs,
  bansosRecipients,
  complaints,
  letterRequests,
  newsArticles,
  officials,
  pbbRecords,
  ppidDocuments,
  ppidRequests,
  residents,
  umkmProducts,
  villageIndicators,
  villagePlaces,
  villages,
} from '../db/schema';
import { requireAuth, SessionUser } from './auth';
import {
  aggregateDemographics,
  formatOfficialLetterNumber,
  slugifyTitle,
  summarizeApbdes,
} from '../lib/helpers';
import { buildLetterStatusMessage, sendWahaNotification } from '../services/wahaNotify.service';

function getVillageId(req: any): string {
  return (req.sidesaUser as SessionUser).villageId;
}

export default async function adminRouter(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  // Dashboard Overview
  fastify.get('/dashboard', async (req) => {
    const vid = getVillageId(req);
    const [
      residentList,
      letterList,
      complaintList,
      apbdesList,
      pbbList,
      bansosList,
      ppidReqList,
    ] = await Promise.all([
      db.select().from(residents).where(eq(residents.villageId, vid)),
      db.select().from(letterRequests).where(eq(letterRequests.villageId, vid)).orderBy(desc(letterRequests.createdAt)),
      db.select().from(complaints).where(eq(complaints.villageId, vid)).orderBy(desc(complaints.createdAt)),
      db.select().from(apbdesItems).where(eq(apbdesItems.villageId, vid)),
      db.select().from(pbbRecords).where(eq(pbbRecords.villageId, vid)),
      db.select().from(bansosRecipients).where(eq(bansosRecipients.villageId, vid)),
      db.select().from(ppidRequests).where(eq(ppidRequests.villageId, vid)),
    ]);

    const demo = aggregateDemographics(residentList);
    const apbdes = summarizeApbdes(apbdesList);
    const pbbPaid = pbbList.filter((p) => p.status === 'LUNAS').reduce((s, p) => s + p.taxAmount, 0);
    const pbbTotal = pbbList.reduce((s, p) => s + p.taxAmount, 0);

    return {
      success: true,
      data: {
        demographics: demo,
        apbdes,
        pendingLetters: letterList.filter((l) => l.status === 'DIAJUKAN' || l.status === 'DIPROSES').length,
        totalLetters: letterList.length,
        openComplaints: complaintList.filter((c) => c.status === 'BARU' || c.status === 'DITINDAKLANJUTI').length,
        pendingPpid: ppidReqList.filter((p) => p.status === 'DIAJUKAN' || p.status === 'DIPROSES').length,
        bansosTotal: bansosList.length,
        pbb: { paidAmount: pbbPaid, totalAmount: pbbTotal, count: pbbList.length },
        recentLetters: letterList.slice(0, 5),
        recentComplaints: complaintList.slice(0, 5),
      },
    };
  });

  // Village Profile
  fastify.get('/village', async (req) => {
    const vid = getVillageId(req);
    const [v] = await db.select().from(villages).where(eq(villages.id, vid)).limit(1);
    let boundaries = { north: '', east: '', south: '', west: '' };
    if (v?.boundariesJson) {
      try {
        boundaries = { ...boundaries, ...JSON.parse(v.boundariesJson) };
      } catch {
        // ignore
      }
    }
    return { success: true, data: v ? { ...v, boundaries } : null };
  });

  fastify.patch<{ Body: Record<string, any> }>('/village', async (req) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    const updates: Record<string, any> = { updatedAt: new Date() };
    const allowed = [
      'name', 'slug', 'kodeDesa', 'district', 'regency', 'province', 'postalCode',
      'headName', 'headTitle', 'headGreeting', 'vision', 'mission', 'history',
      'address', 'phone', 'email', 'website', 'areaKm2', 'mapLat', 'mapLng',
      'logoUrl', 'heroImageUrl',
    ];
    for (const k of allowed) {
      if (b[k] !== undefined) updates[k] = b[k];
    }
    if (typeof updates.slug === 'string') {
      updates.slug = slugifyTitle(updates.slug) || 'desa';
    }
    if (b.boundaries && typeof b.boundaries === 'object') {
      updates.boundariesJson = JSON.stringify(b.boundaries);
    }
    const [updated] = await db.update(villages).set(updates).where(eq(villages.id, vid)).returning();
    return { success: true, data: updated };
  });

  // Residents CRUD
  fastify.get('/residents', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(residents).where(eq(residents.villageId, vid)).orderBy(desc(residents.createdAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/residents', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.nik?.trim() || !b.kkNumber?.trim() || !b.fullName?.trim()) {
      return reply.status(400).send({ success: false, error: 'NIK, Nomor KK, dan Nama Lengkap wajib diisi.' });
    }
    const [created] = await db
      .insert(residents)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        nik: String(b.nik).trim(),
        kkNumber: String(b.kkNumber).trim(),
        fullName: String(b.fullName).trim(),
        gender: b.gender === 'P' ? 'P' : 'L',
        birthDate: b.birthDate || null,
        dusun: b.dusun?.trim() || 'Dusun Krajan',
        rt: b.rt?.trim() || '001',
        rw: b.rw?.trim() || '001',
        education: b.education?.trim() || 'SLTA/Sederajat',
        occupation: b.occupation?.trim() || 'Lainnya',
        religion: b.religion?.trim() || 'Islam',
        maritalStatus: b.maritalStatus?.trim() || 'Kawin',
        isVoter: b.isVoter !== false,
        status: b.status || 'AKTIF',
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/residents/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(residents).where(and(eq(residents.id, req.params.id), eq(residents.villageId, vid)));
    return { success: true };
  });

  // Letter Requests (Persuratan Permendagri 109/2019)
  fastify.get('/letters', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(letterRequests).where(eq(letterRequests.villageId, vid)).orderBy(desc(letterRequests.createdAt));
    return { success: true, data: rows };
  });

  fastify.patch<{ Params: { id: string }; Body: { status?: string; adminNotes?: string; letterNumber?: string } }>(
    '/letters/:id',
    async (req, reply) => {
      const vid = getVillageId(req);
      const user = (req as any).sidesaUser as SessionUser;
      const [existing] = await db
        .select()
        .from(letterRequests)
        .where(and(eq(letterRequests.id, req.params.id), eq(letterRequests.villageId, vid)))
        .limit(1);
      if (!existing) return reply.status(404).send({ success: false, error: 'Permohonan surat tidak ditemukan.' });

      const nextStatus = req.body?.status || existing.status;
      let nextNumber = req.body?.letterNumber?.trim() || existing.letterNumber;
      const [village] = await db.select().from(villages).where(eq(villages.id, vid)).limit(1);

      if ((nextStatus === 'DIPROSES' || nextStatus === 'SELESAI') && !nextNumber) {
        const [{ total }] = await db
          .select({ total: count() })
          .from(letterRequests)
          .where(eq(letterRequests.villageId, vid));
        nextNumber = formatOfficialLetterNumber(existing.letterType, total + 1, village?.kodeDesa);
      }

      const [updated] = await db
        .update(letterRequests)
        .set({
          status: nextStatus,
          letterNumber: nextNumber,
          adminNotes: req.body?.adminNotes !== undefined ? req.body.adminNotes : existing.adminNotes,
          processedBy: user.name,
          updatedAt: new Date(),
        })
        .where(eq(letterRequests.id, existing.id))
        .returning();

      if (nextStatus !== existing.status && existing.applicantPhone) {
        void sendWahaNotification(
          existing.applicantPhone,
          buildLetterStatusMessage({
            villageName: village?.name || 'Pemerintah Desa',
            applicantName: updated.applicantName,
            letterType: updated.letterType,
            trackingCode: updated.trackingCode,
            status: updated.status,
            letterNumber: updated.letterNumber,
            adminNotes: updated.adminNotes,
          })
        );
      }

      return { success: true, data: updated };
    }
  );

  // APBDes CRUD
  fastify.get('/apbdes', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(apbdesItems).where(eq(apbdesItems.villageId, vid)).orderBy(desc(apbdesItems.fiscalYear));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/apbdes', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.label?.trim() || !b.category) {
      return reply.status(400).send({ success: false, error: 'Kategori dan uraian pos anggaran wajib diisi.' });
    }
    const [created] = await db
      .insert(apbdesItems)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        fiscalYear: Number(b.fiscalYear) || new Date().getFullYear(),
        category: String(b.category),
        subCategory: String(b.subCategory || 'Umum').trim(),
        label: String(b.label).trim(),
        budgetAmount: Number(b.budgetAmount) || 0,
        realizedAmount: Number(b.realizedAmount) || 0,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/apbdes/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(apbdesItems).where(and(eq(apbdesItems.id, req.params.id), eq(apbdesItems.villageId, vid)));
    return { success: true };
  });

  // Bansos CRUD
  fastify.get('/bansos', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(bansosRecipients).where(eq(bansosRecipients.villageId, vid)).orderBy(desc(bansosRecipients.createdAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/bansos', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.nik?.trim() || !b.fullName?.trim() || !b.program?.trim()) {
      return reply.status(400).send({ success: false, error: 'NIK, nama penerima, dan program bansos wajib diisi.' });
    }
    const [created] = await db
      .insert(bansosRecipients)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        nik: String(b.nik).trim(),
        fullName: String(b.fullName).trim(),
        kkNumber: b.kkNumber?.trim() || null,
        program: String(b.program).trim(),
        period: String(b.period || `Tahun ${new Date().getFullYear()}`).trim(),
        amount: Number(b.amount) || 0,
        status: b.status || 'AKTIF',
        dusun: b.dusun?.trim() || 'Dusun Krajan',
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/bansos/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(bansosRecipients).where(and(eq(bansosRecipients.id, req.params.id), eq(bansosRecipients.villageId, vid)));
    return { success: true };
  });

  // PBB-P2 CRUD
  fastify.get('/pbb', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(pbbRecords).where(eq(pbbRecords.villageId, vid)).orderBy(desc(pbbRecords.createdAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/pbb', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.nop?.trim() || !b.taxpayerName?.trim()) {
      return reply.status(400).send({ success: false, error: 'NOP dan nama wajib pajak harus diisi.' });
    }
    const [created] = await db
      .insert(pbbRecords)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        nop: String(b.nop).trim(),
        taxpayerName: String(b.taxpayerName).trim(),
        dusun: b.dusun?.trim() || 'Dusun Krajan',
        fiscalYear: Number(b.fiscalYear) || new Date().getFullYear(),
        taxAmount: Number(b.taxAmount) || 0,
        status: b.status === 'LUNAS' ? 'LUNAS' : 'BELUM_BAYAR',
        paidAt: b.status === 'LUNAS' ? new Date() : null,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.patch<{ Params: { id: string }; Body: { status: string } }>('/pbb/:id', async (req) => {
    const vid = getVillageId(req);
    const isPaid = req.body?.status === 'LUNAS';
    const [updated] = await db
      .update(pbbRecords)
      .set({ status: isPaid ? 'LUNAS' : 'BELUM_BAYAR', paidAt: isPaid ? new Date() : null })
      .where(and(eq(pbbRecords.id, req.params.id), eq(pbbRecords.villageId, vid)))
      .returning();
    return { success: true, data: updated };
  });

  // Complaints & PPID
  fastify.get('/complaints', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(complaints).where(eq(complaints.villageId, vid)).orderBy(desc(complaints.createdAt));
    return { success: true, data: rows };
  });

  fastify.patch<{ Params: { id: string }; Body: { status: string; responseText?: string } }>(
    '/complaints/:id',
    async (req, reply) => {
      const vid = getVillageId(req);
      const [existing] = await db
        .select()
        .from(complaints)
        .where(and(eq(complaints.id, req.params.id), eq(complaints.villageId, vid)))
        .limit(1);
      if (!existing) return reply.status(404).send({ success: false, error: 'Pengaduan tidak ditemukan.' });
      const [updated] = await db
        .update(complaints)
        .set({
          status: req.body?.status || existing.status,
          responseText: req.body?.responseText ?? existing.responseText,
          updatedAt: new Date(),
        })
        .where(eq(complaints.id, existing.id))
        .returning();
      if (existing.reporterPhone) {
        const [village] = await db.select().from(villages).where(eq(villages.id, vid)).limit(1);
        void sendWahaNotification(
          existing.reporterPhone,
          `*${village?.name || 'Pemerintah Desa'} — Pengaduan*\nTiket *${updated.ticketCode}* kini berstatus *${updated.status}*.${
            updated.responseText ? `\nTanggapan: ${updated.responseText}` : ''
          }`
        );
      }
      return { success: true, data: updated };
    }
  );

  // News CRUD
  fastify.get('/news', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(newsArticles).where(eq(newsArticles.villageId, vid)).orderBy(desc(newsArticles.publishedAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/news', async (req, reply) => {
    const vid = getVillageId(req);
    const user = (req as any).sidesaUser as SessionUser;
    const b = req.body || {};
    if (!b.title?.trim() || !b.content?.trim()) {
      return reply.status(400).send({ success: false, error: 'Judul dan isi berita wajib diisi.' });
    }
    const [created] = await db
      .insert(newsArticles)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        slug: `${slugifyTitle(String(b.title))}-${Date.now().toString(36).slice(-4)}`,
        title: String(b.title).trim(),
        category: String(b.category || 'Kegiatan Desa').trim(),
        excerpt: String(b.excerpt || String(b.content).slice(0, 160)).trim(),
        content: String(b.content).trim(),
        coverUrl: b.coverUrl?.trim() || null,
        authorName: user.name,
        published: b.published !== false,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.patch<{ Params: { id: string }; Body: Record<string, any> }>('/news/:id', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    const [existing] = await db
      .select()
      .from(newsArticles)
      .where(and(eq(newsArticles.id, req.params.id), eq(newsArticles.villageId, vid)))
      .limit(1);
    if (!existing) return reply.status(404).send({ success: false, error: 'Berita tidak ditemukan.' });
    const nextTitle = b.title !== undefined ? String(b.title).trim() : existing.title;
    const nextContent = b.content !== undefined ? String(b.content).trim() : existing.content;
    const [updated] = await db
      .update(newsArticles)
      .set({
        title: nextTitle,
        category: b.category !== undefined ? String(b.category).trim() : existing.category,
        excerpt: b.excerpt !== undefined ? String(b.excerpt).trim() : nextContent.slice(0, 160),
        content: nextContent,
        coverUrl: b.coverUrl !== undefined ? (b.coverUrl?.trim() || null) : existing.coverUrl,
        published: b.published !== undefined ? Boolean(b.published) : existing.published,
      })
      .where(eq(newsArticles.id, existing.id))
      .returning();
    return { success: true, data: updated };
  });

  fastify.delete<{ Params: { id: string } }>('/news/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(newsArticles).where(and(eq(newsArticles.id, req.params.id), eq(newsArticles.villageId, vid)));
    return { success: true };
  });

  // UMKM CRUD
  fastify.get('/umkm', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(umkmProducts).where(eq(umkmProducts.villageId, vid)).orderBy(desc(umkmProducts.createdAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/umkm', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.name?.trim() || !b.sellerName?.trim() || !b.sellerPhone?.trim()) {
      return reply.status(400).send({ success: false, error: 'Nama produk, nama penjual, dan nomor WhatsApp wajib diisi.' });
    }
    const [created] = await db
      .insert(umkmProducts)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        name: String(b.name).trim(),
        category: String(b.category || 'Kuliner').trim(),
        price: Number(b.price) || 0,
        unit: String(b.unit || 'pcs').trim(),
        sellerName: String(b.sellerName).trim(),
        sellerPhone: String(b.sellerPhone).trim(),
        description: String(b.description || '').trim(),
        imageUrl: b.imageUrl?.trim() || null,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/umkm/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(umkmProducts).where(and(eq(umkmProducts.id, req.params.id), eq(umkmProducts.villageId, vid)));
    return { success: true };
  });

  // Officials (SOTK) CRUD
  fastify.get('/officials', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(officials).where(eq(officials.villageId, vid)).orderBy(officials.sortOrder);
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/officials', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.name?.trim() || !b.position?.trim()) {
      return reply.status(400).send({ success: false, error: 'Nama perangkat dan jabatan wajib diisi.' });
    }
    const [created] = await db
      .insert(officials)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        name: String(b.name).trim(),
        position: String(b.position).trim(),
        nip: b.nip?.trim() || null,
        phone: b.phone?.trim() || null,
        photoUrl: b.photoUrl?.trim() || null,
        sortOrder: Number(b.sortOrder) || 10,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/officials/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(officials).where(and(eq(officials.id, req.params.id), eq(officials.villageId, vid)));
    return { success: true };
  });

  // PPID Docs & Requests
  fastify.get('/ppid', async (req) => {
    const vid = getVillageId(req);
    const [docs, requests] = await Promise.all([
      db.select().from(ppidDocuments).where(eq(ppidDocuments.villageId, vid)).orderBy(desc(ppidDocuments.year)),
      db.select().from(ppidRequests).where(eq(ppidRequests.villageId, vid)).orderBy(desc(ppidRequests.createdAt)),
    ]);
    return { success: true, data: { documents: docs, requests } };
  });

  fastify.post<{ Body: Record<string, any> }>('/ppid/documents', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.title?.trim() || !b.category) {
      return reply.status(400).send({ success: false, error: 'Judul dan kategori dokumen PPID wajib diisi.' });
    }
    const [created] = await db
      .insert(ppidDocuments)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        category: String(b.category),
        title: String(b.title).trim(),
        documentNumber: b.documentNumber?.trim() || null,
        year: Number(b.year) || new Date().getFullYear(),
        summary: String(b.summary || '').trim(),
        fileUrl: b.fileUrl?.trim() || null,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/ppid/documents/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(ppidDocuments).where(and(eq(ppidDocuments.id, req.params.id), eq(ppidDocuments.villageId, vid)));
    return { success: true };
  });

  fastify.patch<{ Params: { id: string }; Body: { status: string; responseText?: string } }>(
    '/ppid/requests/:id',
    async (req, reply) => {
      const vid = getVillageId(req);
      const [existing] = await db
        .select()
        .from(ppidRequests)
        .where(and(eq(ppidRequests.id, req.params.id), eq(ppidRequests.villageId, vid)))
        .limit(1);
      if (!existing) return reply.status(404).send({ success: false, error: 'Permohonan PPID tidak ditemukan.' });
      const [updated] = await db
        .update(ppidRequests)
        .set({
          status: req.body?.status || existing.status,
          responseText: req.body?.responseText ?? existing.responseText,
        })
        .where(eq(ppidRequests.id, existing.id))
        .returning();
      return { success: true, data: updated };
    }
  );

  // Attendance & Guestbook
  fastify.get('/attendance', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(attendanceLogs).where(eq(attendanceLogs.villageId, vid)).orderBy(desc(attendanceLogs.checkInAt)).limit(100);
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/attendance', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.personName?.trim()) {
      return reply.status(400).send({ success: false, error: 'Nama wajib diisi.' });
    }
    const [created] = await db
      .insert(attendanceLogs)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        kind: b.kind === 'TAMU' ? 'TAMU' : 'APARATUR',
        personName: String(b.personName).trim(),
        nik: b.nik?.trim() || null,
        roleOrOrigin: String(b.roleOrOrigin || '').trim(),
        purpose: String(b.purpose || '').trim(),
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  // Places (POI / Potensi / Wisata / Galeri)
  fastify.get('/places', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(villagePlaces).where(eq(villagePlaces.villageId, vid)).orderBy(desc(villagePlaces.createdAt));
    return { success: true, data: rows };
  });

  fastify.post<{ Body: Record<string, any> }>('/places', async (req, reply) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    if (!b.title?.trim()) {
      return reply.status(400).send({ success: false, error: 'Judul lokasi/potensi/galeri wajib diisi.' });
    }
    const [created] = await db
      .insert(villagePlaces)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        kind: String(b.kind || 'POI'),
        title: String(b.title).trim(),
        category: String(b.category || 'Umum').trim(),
        description: String(b.description || '').trim(),
        address: String(b.address || '').trim(),
        lat: b.lat ? Number(b.lat) : null,
        lng: b.lng ? Number(b.lng) : null,
        imageUrl: b.imageUrl?.trim() || null,
      })
      .returning();
    return reply.status(201).send({ success: true, data: created });
  });

  fastify.delete<{ Params: { id: string } }>('/places/:id', async (req) => {
    const vid = getVillageId(req);
    await db.delete(villagePlaces).where(and(eq(villagePlaces.id, req.params.id), eq(villagePlaces.villageId, vid)));
    return { success: true };
  });

  // Indicators (IDM / SDGs / Stunting)
  fastify.get('/indicators', async (req) => {
    const vid = getVillageId(req);
    const rows = await db.select().from(villageIndicators).where(eq(villageIndicators.villageId, vid)).orderBy(desc(villageIndicators.year));
    return {
      success: true,
      data: rows.map((r) => ({
        ...r,
        dimensions: (() => {
          try {
            return r.dimensionsJson ? JSON.parse(r.dimensionsJson) : [];
          } catch {
            return [];
          }
        })(),
      })),
    };
  });

  fastify.post<{ Body: Record<string, any> }>('/indicators', async (req) => {
    const vid = getVillageId(req);
    const b = req.body || {};
    const year = Number(b.year) || new Date().getFullYear();
    const [existing] = await db
      .select()
      .from(villageIndicators)
      .where(and(eq(villageIndicators.villageId, vid), eq(villageIndicators.year, year)))
      .limit(1);

    const payload = {
      idmScore: Number(b.idmScore) || 0.75,
      idmStatus: String(b.idmStatus || 'MAJU').trim(),
      sdgsScore: Number(b.sdgsScore) || 75,
      stuntingCases: Number(b.stuntingCases) || 0,
      stuntingRate: Number(b.stuntingRate) || 0,
      dimensionsJson: Array.isArray(b.dimensions) ? JSON.stringify(b.dimensions) : existing?.dimensionsJson || '[]',
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(villageIndicators)
        .set(payload)
        .where(eq(villageIndicators.id, existing.id))
        .returning();
      return { success: true, data: updated };
    }

    const [created] = await db
      .insert(villageIndicators)
      .values({
        id: crypto.randomUUID(),
        villageId: vid,
        year,
        ...payload,
      })
      .returning();
    return { success: true, data: created };
  });
}

import crypto from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { count, eq } from 'drizzle-orm';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://sidesa_user:sidesa_password@localhost:5435/sidesa_db';

export const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
});

export const db = drizzle(queryClient, { schema });

export async function ensureDatabaseSchema(): Promise<void> {
  await queryClient.unsafe(`
    CREATE TABLE IF NOT EXISTS villages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      kode_desa TEXT,
      district TEXT NOT NULL DEFAULT '',
      regency TEXT NOT NULL DEFAULT '',
      province TEXT NOT NULL DEFAULT '',
      postal_code TEXT DEFAULT '',
      head_name TEXT DEFAULT '',
      head_title TEXT DEFAULT 'Kepala Desa',
      head_greeting TEXT DEFAULT '',
      vision TEXT DEFAULT '',
      mission TEXT DEFAULT '',
      history TEXT DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      website TEXT DEFAULT '',
      area_km2 DOUBLE PRECISION DEFAULT 0,
      boundaries_json TEXT,
      map_lat DOUBLE PRECISION DEFAULT -7.2575,
      map_lng DOUBLE PRECISION DEFAULT 112.0125,
      logo_url TEXT,
      hero_image_url TEXT,
      official_stats_json TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      is_claimed BOOLEAN NOT NULL DEFAULT TRUE,
      license_status TEXT NOT NULL DEFAULT 'ACTIVE',
      license_plan TEXT NOT NULL DEFAULT 'SIDesa Standar',
      license_expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS village_users (
      id TEXT PRIMARY KEY,
      village_id TEXT REFERENCES villages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      phone TEXT,
      position TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE village_users ALTER COLUMN village_id DROP NOT NULL;
    ALTER TABLE villages ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE villages ADD COLUMN IF NOT EXISTS official_stats_json TEXT;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS student_identity_json TEXT;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS unique_code INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS amount_total INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS reneo_order_public_id TEXT;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS reneo_invoice_number TEXT;
    ALTER TABLE subscription_invoices ADD COLUMN IF NOT EXISTS reneo_payment_methods_json TEXT;

    CREATE TABLE IF NOT EXISTS officials (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      nip TEXT,
      phone TEXT,
      photo_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      nik TEXT NOT NULL,
      kk_number TEXT NOT NULL,
      full_name TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'L',
      birth_date TEXT,
      dusun TEXT NOT NULL DEFAULT 'Dusun Krajan',
      rt TEXT NOT NULL DEFAULT '001',
      rw TEXT NOT NULL DEFAULT '001',
      education TEXT DEFAULT 'SLTA/Sederajat',
      occupation TEXT DEFAULT 'Petani/Pekebun',
      religion TEXT DEFAULT 'Islam',
      marital_status TEXT DEFAULT 'Kawin',
      is_voter BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'AKTIF',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS letter_requests (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      tracking_code TEXT NOT NULL UNIQUE,
      letter_type TEXT NOT NULL,
      letter_number TEXT,
      applicant_nik TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      purpose TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'DIAJUKAN',
      admin_notes TEXT,
      processed_by TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS apbdes_items (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      fiscal_year INTEGER NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      label TEXT NOT NULL,
      budget_amount BIGINT NOT NULL DEFAULT 0,
      realized_amount BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bansos_recipients (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      nik TEXT NOT NULL,
      full_name TEXT NOT NULL,
      kk_number TEXT,
      program TEXT NOT NULL,
      period TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'AKTIF',
      dusun TEXT DEFAULT 'Dusun Krajan',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS village_indicators (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      idm_score DOUBLE PRECISION NOT NULL DEFAULT 0.785,
      idm_status TEXT NOT NULL DEFAULT 'Maju',
      sdgs_score DOUBLE PRECISION NOT NULL DEFAULT 64.5,
      stunting_cases INTEGER NOT NULL DEFAULT 0,
      stunting_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
      dimensions_json TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Kegiatan Desa',
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      cover_url TEXT,
      author_name TEXT NOT NULL DEFAULT 'Admin Desa',
      published BOOLEAN NOT NULL DEFAULT TRUE,
      views INTEGER NOT NULL DEFAULT 0,
      published_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS umkm_products (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Kuliner',
      price INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'pcs',
      seller_name TEXT NOT NULL,
      seller_phone TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT,
      available BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ppid_documents (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      document_number TEXT,
      year INTEGER NOT NULL,
      summary TEXT DEFAULT '',
      file_url TEXT,
      published_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ppid_requests (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      ticket_code TEXT NOT NULL UNIQUE,
      requester_name TEXT NOT NULL,
      requester_nik TEXT NOT NULL,
      requester_phone TEXT NOT NULL,
      requester_email TEXT,
      information_needed TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DIAJUKAN',
      response_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      ticket_code TEXT NOT NULL UNIQUE,
      reporter_name TEXT NOT NULL,
      reporter_phone TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Infrastruktur',
      location TEXT DEFAULT '',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'BARU',
      response_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS village_places (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'POI',
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Fasilitas Umum',
      description TEXT DEFAULT '',
      address TEXT DEFAULT '',
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pbb_records (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      nop TEXT NOT NULL,
      taxpayer_name TEXT NOT NULL,
      dusun TEXT DEFAULT 'Dusun Krajan',
      fiscal_year INTEGER NOT NULL,
      tax_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'BELUM_BAYAR',
      paid_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'APARATUR',
      person_name TEXT NOT NULL,
      nik TEXT,
      role_or_origin TEXT DEFAULT '',
      purpose TEXT DEFAULT '',
      check_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
      check_out_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price_monthly INTEGER NOT NULL DEFAULT 150000,
      price_yearly INTEGER NOT NULL DEFAULT 1500000,
      features_json TEXT DEFAULT '[]',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscription_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      plan_code TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      duration_months INTEGER NOT NULL DEFAULT 12,
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'UNPAID',
      payment_method TEXT NOT NULL DEFAULT 'TRANSFER_BANK',
      payment_reference TEXT,
      payment_note TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Hapus data seed demo Sugihwaras yang tidak terdaftar secara resmi
  await queryClient.unsafe(`
    DELETE FROM villages
    WHERE id = 'default-village'
      AND slug = 'sugihwaras'
      AND NOT EXISTS (SELECT 1 FROM village_users WHERE village_id = 'default-village');
  `);

  // Pastikan logo & geolokasi resmi Desa Pohjejer (Kepmendagri 35.16.02.2010 dari wilayah.smartartstudio.my.id) terupdate
  await queryClient.unsafe(`
    UPDATE villages
    SET logo_url = '/assets/sidesa/pohjejer-logo.png'
    WHERE slug = 'pohjejer' AND logo_url = '/assets/sidesa/pohjejer-logo.jpg';

    UPDATE villages
    SET kode_desa = '35.16.02.2010',
        map_lat = -7.610556,
        map_lng = 112.472453,
        postal_code = '61372'
    WHERE slug = 'pohjejer' AND (kode_desa IS NULL OR kode_desa = '');
  `);

  // Perbarui tangga harga default lama ke skala baru (mulai KKN Rp 250rb/bln) tanpa menimpa harga kustom Superadmin
  await queryClient.unsafe(`
    UPDATE subscription_plans SET price_monthly = 250000, price_yearly = 2500000 WHERE code = 'KKN' AND price_monthly = 49000;
    UPDATE subscription_plans SET price_monthly = 450000, price_yearly = 4500000 WHERE code = 'STARTER' AND price_monthly = 150000;
    UPDATE subscription_plans SET price_monthly = 750000, price_yearly = 7500000 WHERE code = 'PRO' AND price_monthly = 250000;
    UPDATE subscription_plans SET price_monthly = 1250000, price_yearly = 12500000 WHERE code = 'ENTERPRISE' AND price_monthly = 450000;
  `);

  await seedDefaultPlansAndSettings();
  await seedDesaPohjejerIfMissing();
  await seedDesaDlangguIfMissing();
}

async function seedDefaultPlansAndSettings(): Promise<void> {
  // Pastikan Paket Mahasiswa KKN selalu ada (termasuk pada database yang sudah terlanjur di-seed sebelumnya)
  await db
    .insert(schema.subscriptionPlans)
    .values({
      id: 'plan-kkn',
      code: 'KKN',
      name: 'Paket Mahasiswa KKN',
      description:
        'Harga khusus program Kuliah Kerja Nyata (KKN) mahasiswa aktif. Wajib melampirkan NIM, Perguruan Tinggi, dan verifikasi PDDikti.',
      priceMonthly: 250000,
      priceYearly: 2500000,
      featuresJson: JSON.stringify([
        'Khusus Mahasiswa Aktif KKN (Wajib NIM & Cek PDDikti)',
        'Website Resmi Profil Desa (/desa/nama-desa)',
        'CMS Profil, Berita KKN, Potensi Desa & Galeri',
        'Infografis Penduduk, APBDes & Direktori UMKM',
        'Dapat dialihkan/diperpanjang ke Perangkat Desa setelah KKN',
      ]),
      active: true,
      sortOrder: 0,
    })
    .onConflictDoNothing({ target: schema.subscriptionPlans.code });

  const [{ total }] = await db.select({ total: count() }).from(schema.subscriptionPlans);
  if (total <= 1) {
    await db
      .insert(schema.subscriptionPlans)
      .values([
        {
          id: 'plan-starter',
          code: 'STARTER',
          name: 'Paket Desa Mandiri',
          description: 'Cocok untuk desa yang baru memulai digitalisasi website profil desa & pelayanan surat.',
          priceMonthly: 450000,
          priceYearly: 4500000,
          featuresJson: JSON.stringify([
            'Website Resmi Profil Desa (/desa/nama-desa)',
            'CMS Berita, Pengumuman & Galeri Desa',
            'Database Penduduk & Statistik Demografi',
            'Pelayanan Pengajuan Surat Mandiri Warga',
            'Transparansi Infografis APBDes & SOTK',
          ]),
          active: true,
          sortOrder: 1,
        },
        {
          id: 'plan-pro',
          code: 'PRO',
          name: 'Paket Desa Digital Pro',
          description: 'Paket lengkap dengan PPID, Cek Bansos, PBB-P2, Lapak UMKM, WebGIS, dan Notifikasi WhatsApp.',
          priceMonthly: 750000,
          priceYearly: 7500000,
          featuresJson: JSON.stringify([
            'Semua fitur Paket Desa Mandiri',
            'Notifikasi WhatsApp Otomatis Status Surat & Pengaduan',
            'Portal PPID (UU KIP) & Pengaduan Warga Online',
            'Katalog Beli Dari Desa (UMKM) & Peta WebGIS',
            'Modul PBB-P2, Cek Bansos, IDM, SDGs & Stunting',
          ]),
          active: true,
          sortOrder: 2,
        },
        {
          id: 'plan-enterprise',
          code: 'ENTERPRISE',
          name: 'Paket Desa Prioritas / Custom Domain',
          description: 'Dukungan penuh domain .desa.id, pendampingan migrasi data kependudukan, dan SLA prioritas.',
          priceMonthly: 1250000,
          priceYearly: 12500000,
          featuresJson: JSON.stringify([
            'Semua fitur Paket Desa Digital Pro',
            'Integrasi Custom Domain (.desa.id)',
            'Pendampingan Migrasi Data Kependudukan & APBDes',
            'Backup Harian Terjadwal & SLA Prioritas',
            'Multi-Operator Perangkat Desa (Kades, Sekdes, Kaur)',
          ]),
          active: true,
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing({ target: schema.subscriptionPlans.code });
  }

  const defaultSettings: Array<[string, string]> = [
    ['bankName', 'Bank BRI / Mandiri (Reneo SIDesa)'],
    ['bankAccountNumber', '1234-01-000888-30-9'],
    ['bankAccountHolder', 'PT Reneo Teknologi Nusantara'],
    ['qrisNote', 'Tersedia pembayaran QRIS / Virtual Account atas nama Reneo SIDesa. Hubungi admin untuk QRIS dinamis.'],
    ['whatsappSupport', '6281234567890'],
  ];

  for (const [key, value] of defaultSettings) {
    await db
      .insert(schema.platformSettings)
      .values({ key, value })
      .onConflictDoNothing({ target: schema.platformSettings.key });
  }
}

export function calculateSubscriptionAmount(
  plan: { priceMonthly: number; priceYearly: number },
  durationMonths: number
): number {
  const m = Number(durationMonths) || 12;
  if (m === 12) return plan.priceYearly;
  if (m === 24) return Math.round(plan.priceYearly * 2 * 0.9); // Diskon tambahan 10% untuk 2 tahun
  if (m === 6) return Math.round(plan.priceMonthly * 6 * 0.95); // Diskon 5% untuk 6 bulan
  return plan.priceMonthly * m;
}

export async function seedDesaPohjejerIfMissing(): Promise<void> {
  const existing = await db
    .select()
    .from(schema.villages)
    .where(eq(schema.villages.slug, 'pohjejer'))
    .limit(1);
  if (existing.length > 0) return;

  const vid = 'village-pohjejer';
  await db.insert(schema.villages).values({
    id: vid,
    name: 'Desa Pohjejer',
    slug: 'pohjejer',
    kodeDesa: '35.16.02.2010',
    district: 'Gondang',
    regency: 'Mojokerto',
    province: 'Jawa Timur',
    postalCode: '61372',
    headName: 'Belum dikonfirmasi oleh Pemerintah Desa',
    headTitle: 'Kepala Desa',
    headGreeting:
      'Selamat datang di portal informasi Desa Pohjejer, Kecamatan Gondang, Kabupaten Mojokerto, Jawa Timur. Data profil, kependudukan, dan potensi wilayah pada halaman ini merujuk pada Profil Kecamatan Gondang 2024 (data administrasi 2023) dan sedang dalam tahap penyempurnaan bersama Pemerintah Desa Pohjejer.',
    vision: 'Dokumen visi resmi sedang dalam tahap konfirmasi Pemerintah Desa Pohjejer.',
    mission:
      '1. Penyajian informasi wilayah administratif (6 Dusun, 6 RW, 17 RT) dan kependudukan bersumber resmi.\n2. Penguatan potensi perdagangan, Pasar Desa, Pujasera, jasa, dan pertanian melalui BUMDes Pohjejer.\n3. Keterbukaan informasi publik dan pelayanan administrasi warga secara bertahap.',
    history:
      'Desa Pohjejer terletak di Kecamatan Gondang, Kabupaten Mojokerto, Provinsi Jawa Timur. Berdasarkan Profil Kecamatan Gondang 2024 (data 2023), wilayah administratif Desa Pohjejer terdiri dari 6 dusun, 6 RW, dan 17 RT dengan jumlah penduduk 4.050 jiwa (8,96% dari total penduduk Kecamatan Gondang). Naskah sejarah resmi desa menunggu verifikasi langsung dari Pemerintah Desa Pohjejer.',
    address: 'Jl. Raya Pohjejer No.56, Pohjejer, Gondang, Mojokerto, Jawa Timur 61372',
    phone: '',
    email: '',
    website: '',
    areaKm2: 0,
    boundariesJson: JSON.stringify({
      north: 'Perlu konfirmasi peta desa',
      east: 'Perlu konfirmasi peta desa',
      south: 'Perlu konfirmasi peta desa',
      west: 'Perlu konfirmasi peta desa',
    }),
    mapLat: -7.610556,
    mapLng: 112.472453,
    logoUrl: '/assets/sidesa/pohjejer-logo.png',
    heroImageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    officialStatsJson: JSON.stringify({
      source: 'Profil Kecamatan Gondang 2024 (Data Administrasi & Penduduk 2023)',
      totalResidents: 4050,
      dusunCount: 6,
      rwCount: 6,
      rtCount: 17,
      districtSharePct: 8.96,
      densityPerKm2: 2596.15,
      sexRatio: 97,
      religionBreakdown: [
        { label: 'Islam', total: 3898 },
        { label: 'Kristen Protestan', total: 56 },
        { label: 'Katolik', total: 14 },
        { label: 'Hindu', total: 0 },
        { label: 'Buddha', total: 0 },
        { label: 'Konghucu', total: 0 },
      ],
      religionTotalNote:
        'Total rincian agama tercatat 3.968 jiwa (selisih 82 jiwa dari jumlah penduduk 4.050 jiwa pada tabel sumber 2023; menunggu klarifikasi sumber resmi).',
    }),
    status: 'ACTIVE',
    isClaimed: false,
    licenseStatus: 'UNCLAIMED',
    licensePlan: 'Belum Diklaim',
    licenseExpiresAt: null,
  });

  // Fasilitas publik & potensi wilayah berdasarkan Master Data Desa Pohjejer (dengan label status sumber yang jujur)
  await db.insert(schema.villagePlaces).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Balai Desa Pohjejer',
      category: 'Pemerintahan',
      description: 'Kantor pelayanan pemerintahan dan administrasi Desa Pohjejer (alamat perlu konfirmasi kantor desa).',
      address: 'Jl. Raya Pohjejer No.56, Pohjejer, Gondang, Mojokerto 61372',
      lat: -7.6194,
      lng: 112.4822,
      imageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Pasar Desa Pohjejer',
      category: 'Perdagangan & BUMDes',
      description:
        'Pusat perdagangan desa dengan estimasi area ±5.023 m² dan ±230 unit kios pasar (data sementara pemetaan potensi; menunggu validasi terkini).',
      address: 'Pohjejer, Gondang, Mojokerto 61372',
      imageUrl: '/assets/sidesa/pohjejer-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Pujasera Pohjejer',
      category: 'Kuliner & UMKM',
      description:
        'Area pujasera ±2.800 m² dengan sekitar 40 stan kuliner & UMKM (data historis pemberitaan 2023; perlu cek kondisi terkini).',
      address: 'Pohjejer, Gondang, Mojokerto',
      imageUrl: '/assets/sidesa/pohjejer-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Subterminal Pohjejer',
      category: 'Transportasi & Jasa',
      description:
        'Kawasan subterminal desa ±2.500 m² dan ±218 kios terminal (data sementara pemetaan potensi; perlu validasi).',
      address: 'Pohjejer, Gondang, Mojokerto',
      imageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'SDN Pohjejer',
      category: 'Pendidikan',
      description: 'Sekolah Dasar Negeri Pohjejer (sumber: Dinas Pendidikan Kabupaten Mojokerto; cocokkan dengan data terbaru).',
      address: 'Jl. Komando Hayamwuruk No.25, Pohjejer, Gondang',
      imageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Lahan Pertanian & Sungai Pikatan',
      category: 'Pertanian & Sumber Daya',
      description:
        'Lahan pertanian ±53 ha dengan komoditas utama padi, jagung, dan tebu serta aliran Sungai Pikatan ±1,5 km (data sementara; perlu validasi).',
      address: 'Wilayah Pertanian Desa Pohjejer, Gondang',
      imageUrl: '/assets/sidesa/pohjejer-pertanian.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Polindes & 6 Unit Posyandu',
      category: 'Kesehatan',
      description:
        'Tercatat 1 unit Polindes dan 6 unit Posyandu pada dokumen pemetaan potensi (perlu validasi status, nama, dan alamat resmi).',
      address: 'Desa Pohjejer, Gondang, Mojokerto',
      imageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Suasana Balai Desa & Jalan Utama Desa Pohjejer',
      category: 'Profil Wilayah',
      description: 'Dokumentasi visual kawasan Desa Pohjejer, Kecamatan Gondang, Kabupaten Mojokerto.',
      imageUrl: '/assets/sidesa/pohjejer-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Sentra Pasar Desa & Pujasera Pohjejer',
      category: 'Ekonomi Desa',
      description: 'Ilustrasi kawasan perdagangan pasar desa dan pujasera Pohjejer.',
      imageUrl: '/assets/sidesa/pohjejer-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Lahan Pertanian Padi, Jagung, Tebu & Sungai Pikatan',
      category: 'Potensi Pertanian',
      description: 'Kawasan pertanian produktif dan aliran Sungai Pikatan di Desa Pohjejer.',
      imageUrl: '/assets/sidesa/pohjejer-pertanian.jpg',
    },
  ]);

  // Artikel bersumber jelas (tidak mengarang data 2026)
  await db.insert(schema.newsArticles).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'profil-wilayah-dan-kependudukan-desa-pohjejer-data-2023',
      title: 'Profil Wilayah & Kependudukan Desa Pohjejer (Sumber: Profil Kecamatan Gondang 2024)',
      category: 'Data Wilayah',
      excerpt:
        'Berdasarkan Profil Kecamatan Gondang 2024 (data 2023), Desa Pohjejer terdiri dari 6 dusun, 6 RW, dan 17 RT dengan jumlah penduduk 4.050 jiwa.',
      content:
        'Berdasarkan dokumen Profil Kecamatan Gondang 2024 yang merujuk pada data administrasi dan kependudukan tahun 2023, Desa Pohjejer di Kecamatan Gondang, Kabupaten Mojokerto, Provinsi Jawa Timur memiliki wilayah administratif yang terdiri atas 6 dusun, 6 RW, dan 17 RT.\n\nJumlah penduduk tercatat sebanyak 4.050 jiwa atau sekitar 8,96% dari total penduduk Kecamatan Gondang, dengan kepadatan penduduk 2.596,15 jiwa/km² dan rasio jenis kelamin (sex ratio) sebesar 97.\n\nRincian penduduk menurut agama pada data 2023 mencatat 3.898 jiwa beragama Islam, 56 jiwa Kristen Protestan, dan 14 jiwa Katolik (total rincian 3.968 jiwa; selisih 82 jiwa dari angka total penduduk 4.050 jiwa menunggu klarifikasi resmi Pemerintah Desa / Dukcapil).',
      coverUrl: '/assets/sidesa/pohjejer-hero.jpg',
      authorName: 'Tim Persiapan Data Desa Pohjejer',
      views: 1,
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'arah-pengembangan-bumdes-pasar-dan-pujasera-desa-pohjejer',
      title: 'Penguatan BUMDes serta Potensi Perdagangan, Pujasera, dan Pertanian Desa Pohjejer',
      category: 'Potensi & BUMDes',
      excerpt:
        'Publikasi akademik (Jurnal Abdikarya 2025) dan pemberitaan daerah mencatat potensi strategis Desa Pohjejer pada sektor pasar desa, pujasera, jasa, dan pertanian.',
      content:
        'Desa Pohjejer memiliki posisi strategis di Kecamatan Gondang, Kabupaten Mojokerto dengan keberadaan fasilitas Pasar Desa, Subterminal, Pujasera, serta hamparan lahan pertanian komoditas padi, jagung, dan tebu yang dialiri Sungai Pikatan.\n\nPublikasi akademik Jurnal Abdikarya (2025) mengenai penguatan BUMDes Pohjejer menyoroti pengembangan sektor wisata, perdagangan, jasa, dan pertanian. Catatan penting: angka target PADes maupun rincian luas pasar/kios dari dokumen pemetaan potensi berstatus data referensi/sementara dan bukan laporan realisasi APBDes tahun 2026 sebelum diverifikasi langsung oleh Pemerintah Desa Pohjejer.',
      coverUrl: '/assets/sidesa/pohjejer-pasar.jpg',
      authorName: 'Tim Persiapan Data Desa Pohjejer',
      views: 1,
    },
  ]);

  console.log('[SIDesa DB] Seeded Desa Pohjejer (Kec. Gondang, Kab. Mojokerto) — status UNCLAIMED & PUBLIC');
}

export async function seedDesaDlangguIfMissing(): Promise<void> {
  const existing = await db
    .select()
    .from(schema.villages)
    .where(eq(schema.villages.slug, 'dlanggu'))
    .limit(1);
  if (existing.length > 0) return;

  const vid = 'village-dlanggu';
  await db.insert(schema.villages).values({
    id: vid,
    name: 'Desa Dlanggu',
    slug: 'dlanggu',
    kodeDesa: '35.16.09.2012',
    district: 'Dlanggu',
    regency: 'Mojokerto',
    province: 'Jawa Timur',
    postalCode: '61371',
    headName: 'Muhammad Nur Huda',
    headTitle: 'Kepala Desa',
    headGreeting:
      'Selamat datang di portal informasi Desa Dlanggu, Kecamatan Dlanggu, Kabupaten Mojokerto, Jawa Timur. Sebagai pusat pemerintahan dan perekonomian Kecamatan Dlanggu dengan status Desa Mandiri, portal ini menyajikan informasi 4 dusun (Dlanggu, Kademangan, Sroyo, dan Segaran), layanan warga, serta potensi perdagangan dan UMKM desa.',
    vision:
      'Mewujudkan Desa Dlanggu yang Mandiri, Maju, Transparan, dan Sejahtera sebagai Pusat Perekonomian serta Pelayanan Publik di Kecamatan Dlanggu.',
    mission:
      '1. Meningkatkan tata kelola pemerintahan desa yang tertib, terbuka, dan melayani di 4 dusun (Dlanggu, Kademangan, Sroyo, Segaran).\n2. Mengembangkan ekonomi kreatif desa, UMKM lokal, Coffee Taman BUMDes, dan optimalisasi aktivitas perdagangan Pasar Dlanggu.\n3. Menjaga produktivitas lahan pertanian (±93,18 ha) serta memperkuat fasilitas publik dan kepemudaan desa.',
    history:
      'Desa Dlanggu merupakan pusat pemerintahan sekaligus simpul perekonomian utama di Kecamatan Dlanggu, Kabupaten Mojokerto, Provinsi Jawa Timur (Kode Pos 61371). Secara historis, kawasan Dlanggu telah lama menjadi pusat administrasi kawedanan/kecamatan yang ditandai keberadaan Tugu Perjuangan Pahlawan di kawasan pertigaan Pasar Dlanggu.\n\nLuas wilayah Desa Dlanggu tercatat sekitar 172,77 hektare (1,73 km²) yang meliputi lahan pertanian (±93,18 ha), pekarangan (±68,50 ha), tanah kas desa (±10,40 ha), dan penggunaan lainnya (±0,69 ha), serta terbagi atas 4 dusun: Dusun Dlanggu, Dusun Kademangan, Dusun Sroyo, dan Dusun Segaran. Kepemimpinan desa tercatat berkesinambungan dari masa ke masa hingga kepemimpinan Kepala Desa Muhammad Nur Huda dengan capaian status Desa Mandiri di Kabupaten Mojokerto.',
    address: 'Jl. Jendral Ahmad Yani No. 9, Desa Dlanggu, Kecamatan Dlanggu, Kabupaten Mojokerto, Jawa Timur 61371',
    phone: '(0321) 510176',
    email: 'pemdes@dlanggu.desa.id',
    website: '',
    areaKm2: 1.73,
    boundariesJson: JSON.stringify({
      north: 'Desa Pohkecik',
      east: 'Desa Ngembeh',
      south: 'Desa Mojokarang',
      west: 'Desa Jrambe',
    }),
    mapLat: -7.56645,
    mapLng: 112.483986,
    logoUrl: '/assets/sidesa/dlanggu-logo.png',
    heroImageUrl: '/assets/sidesa/dlanggu-hero.jpg',
    officialStatsJson: JSON.stringify({
      source: 'Profil Administrasi Desa Dlanggu & Data Wilayah Kecamatan Dlanggu (Kab. Mojokerto)',
      year: '2023/2024',
      totalResidents: 3873,
      populationTotal: 3873,
      populationMale: 1915,
      populationFemale: 1958,
      households: 1948,
      dusunCount: 4,
      dusunNames: ['Dusun Dlanggu', 'Dusun Kademangan', 'Dusun Sroyo', 'Dusun Segaran'],
      sexRatio: 97.8,
      densityPerKm2: 2239,
      landUseNote:
        'Luas wilayah ±172,77 ha (1,73 km²): Lahan Pertanian ±93,18 ha, Pekarangan ±68,50 ha, Tanah Kas Desa ±10,40 ha, Lain-lain ±0,69 ha.',
    }),
    status: 'ACTIVE',
    isClaimed: false,
    licenseStatus: 'UNCLAIMED',
    licensePlan: 'Belum Diklaim',
    licenseExpiresAt: null,
  });

  await db.insert(schema.villageIndicators).values({
    id: crypto.randomUUID(),
    villageId: vid,
    year: 2024,
    idmStatus: 'MANDIRI',
    idmScore: 0.85,
    sdgsScore: 0,
    stuntingCases: 0,
    stuntingRate: 0,
    dimensionsJson: JSON.stringify([
      { name: 'Status Desa (Pemkab Mojokerto)', score: 'DESA MANDIRI' },
      { name: 'Pembagian Wilayah', score: '4 Dusun (Dlanggu, Kademangan, Sroyo, Segaran)' },
    ]),
  });

  await db.insert(schema.villagePlaces).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Balai Desa Dlanggu',
      category: 'Pemerintahan',
      description:
        'Kantor pelayanan pemerintahan dan administrasi Desa Dlanggu di pusat Kecamatan Dlanggu, Kabupaten Mojokerto.',
      address: 'Jl. Jendral Ahmad Yani No. 9, Dlanggu, Mojokerto 61371',
      lat: -7.56645,
      lng: 112.483986,
      imageUrl: '/assets/sidesa/dlanggu-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Pasar Dlanggu (Pasar Tanjungsari)',
      category: 'Perdagangan & Ekonomi',
      description:
        'Pasar tradisional utama sekaligus simpul ekonomi Kecamatan Dlanggu yang berada di pertigaan jalur strategis menuju Gondang/Pacet dan Kutorejo.',
      address: 'Pertigaan Pasar Dlanggu, Desa Dlanggu, Mojokerto 61371',
      lat: -7.5658,
      lng: 112.4847,
      imageUrl: '/assets/sidesa/dlanggu-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Coffee Taman & Sentra UMKM Desa Dlanggu',
      category: 'Ekonomi Kreatif & BUMDes',
      description:
        'Unit usaha ekonomi kreatif dan kuliner UMKM binaan desa di kawasan taman sekitar Balai Desa Dlanggu.',
      address: 'Kawasan Balai Desa Dlanggu, Mojokerto 61371',
      lat: -7.5666,
      lng: 112.4837,
      imageUrl: '/assets/sidesa/dlanggu-coffee-taman.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Tugu Perjuangan Pahlawan Dlanggu',
      category: 'Sejarah & Landmark',
      description:
        'Monumen sejarah perjuangan kemerdekaan yang menjadi penanda kawasan pusat pertigaan Pasar Dlanggu.',
      address: 'Pertigaan Dlanggu, Desa Dlanggu, Mojokerto 61371',
      lat: -7.5655,
      lng: 112.4843,
      imageUrl: '/assets/sidesa/dlanggu-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POI',
      title: 'Lapangan Sepak Bola Desa Dlanggu',
      category: 'Olahraga & Pemuda',
      description:
        'Fasilitas lapangan olahraga desa yang aktif dimanfaatkan untuk pembinaan pemuda, olahraga masyarakat, dan agenda lokal.',
      address: 'Desa Dlanggu, Kecamatan Dlanggu, Mojokerto 61371',
      imageUrl: '/assets/sidesa/dlanggu-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'POTENSI',
      title: 'Lahan Pertanian Produktif Desa Dlanggu (±93,18 Ha)',
      category: 'Pertanian & Ketahanan Pangan',
      description:
        'Hamparan lahan pertanian dataran rendah seluas ±93,18 hektare yang menopang ketahanan pangan dan ekonomi petani di 4 dusun.',
      address: 'Dusun Dlanggu, Kademangan, Sroyo & Segaran',
      imageUrl: '/assets/sidesa/dlanggu-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Balai Desa & Pusat Pemerintahan Desa Dlanggu',
      category: 'Profil Wilayah',
      description: 'Dokumentasi visual kawasan Balai Desa Dlanggu, Kecamatan Dlanggu, Kabupaten Mojokerto.',
      imageUrl: '/assets/sidesa/dlanggu-hero.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Aktivitas Perdagangan di Pasar Dlanggu',
      category: 'Ekonomi Desa',
      description: 'Suasana pusat perdagangan tradisional di Pasar Dlanggu yang melayani warga Kecamatan Dlanggu.',
      imageUrl: '/assets/sidesa/dlanggu-pasar.jpg',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      kind: 'GALERI',
      title: 'Coffee Taman & Ruang Ekonomi Kreatif UMKM Desa',
      category: 'UMKM & BUMDes',
      description: 'Kawasan kuliner Coffee Taman dan etalase UMKM lokal Desa Dlanggu.',
      imageUrl: '/assets/sidesa/dlanggu-coffee-taman.jpg',
    },
  ]);

  await db.insert(schema.newsArticles).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'profil-wilayah-dan-4-dusun-desa-dlanggu-kabupaten-mojokerto',
      title: 'Profil Wilayah, Batas Administrasi & 4 Dusun Desa Dlanggu (Kode Pos 61371)',
      category: 'Data Wilayah',
      excerpt:
        'Desa Dlanggu memiliki luas ±172,77 ha (1,73 km²), 4 dusun (Dlanggu, Kademangan, Sroyo, Segaran), dan jumlah penduduk sekitar 3.873 jiwa.',
      content:
        'Desa Dlanggu (Kode Kemendagri 35.16.09.2012, Kode Pos 61371) terletak di pusat Kecamatan Dlanggu, Kabupaten Mojokerto, Provinsi Jawa Timur. Wilayah desa berbatasan langsung dengan Desa Pohkecik di utara, Desa Ngembeh di timur, Desa Mojokarang di selatan, dan Desa Jrambe di barat.\n\nLuas wilayah Desa Dlanggu tercatat sekitar 172,77 hektare (1,73 km²) yang terdiri atas lahan pertanian ±93,18 ha, pekarangan ±68,50 ha, tanah kas desa ±10,40 ha, dan penggunaan lainnya ±0,69 ha.\n\nSecara administratif, Desa Dlanggu terbagi atas 4 dusun yaitu Dusun Dlanggu, Dusun Kademangan, Dusun Sroyo, dan Dusun Segaran dengan jumlah penduduk sekitar 3.873 jiwa (1.915 laki-laki dan 1.958 perempuan; ±1.948 KK).',
      coverUrl: '/assets/sidesa/dlanggu-hero.jpg',
      authorName: 'Tim Persiapan Data Desa Dlanggu',
      views: 1,
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'desa-mandiri-dlanggu-pasar-tanjungsari-dan-coffee-taman-bumdes',
      title: 'Status Desa Mandiri, Simpul Pasar Dlanggu & Inovasi Ekonomi Kreatif Coffee Taman',
      category: 'Potensi & BUMDes',
      excerpt:
        'Desa Dlanggu berperan sebagai pusat pemerintahan dan ekonomi Kecamatan Dlanggu melalui Pasar Dlanggu, UMKM lokal, dan unit usaha Coffee Taman.',
      content:
        'Sebagai salah satu desa berstatus Desa Mandiri di Kabupaten Mojokerto di bawah kepemimpinan Kepala Desa Muhammad Nur Huda, Desa Dlanggu memadukan potensi perdagangan tradisional dengan inovasi ekonomi kreatif masyarakat.\n\nKeberadaan Pasar Dlanggu (Pasar Tanjungsari) di jalur utama menuju Gondang/Pacet dan Kutorejo menjadi penggerak utama transaksi hasil bumi dan perdagangan harian warga. Di sekitar kawasan Balai Desa, pengembangan unit usaha seperti Coffee Taman dan pemberdayaan produk UMKM lokal terus didorong untuk memperluas peluang usaha warga serta meningkatkan kemandirian ekonomi desa.',
      coverUrl: '/assets/sidesa/dlanggu-coffee-taman.jpg',
      authorName: 'Tim Persiapan Data Desa Dlanggu',
      views: 1,
    },
  ]);

  console.log('[SIDesa DB] Seeded Desa Dlanggu (Kec. Dlanggu, Kab. Mojokerto 61371) — status UNCLAIMED & PUBLIC');
}

export async function getDefaultVillage() {
  const anyRow = await db
    .select()
    .from(schema.villages)
    .where(eq(schema.villages.status, 'ACTIVE'))
    .limit(1);
  return anyRow[0] || null;
}

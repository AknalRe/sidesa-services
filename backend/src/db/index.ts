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
      status TEXT NOT NULL DEFAULT 'ACTIVE',
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

  await seedDefaultPlansAndSettings();
}

async function seedDefaultPlansAndSettings(): Promise<void> {
  const [{ total }] = await db.select({ total: count() }).from(schema.subscriptionPlans);
  if (total === 0) {
    await db.insert(schema.subscriptionPlans).values([
      {
        id: 'plan-starter',
        code: 'STARTER',
        name: 'Paket Desa Mandiri',
        description: 'Cocok untuk desa yang baru memulai digitalisasi website profil desa & pelayanan surat.',
        priceMonthly: 150000,
        priceYearly: 1500000,
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
        priceMonthly: 250000,
        priceYearly: 2500000,
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
        priceMonthly: 450000,
        priceYearly: 4500000,
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
    ]);
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

export async function getDefaultVillage() {
  const anyRow = await db
    .select()
    .from(schema.villages)
    .where(eq(schema.villages.status, 'ACTIVE'))
    .limit(1);
  return anyRow[0] || null;
}

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
      village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      phone TEXT,
      position TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

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
  `);

  await seedDefaultVillageIfEmpty();
}

async function seedDefaultVillageIfEmpty(): Promise<void> {
  const [{ total }] = await db.select({ total: count() }).from(schema.villages);
  if (total > 0) return;

  const vid = schema.DEFAULT_VILLAGE_ID;
  const year = new Date().getFullYear();

  await db.insert(schema.villages).values({
    id: vid,
    name: 'Desa Sugihwaras',
    slug: 'sugihwaras',
    kodeDesa: '35.22.13.2001',
    district: 'Kepohbaru',
    regency: 'Bojonegoro',
    province: 'Jawa Timur',
    postalCode: '62194',
    headName: 'H. Sutrisno, S.Sos',
    headTitle: 'Kepala Desa',
    headGreeting:
      'Selamat datang di Website Resmi dan Portal Layanan Digital Desa Sugihwaras. Melalui portal ini, warga dapat mengakses informasi publik, transparansi APBDes, cek penerima bantuan sosial, hingga mengajukan permohonan surat secara mandiri dari rumah.',
    vision:
      'Terwujudnya Desa Sugihwaras yang Maju, Mandiri, Transparan, dan Sejahtera Berbasis Pelayanan Publik Digital.',
    mission:
      '1. Meningkatkan mutu pelayanan administrasi dan persuratan warga yang cepat dan transparan.\n2. Mengelola APBDes secara akuntabel dan partisipatif.\n3. Mengembangkan ekonomi lokal melalui digitalisasi UMKM dan potensi pertanian desa.\n4. Membangun infrastruktur desa yang merata dan berkelanjutan.',
    history:
      'Desa Sugihwaras berdiri sejak awal abad ke-20 sebagai sentra pertanian subur di Kecamatan Kepohbaru, Kabupaten Bojonegoro. Nama Sugihwaras berasal dari doa para leluhur agar masyarakatnya senantiasa makmur (sugih) dan sehat sentosa (waras).',
    address: 'Jl. Raya Balai Desa Sugihwaras No. 01, Kec. Kepohbaru, Kab. Bojonegoro 62194',
    phone: '081234567890',
    email: 'pemdes@sugihwaras.desa.id',
    website: 'https://sugihwaras.desa.id',
    areaKm2: 4.82,
    boundariesJson: JSON.stringify({
      north: 'Desa Sumbergede',
      east: 'Desa Mojosari',
      south: 'Desa Krangkong',
      west: 'Desa Nglumber',
    }),
    mapLat: -7.2345,
    mapLng: 112.0942,
  });

  // Seed SOTK officials
  await db.insert(schema.officials).values([
    { id: crypto.randomUUID(), villageId: vid, name: 'H. Sutrisno, S.Sos', position: 'Kepala Desa', sortOrder: 1 },
    { id: crypto.randomUUID(), villageId: vid, name: 'Ahmad Fauzi, S.AP', position: 'Sekretaris Desa', sortOrder: 2 },
    { id: crypto.randomUUID(), villageId: vid, name: 'Siti Rahmawati', position: 'Kaur Keuangan', sortOrder: 3 },
    { id: crypto.randomUUID(), villageId: vid, name: 'Bambang Wijaya', position: 'Kasi Pemerintahan', sortOrder: 4 },
    { id: crypto.randomUUID(), villageId: vid, name: 'Rina Kusuma', position: 'Kasi Pelayanan & Kesejahteraan', sortOrder: 5 },
    { id: crypto.randomUUID(), villageId: vid, name: 'Dedi Prasetyo', position: 'Kepala Dusun Krajan', sortOrder: 6 },
  ]);

  // Seed representative residents for live Infografis Penduduk
  await db.insert(schema.residents).values([
    { id: crypto.randomUUID(), villageId: vid, nik: '3522130101850001', kkNumber: '3522130101100001', fullName: 'Slamet Widodo', gender: 'L', birthDate: '1985-04-12', dusun: 'Dusun Krajan', rt: '001', rw: '001', education: 'SLTA/Sederajat', occupation: 'Petani/Pekebun', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522134506880002', kkNumber: '3522130101100001', fullName: 'Sri Wahyuni', gender: 'P', birthDate: '1988-06-05', dusun: 'Dusun Krajan', rt: '001', rw: '001', education: 'SLTA/Sederajat', occupation: 'Mengurus Rumah Tangga', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522131209120003', kkNumber: '3522130101100001', fullName: 'Bagas Pratama', gender: 'L', birthDate: '2012-09-12', dusun: 'Dusun Krajan', rt: '001', rw: '001', education: 'SD/Sederajat', occupation: 'Pelajar/Mahasiswa', religion: 'Islam', maritalStatus: 'Belum Kawin', isVoter: false },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522131803790004', kkNumber: '3522130101100002', fullName: 'Hendra Gunawan', gender: 'L', birthDate: '1979-03-18', dusun: 'Dusun Ngasem', rt: '002', rw: '001', education: 'S1/Diploma IV', occupation: 'Wiraswasta', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522135407820005', kkNumber: '3522130101100002', fullName: 'Nurul Hidayah', gender: 'P', birthDate: '1982-07-14', dusun: 'Dusun Ngasem', rt: '002', rw: '001', education: 'S1/Diploma IV', occupation: 'Guru/PNS', religion: 'Islam', maritalStatus: 'Kawin', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522132211950006', kkNumber: '3522130101100003', fullName: 'Rizky Saputra', gender: 'L', birthDate: '1995-11-22', dusun: 'Dusun Sumber', rt: '003', rw: '002', education: 'SLTA/Sederajat', occupation: 'Karyawan Swasta', religion: 'Islam', maritalStatus: 'Belum Kawin', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522136102650007', kkNumber: '3522130101100004', fullName: 'Sumarni', gender: 'P', birthDate: '1965-02-21', dusun: 'Dusun Sumber', rt: '003', rw: '002', education: 'SD/Sederajat', occupation: 'Pedagang', religion: 'Islam', maritalStatus: 'Cerai Mati', isVoter: true },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522130908010008', kkNumber: '3522130101100005', fullName: 'Dina Amelia', gender: 'P', birthDate: '2001-08-09', dusun: 'Dusun Krajan', rt: '002', rw: '001', education: 'S1/Diploma IV', occupation: 'Pelajar/Mahasiswa', religion: 'Islam', maritalStatus: 'Belum Kawin', isVoter: true },
  ]);

  // Seed APBDes
  await db.insert(schema.apbdesItems).values([
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'PENDAPATAN', subCategory: 'Dana Desa (DD)', label: 'Dana Desa APBN', budgetAmount: 1050000000, realizedAmount: 840000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'PENDAPATAN', subCategory: 'Alokasi Dana Desa (ADD)', label: 'Alokasi Dana Desa Kabupaten', budgetAmount: 480000000, realizedAmount: 410000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'PENDAPATAN', subCategory: 'PADes', label: 'Pendapatan Asli Desa & BUMDes', budgetAmount: 125000000, realizedAmount: 98500000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'BELANJA', subCategory: 'Penyelenggaraan Pemerintahan', label: 'Siltap, Operasional & Pelayanan Desa', budgetAmount: 465000000, realizedAmount: 392000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'BELANJA', subCategory: 'Pelaksanaan Pembangunan', label: 'Jalan Usaha Tani, Drainase & Posyandu', budgetAmount: 720000000, realizedAmount: 585000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'BELANJA', subCategory: 'Pembinaan & Pemberdayaan', label: 'UMKM, Karang Taruna & Ketahanan Pangan', budgetAmount: 290000000, realizedAmount: 215000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'BELANJA', subCategory: 'Penanggulangan Bencana & BLT', label: 'BLT Dana Desa & Darurat Desa', budgetAmount: 144000000, realizedAmount: 120000000 },
    { id: crypto.randomUUID(), villageId: vid, fiscalYear: year, category: 'PEMBIAYAAN', subCategory: 'SILPA Tahun Sebelumnya', label: 'Penerimaan Pembiayaan SILPA', budgetAmount: 45000000, realizedAmount: 45000000 },
  ]);

  // Seed Bansos
  await db.insert(schema.bansosRecipients).values([
    { id: crypto.randomUUID(), villageId: vid, nik: '3522136102650007', fullName: 'Sumarni', kkNumber: '3522130101100004', program: 'BLT-DD', period: `Tahap I ${year}`, amount: 900000, status: 'TERSALURKAN', dusun: 'Dusun Sumber' },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522130101850001', fullName: 'Slamet Widodo', kkNumber: '3522130101100001', program: 'BPNT', period: `Triwulan I ${year}`, amount: 600000, status: 'AKTIF', dusun: 'Dusun Krajan' },
    { id: crypto.randomUUID(), villageId: vid, nik: '3522134506880002', fullName: 'Sri Wahyuni', kkNumber: '3522130101100001', program: 'PKH', period: `Tahap I ${year}`, amount: 750000, status: 'TERSALURKAN', dusun: 'Dusun Krajan' },
  ]);

  // Seed Indicators (IDM / Indeks Desa / SDGs / Stunting)
  await db.insert(schema.villageIndicators).values({
    id: crypto.randomUUID(),
    villageId: vid,
    year,
    idmScore: 0.8124,
    idmStatus: 'Mandiri',
    sdgsScore: 68.4,
    stuntingCases: 4,
    stuntingRate: 2.1,
    dimensionsJson: JSON.stringify([
      { name: 'Layanan Dasar', score: 0.84 },
      { name: 'Sosial', score: 0.86 },
      { name: 'Ekonomi', score: 0.77 },
      { name: 'Lingkungan', score: 0.79 },
      { name: 'Aksesibilitas', score: 0.81 },
      { name: 'Tata Kelola Pemerintahan Desa', score: 0.88 },
    ]),
  });

  // Seed News
  await db.insert(schema.newsArticles).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'musyawarah-perencanaan-pembangunan-desa-tahun-ini',
      title: `Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes) Tahun ${year}`,
      category: 'Pemerintahan',
      excerpt:
        'Pemerintah Desa bersama BPD, tokoh masyarakat, dan perwakilan dusun menyepakati prioritas pembangunan jalan usaha tani serta digitalisasi pelayanan publik.',
      content:
        'Pemerintah Desa Sugihwaras telah menyelenggarakan Musrenbangdes di Balai Desa dengan dihadiri oleh perangkat desa, BPD, ketua RT/RW, serta perwakilan kelompok tani dan PKK.\n\nPrioritas tahun ini mencakup peningkatan saluran irigasi pertanian, perkerasan jalan poros dusun, penanganan stunting terpadu di Posyandu, serta layanan pengajuan surat mandiri melalui portal resmi desa agar warga tidak perlu antre lama di kantor desa.',
      authorName: 'Sekretaris Desa',
      views: 128,
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      slug: 'penyaluran-blt-dana-desa-tahap-pertama-berjalan-lancar',
      title: 'Penyaluran BLT Dana Desa Tahap Pertama Berjalan Tertib dan Transparan',
      category: 'Bansos',
      excerpt:
        'Sebanyak 40 Keluarga Penerima Manfaat menerima bantuan langsung tunai di Balai Desa dengan verifikasi data kependudukan.',
      content:
        'Penyaluran Bantuan Langsung Tunai Dana Desa (BLT-DD) telah dilaksanakan secara terbuka di Pendopo Balai Desa. Warga dapat memeriksa status kepesertaan bansos secara mandiri melalui menu Infografis > Bansos di website desa menggunakan NIK atau nama lengkap.',
      authorName: 'Kasi Pelayanan',
      views: 94,
    },
  ]);

  // Seed UMKM
  await db.insert(schema.umkmProducts).values([
    {
      id: crypto.randomUUID(),
      villageId: vid,
      name: 'Keripik Tempe Gurih Khas Sugihwaras',
      category: 'Kuliner',
      price: 15000,
      unit: 'bungkus 250g',
      sellerName: 'UMKM Ibu Sumarni',
      sellerPhone: '6281234567891',
      description: 'Keripik tempe renyah tanpa pengawet, diolah dari kedelai pilihan petani lokal.',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      name: 'Beras Organik Pandan Wangi',
      category: 'Hasil Pertanian',
      price: 78000,
      unit: 'sak 5 kg',
      sellerName: 'Gapoktan Tani Makmur',
      sellerPhone: '6281234567892',
      description: 'Beras pulen wangi langsung dari penggilingan Gabungan Kelompok Tani Desa Sugihwaras.',
    },
    {
      id: crypto.randomUUID(),
      villageId: vid,
      name: 'Anyaman Tas Bambu Tradisional',
      category: 'Kerajinan',
      price: 45000,
      unit: 'pcs',
      sellerName: 'Kriya Muda Karang Taruna',
      sellerPhone: '6281234567893',
      description: 'Tas anyaman bambu ramah lingkungan cocok untuk hampers dan belanja harian.',
    },
  ]);

  // Seed PPID Documents
  await db.insert(schema.ppidDocuments).values([
    { id: crypto.randomUUID(), villageId: vid, category: 'BERKALA', title: `Peraturan Desa tentang APBDes Tahun Anggaran ${year}`, documentNumber: `PERDES/01/${year}`, year, summary: 'Rincian rencana pendapatan, belanja, dan pembiayaan desa tahun berjalan.' },
    { id: crypto.randomUUID(), villageId: vid, category: 'SETIAP_SAAT', title: 'Daftar Informasi Publik (DIP) Pemerintah Desa', documentNumber: `SK-PPID/02/${year}`, year, summary: 'Daftar dokumen publik yang dapat diakses warga sesuai UU No. 14 Tahun 2008 tentang KIP.' },
    { id: crypto.randomUUID(), villageId: vid, category: 'DASAR_HUKUM', title: 'Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa', documentNumber: 'PERMENDAGRI-47-2016', year: 2016, summary: 'Pedoman baku pencatatan 32 buku administrasi pemerintahan desa.' },
    { id: crypto.randomUUID(), villageId: vid, category: 'SERTA_MERTA', title: 'Prosedur Siaga Banjir & Tanggap Darurat Desa', documentNumber: `SOP-DARURAT/${year}`, year, summary: 'Informasi titik evakuasi dan nomor darurat desa.' },
  ]);

  // Seed Places (POI, Potensi, Wisata, Galeri)
  await db.insert(schema.villagePlaces).values([
    { id: crypto.randomUUID(), villageId: vid, kind: 'POI', title: 'Kantor Balai Desa Sugihwaras', category: 'Pemerintahan', description: 'Pusat pelayanan administrasi kependudukan, persuratan, dan informasi PPID desa.', address: 'Jl. Raya Balai Desa No. 01', lat: -7.2345, lng: 112.0942 },
    { id: crypto.randomUUID(), villageId: vid, kind: 'POI', title: 'Polindes & Posyandu Melati', category: 'Kesehatan', description: 'Layanan pemeriksaan ibu hamil, balita, dan pemantauan gizi stunting bulanan.', address: 'Dusun Krajan RT 001/001', lat: -7.2351, lng: 112.0958 },
    { id: crypto.randomUUID(), villageId: vid, kind: 'POTENSI', title: 'Sentra Pertanian Padi & Palawija', category: 'Pertanian', description: 'Hamparan sawah irigasi teknis seluas 280 hektar dengan hasil panen 3 kali setahun.', address: 'Wilayah Timur Desa' },
    { id: crypto.randomUUID(), villageId: vid, kind: 'WISATA', title: 'Embung Wisata Tani Sugihwaras', category: 'Wisata Alam', description: 'Tampungan air irigasi yang ditata sebagai ruang rekreasi keluarga dan pasar kuliner sore.', address: 'Dusun Sumber', lat: -7.232, lng: 112.0981 },
  ]);

  // Seed PBB-P2 sample
  await db.insert(schema.pbbRecords).values([
    { id: crypto.randomUUID(), villageId: vid, nop: '35.22.130.001.001-0012.0', taxpayerName: 'Slamet Widodo', dusun: 'Dusun Krajan', fiscalYear: year, taxAmount: 85000, status: 'LUNAS', paidAt: new Date() },
    { id: crypto.randomUUID(), villageId: vid, nop: '35.22.130.001.002-0045.0', taxpayerName: 'Hendra Gunawan', dusun: 'Dusun Ngasem', fiscalYear: year, taxAmount: 145000, status: 'BELUM_BAYAR' },
  ]);

  console.log('[SIDesa DB] Seeded default village "Desa Sugihwaras"');
}

export async function getDefaultVillage() {
  const rows = await db
    .select()
    .from(schema.villages)
    .where(eq(schema.villages.id, schema.DEFAULT_VILLAGE_ID))
    .limit(1);
  if (rows[0]) return rows[0];
  const anyRow = await db.select().from(schema.villages).limit(1);
  return anyRow[0] || null;
}

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  bigint,
} from 'drizzle-orm/pg-core';

export const DEFAULT_VILLAGE_ID = 'default-village';

// 1. Villages (Multi-tenant root)
export const villages = pgTable('villages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  kodeDesa: text('kode_desa'),
  district: text('district').notNull().default(''),
  regency: text('regency').notNull().default(''),
  province: text('province').notNull().default(''),
  postalCode: text('postal_code').default(''),
  headName: text('head_name').default(''),
  headTitle: text('head_title').default('Kepala Desa'),
  headGreeting: text('head_greeting').default(''),
  vision: text('vision').default(''),
  mission: text('mission').default(''),
  history: text('history').default(''),
  address: text('address').default(''),
  phone: text('phone').default(''),
  email: text('email').default(''),
  website: text('website').default(''),
  areaKm2: doublePrecision('area_km2').default(0),
  boundariesJson: text('boundaries_json'),
  mapLat: doublePrecision('map_lat').default(-7.2575),
  mapLng: doublePrecision('map_lng').default(112.0125),
  logoUrl: text('logo_url'),
  heroImageUrl: text('hero_image_url'),
  officialStatsJson: text('official_stats_json'),
  status: text('status').notNull().default('ACTIVE'),
  isClaimed: boolean('is_claimed').notNull().default(true),
  licenseStatus: text('license_status').notNull().default('ACTIVE'),
  licensePlan: text('license_plan').notNull().default('SIDesa Standar'),
  licenseExpiresAt: timestamp('license_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Back-office users (Superadmin Platform & Perangkat / Operator Desa)
export const villageUsers = pgTable('village_users', {
  id: text('id').primaryKey(),
  villageId: text('village_id').references(() => villages.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('ADMIN'), // SUPERADMIN | ADMIN | KADES | SEKDES | OPERATOR
  phone: text('phone'),
  position: text('position'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. SOTK & Aparatur Pemerintah Desa
export const officials = pgTable('officials', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  nip: text('nip'),
  phone: text('phone'),
  photoUrl: text('photo_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Data Penduduk (Permendagri 47/2016)
export const residents = pgTable('residents', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  nik: text('nik').notNull(),
  kkNumber: text('kk_number').notNull(),
  fullName: text('full_name').notNull(),
  gender: text('gender').notNull().default('L'), // L | P
  birthDate: text('birth_date'), // YYYY-MM-DD
  dusun: text('dusun').notNull().default('Dusun Krajan'),
  rt: text('rt').notNull().default('001'),
  rw: text('rw').notNull().default('001'),
  education: text('education').default('SLTA/Sederajat'),
  occupation: text('occupation').default('Petani/Pekebun'),
  religion: text('religion').default('Islam'),
  maritalStatus: text('marital_status').default('Kawin'),
  isVoter: boolean('is_voter').notNull().default(true),
  status: text('status').notNull().default('AKTIF'), // AKTIF | PINDAH | MENINGGAL
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Pelayanan & Persuratan Desa (Permendagri 109/2019)
export const letterRequests = pgTable('letter_requests', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  trackingCode: text('tracking_code').notNull().unique(),
  letterType: text('letter_type').notNull(), // SKTM | DOMISILI | SKU | KELAHIRAN | KEMATIAN | PENGANTAR_NIKAH | LAINNYA
  letterNumber: text('letter_number'),
  applicantNik: text('applicant_nik').notNull(),
  applicantName: text('applicant_name').notNull(),
  applicantPhone: text('applicant_phone').notNull(),
  purpose: text('purpose').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('DIAJUKAN'), // DIAJUKAN | DIPROSES | SELESAI | DITOLAK
  adminNotes: text('admin_notes'),
  processedBy: text('processed_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. APBDes (Pendapatan, Belanja, Pembiayaan lintas tahun)
export const apbdesItems = pgTable('apbdes_items', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  fiscalYear: integer('fiscal_year').notNull(),
  category: text('category').notNull(), // PENDAPATAN | BELANJA | PEMBIAYAAN
  subCategory: text('sub_category').notNull(),
  label: text('label').notNull(),
  budgetAmount: bigint('budget_amount', { mode: 'number' }).notNull().default(0),
  realizedAmount: bigint('realized_amount', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Bantuan Sosial (Bansos)
export const bansosRecipients = pgTable('bansos_recipients', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  nik: text('nik').notNull(),
  fullName: text('full_name').notNull(),
  kkNumber: text('kk_number'),
  program: text('program').notNull(), // PKH | BPNT | BLT-DD | PBI-JK | LAINNYA
  period: text('period').notNull(),
  amount: integer('amount').notNull().default(0),
  status: text('status').notNull().default('AKTIF'), // AKTIF | TERSALURKAN | NONAKTIF
  dusun: text('dusun').default('Dusun Krajan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Indikator Desa (IDM / Indeks Desa, SDGs, Stunting)
export const villageIndicators = pgTable('village_indicators', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  year: integer('year').notNull(),
  idmScore: doublePrecision('idm_score').notNull().default(0.785),
  idmStatus: text('idm_status').notNull().default('Maju'), // Mandiri | Maju | Berkembang | Tertinggal
  sdgsScore: doublePrecision('sdgs_score').notNull().default(64.5),
  stuntingCases: integer('stunting_cases').notNull().default(0),
  stuntingRate: doublePrecision('stunting_rate').notNull().default(0),
  dimensionsJson: text('dimensions_json'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9. Berita & Kegiatan Desa
export const newsArticles = pgTable('news_articles', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull().default('Kegiatan Desa'),
  excerpt: text('excerpt').notNull().default(''),
  content: text('content').notNull(),
  coverUrl: text('cover_url'),
  authorName: text('author_name').notNull().default('Admin Desa'),
  published: boolean('published').notNull().default(true),
  views: integer('views').notNull().default(0),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

// 10. Beli Dari Desa (UMKM)
export const umkmProducts = pgTable('umkm_products', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('Kuliner'),
  price: integer('price').notNull().default(0),
  unit: text('unit').notNull().default('pcs'),
  sellerName: text('seller_name').notNull(),
  sellerPhone: text('seller_phone').notNull(),
  description: text('description').default(''),
  imageUrl: text('image_url'),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. PPID Dokumen Publik (UU KIP)
export const ppidDocuments = pgTable('ppid_documents', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  category: text('category').notNull(), // BERKALA | SERTA_MERTA | SETIAP_SAAT | DASAR_HUKUM
  title: text('title').notNull(),
  documentNumber: text('document_number'),
  year: integer('year').notNull(),
  summary: text('summary').default(''),
  fileUrl: text('file_url'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

// 12. Permohonan Informasi Publik (PPID)
export const ppidRequests = pgTable('ppid_requests', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  ticketCode: text('ticket_code').notNull().unique(),
  requesterName: text('requester_name').notNull(),
  requesterNik: text('requester_nik').notNull(),
  requesterPhone: text('requester_phone').notNull(),
  requesterEmail: text('requester_email'),
  informationNeeded: text('information_needed').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').notNull().default('DIAJUKAN'), // DIAJUKAN | DIPROSES | SELESAI | DITOLAK
  responseText: text('response_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Pengaduan Masyarakat Online
export const complaints = pgTable('complaints', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  ticketCode: text('ticket_code').notNull().unique(),
  reporterName: text('reporter_name').notNull(),
  reporterPhone: text('reporter_phone').notNull(),
  category: text('category').notNull().default('Infrastruktur'),
  location: text('location').default(''),
  description: text('description').notNull(),
  status: text('status').notNull().default('BARU'), // BARU | DITINDAKLANJUTI | SELESAI | DITOLAK
  responseText: text('response_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. Peta Desa (POI), Potensi, Wisata, Galeri
export const villagePlaces = pgTable('village_places', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  kind: text('kind').notNull().default('POI'), // POI | POTENSI | WISATA | GALERI
  title: text('title').notNull(),
  category: text('category').notNull().default('Fasilitas Umum'),
  description: text('description').default(''),
  address: text('address').default(''),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Perpajakan Desa (PBB-P2)
export const pbbRecords = pgTable('pbb_records', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  nop: text('nop').notNull(),
  taxpayerName: text('taxpayer_name').notNull(),
  dusun: text('dusun').default('Dusun Krajan'),
  fiscalYear: integer('fiscal_year').notNull(),
  taxAmount: integer('tax_amount').notNull().default(0),
  status: text('status').notNull().default('BELUM_BAYAR'), // BELUM_BAYAR | LUNAS
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Absensi Aparatur & Buku Tamu
export const attendanceLogs = pgTable('attendance_logs', {
  id: text('id').primaryKey(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  kind: text('kind').notNull().default('APARATUR'), // APARATUR | TAMU
  personName: text('person_name').notNull(),
  nik: text('nik'),
  roleOrOrigin: text('role_or_origin').default(''),
  purpose: text('purpose').default(''),
  checkInAt: timestamp('check_in_at').defaultNow().notNull(),
  checkOutAt: timestamp('check_out_at'),
});

// 17. Paket Langganan SaaS Desa (Layaknya Hosting)
export const subscriptionPlans = pgTable('subscription_plans', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // STARTER | PRO | ENTERPRISE
  name: text('name').notNull(),
  description: text('description').default(''),
  priceMonthly: integer('price_monthly').notNull().default(150000),
  priceYearly: integer('price_yearly').notNull().default(1500000),
  featuresJson: text('features_json').default('[]'),
  capabilitiesJson: text('capabilities_json').default('[]'),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 18. Tagihan / Invoice Berlangganan Desa
export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  villageId: text('village_id')
    .references(() => villages.id, { onDelete: 'cascade' })
    .notNull(),
  planCode: text('plan_code').notNull(),
  planName: text('plan_name').notNull(),
  durationMonths: integer('duration_months').notNull().default(12),
  amount: integer('amount').notNull().default(0),
  uniqueCode: integer('unique_code').notNull().default(0),
  amountTotal: integer('amount_total').notNull().default(0),
  status: text('status').notNull().default('UNPAID'), // UNPAID | WAITING_VERIFICATION | PAID | CANCELLED
  paymentMethod: text('payment_method').notNull().default('TRANSFER_BANK'), // TRANSFER_BANK | QRIS | VIRTUAL_ACCOUNT
  paymentReference: text('payment_reference'),
  paymentNote: text('payment_note'),
  studentIdentityJson: text('student_identity_json'),
  reneoOrderPublicId: text('reneo_order_public_id'),
  reneoInvoiceNumber: text('reneo_invoice_number'),
  reneoPaymentMethodsJson: text('reneo_payment_methods_json'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 19. Pengaturan Platform Superadmin (Rekening Pembayaran, QRIS, Kontak)
export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

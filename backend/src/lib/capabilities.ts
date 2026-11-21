export interface CapabilityDef {
  key: string;
  label: string;
  category: 'Dasar & Publikasi' | 'Administrasi & Pelayanan' | 'Keuangan & Sosial' | 'Integrasi & Enterprise';
  description: string;
  menuId?: string;
}

export const SIDESA_CAPABILITY_CATALOG: CapabilityDef[] = [
  {
    key: 'profile',
    label: 'Profil, Sejarah & Visual Desa',
    category: 'Dasar & Publikasi',
    description: 'Pengaturan identitas desa, visi misi, peta batas wilayah, logo & banner hero.',
    menuId: 'profile',
  },
  {
    key: 'news',
    label: 'Berita, Artikel & Pengumuman',
    category: 'Dasar & Publikasi',
    description: 'CMS publikasi berita kegiatan desa, pengumuman warga & dokumentasi.',
    menuId: 'news',
  },
  {
    key: 'places',
    label: 'Peta WebGIS, Potensi & Galeri',
    category: 'Dasar & Publikasi',
    description: 'Pemetaan titik lokasi fasilitas umum (POI), potensi unggulan, wisata & galeri foto.',
    menuId: 'places',
  },
  {
    key: 'umkm',
    label: 'Lapak Beli Dari Desa (UMKM)',
    category: 'Dasar & Publikasi',
    description: 'Katalog produk UMKM warga desa dengan tombol pemesanan langsung ke WhatsApp penjual.',
    menuId: 'umkm',
  },
  {
    key: 'officials',
    label: 'Struktur Perangkat Desa (SOTK)',
    category: 'Administrasi & Pelayanan',
    description: 'Manajemen profil Kepala Desa, Sekretaris Desa, Kaur, Kasi & Kepala Dusun.',
    menuId: 'officials',
  },
  {
    key: 'residents',
    label: 'Administrasi Kependudukan (Permendagri 47/2016)',
    category: 'Administrasi & Pelayanan',
    description: 'Buku induk penduduk, NIK/KK, demografi otomatis per dusun, pendidikan & pekerjaan.',
    menuId: 'residents',
  },
  {
    key: 'letters',
    label: 'Persuratan Mandiri Warga (Permendagri 109/2019)',
    category: 'Administrasi & Pelayanan',
    description: 'Pengajuan surat online (SKTM, Domisili, SKU, Pengantar), kode lacak & cetak nomor resmi.',
    menuId: 'letters',
  },
  {
    key: 'ppid',
    label: 'Portal PPID & Permohonan Informasi (UU KIP)',
    category: 'Administrasi & Pelayanan',
    description: 'Publikasi dokumen informasi publik berkala/serta-merta & tindak lanjut tiket PPID.',
    menuId: 'ppid',
  },
  {
    key: 'complaints',
    label: 'Pengaduan Masyarakat Online',
    category: 'Administrasi & Pelayanan',
    description: 'Kanal aspirasi & laporan warga berbasis tiket pelacakan hingga status selesai.',
    menuId: 'complaints',
  },
  {
    key: 'attendance',
    label: 'Absensi Aparatur & Buku Tamu',
    category: 'Administrasi & Pelayanan',
    description: 'Pencatatan kehadiran harian perangkat desa dan buku tamu kantor balai desa.',
    menuId: 'attendance',
  },
  {
    key: 'apbdes',
    label: 'Keuangan & Transparansi APBDes',
    category: 'Keuangan & Sosial',
    description: 'Input anggaran & realisasi Pendapatan, Belanja, Pembiayaan serta infografis APBDes.',
    menuId: 'apbdes',
  },
  {
    key: 'bansos',
    label: 'Transparansi & Cek Penerima Bansos',
    category: 'Keuangan & Sosial',
    description: 'Pengelolaan daftar penerima PKH, BPNT, BLT-DD & pencarian mandiri oleh warga.',
    menuId: 'bansos',
  },
  {
    key: 'pbb',
    label: 'Pelacakan Pajak PBB-P2 per Dusun',
    category: 'Keuangan & Sosial',
    description: 'Pencatatan NOP, ketetapan pajak PBB-P2, dan status pelunasan wajib pajak.',
    menuId: 'pbb',
  },
  {
    key: 'indicators',
    label: 'Indeks Desa (IDM), SDGs & Stunting',
    category: 'Keuangan & Sosial',
    description: 'Pemantauan skor IDM, capaian SDGs Desa, dan statistik penanganan stunting.',
    menuId: 'indicators',
  },
  {
    key: 'whatsapp_notify',
    label: 'Notifikasi WhatsApp Otomatis (WAHA)',
    category: 'Integrasi & Enterprise',
    description: 'Pengiriman status permohonan surat otomatis ke nomor WhatsApp pemohon.',
  },
  {
    key: 'custom_domain',
    label: 'Custom Domain (.desa.id) & Multi-Operator',
    category: 'Integrasi & Enterprise',
    description: 'Dukungan domain resmi .desa.id, multi-operator perangkat desa & backup prioritas.',
  },
];

export const VALID_CAPABILITY_KEYS = new Set(SIDESA_CAPABILITY_CATALOG.map((c) => c.key));

export const DEFAULT_PLAN_CAPABILITIES: Record<string, string[]> = {
  KKN: ['profile', 'news', 'officials', 'umkm', 'places', 'apbdes'],
  STARTER: ['profile', 'news', 'residents', 'letters', 'apbdes', 'officials', 'places'],
  PRO: [
    'profile',
    'news',
    'residents',
    'letters',
    'apbdes',
    'officials',
    'umkm',
    'places',
    'bansos',
    'pbb',
    'ppid',
    'complaints',
    'indicators',
    'attendance',
    'whatsapp_notify',
  ],
  ENTERPRISE: SIDESA_CAPABILITY_CATALOG.map((c) => c.key),
};

export function normalizeCapabilities(raw: unknown, fallbackPlanCode?: string): string[] {
  let list: string[] = [];
  if (Array.isArray(raw)) {
    list = raw.map((x) => String(x || '').trim()).filter((k) => VALID_CAPABILITY_KEYS.has(k));
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed.map((x) => String(x || '').trim()).filter((k) => VALID_CAPABILITY_KEYS.has(k));
      }
    } catch {
      list = [];
    }
  }
  if (list.length === 0 && fallbackPlanCode) {
    return [...(DEFAULT_PLAN_CAPABILITIES[fallbackPlanCode.toUpperCase()] || DEFAULT_PLAN_CAPABILITIES.STARTER)];
  }
  return Array.from(new Set(list));
}

export function capabilityLabelsFromKeys(keys: string[]): string[] {
  const byKey = new Map(SIDESA_CAPABILITY_CATALOG.map((c) => [c.key, c.label]));
  return keys.map((k) => byKey.get(k)).filter((x): x is string => Boolean(x));
}

export function getCapabilityLabel(key: string): string {
  return SIDESA_CAPABILITY_CATALOG.find((c) => c.key === key)?.label || key;
}

export function resolveRequiredCapabilityForAdminRoute(method: string, routePath: string): string | null {
  const clean = routePath.replace(/^\/api\/admin/, '').split('?')[0];
  if (
    clean === '' ||
    clean === '/' ||
    clean.startsWith('/dashboard') ||
    clean.startsWith('/billing') ||
    clean.startsWith('/upload')
  ) {
    return null;
  }
  if (clean.startsWith('/village')) {
    return method.toUpperCase() === 'GET' ? null : 'profile';
  }
  if (clean.startsWith('/residents')) return 'residents';
  if (clean.startsWith('/letters')) return 'letters';
  if (clean.startsWith('/apbdes')) return 'apbdes';
  if (clean.startsWith('/bansos')) return 'bansos';
  if (clean.startsWith('/pbb')) return 'pbb';
  if (clean.startsWith('/complaints')) return 'complaints';
  if (clean.startsWith('/news')) return 'news';
  if (clean.startsWith('/umkm')) return 'umkm';
  if (clean.startsWith('/officials')) return 'officials';
  if (clean.startsWith('/places')) return 'places';
  if (clean.startsWith('/indicators')) return 'indicators';
  if (clean.startsWith('/ppid')) return 'ppid';
  if (clean.startsWith('/attendance')) return 'attendance';
  return null;
}

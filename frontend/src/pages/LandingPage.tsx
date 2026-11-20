import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { ReneoSidesaLogo } from '../components/ReneoSidesaLogo';
import { api } from '../services/api';
import { sidesaAsset } from '../lib/assets';

interface LandingPageProps {
  onOpenVillagePortal: (initialTab?: string, slug?: string) => void;
  onOpenAdmin: () => void;
}

const DEFAULT_CREST = sidesaAsset('crest-default.svg');

const HERO_SLIDES = [
  {
    category: 'Sistem Informasi & Tata Kelola Desa',
    title: 'Transformasi Digital Pemerintahan dan Pelayanan Publik Desa',
    subtitle:
      'Satu sistem terintegrasi untuk mengelola administrasi kependudukan, pelayanan persuratan warga, transparansi anggaran APBDes, hingga portal resmi profil desa.',
    bgImage: sidesaAsset('hero-village.jpg'),
    fgImage: sidesaAsset('preview-webprofil.svg'),
  },
  {
    category: 'Pelayanan Persuratan & Portal Warga',
    title: 'Percepat Pelayanan Surat Warga dan Keterbukaan Informasi Desa',
    subtitle:
      'Setiap desa memiliki portal resmi yang terhubung langsung dengan database kependudukan Permendagri 47/2016, format surat Permendagri 109/2019, PPID, dan katalog UMKM.',
    bgImage: sidesaAsset('news-musyawarah.jpg'),
    fgImage: sidesaAsset('preview-pelayanan.svg'),
  },
  {
    category: 'Anjungan Mandiri & Pemetaan Wilayah',
    title: 'Cetak Surat Mandiri dan Pemetaan Potensi Wilayah Desa',
    subtitle:
      'Dukung pelayanan cepat di balai desa serta tampilkan peta lokasi fasilitas umum, batas wilayah, dan potensi ekonomi desa secara terukur.',
    bgImage: sidesaAsset('news-pertanian.jpg'),
    fgImage: sidesaAsset('preview-anjungan.svg'),
  },
];

const FEATURE_TABS = [
  {
    id: 'administrasi',
    label: 'Administrasi Desa',
    regulation: 'Permendagri No. 47 Tahun 2016',
    title: 'Tata Kelola Buku Administrasi & Database Kependudukan',
    description:
      'Kelola buku induk penduduk, Kartu Keluarga, mutasi warga, struktur perangkat desa (SOTK), kehadiran aparatur, hingga buku tamu dalam satu basis data terpusat.',
    image: sidesaAsset('preview-administrasi.svg'),
    points: [
      'Database kependudukan terstruktur per Dusun, RT, dan RW',
      'Rekap statistik demografi otomatis (pendidikan, pekerjaan, umur, wajib pilih)',
      'Manajemen perangkat desa (SOTK) dan pencatatan kehadiran harian',
      'Pemantauan skor Indeks Desa Membangun (IDM), SDGs Desa, dan data stunting',
    ],
  },
  {
    id: 'pelayanan',
    label: 'Pelayanan Persuratan',
    regulation: 'Permendagri No. 109 Tahun 2019',
    title: 'Pengajuan & Cetak Surat Keterangan Warga Lebih Cepat',
    description:
      'Warga dapat mengajukan permohonan surat dari portal desa dan melacak statusnya; perangkat desa memverifikasi NIK dan langsung mencetak surat bernomor resmi.',
    image: sidesaAsset('preview-pelayanan.svg'),
    points: [
      'Format surat standar pemerintahan desa (SKTM, Domisili, SKU, Pengantar)',
      'Pengajuan surat mandiri oleh warga lengkap dengan Kode Lacak',
      'Notifikasi WhatsApp otomatis ke pemohon saat surat selesai diproses',
      'Arsip register surat keluar tercatat rapi di Back-Office',
    ],
  },
  {
    id: 'webprofil',
    label: 'Website Profil Desa',
    regulation: 'UU KIP No. 14 Tahun 2008',
    title: 'Portal Resmi Desa, Infografis APBDes, PPID & Lapak UMKM',
    description:
      'Hadirkan portal resmi desa dengan halaman profil, infografis demografi, realisasi APBDes, cek penerima Bansos, dokumen PPID, berita kegiatan, dan katalog UMKM.',
    image: sidesaAsset('preview-webprofil.svg'),
    points: [
      'Beranda desa dengan berita kegiatan, Jelajahi Desa, dan Sambutan Kepala Desa',
      'Infografis Penduduk, APBDes, Cek Bansos, IDM, Stunting, dan SDGs',
      'Portal PPID (Informasi Berkala, Serta-Merta, Setiap Saat) & Pengaduan Warga',
      'Katalog Beli Dari Desa untuk memasarkan produk UMKM warga',
    ],
  },
  {
    id: 'perpajakan',
    label: 'PBB-P2 & Bansos',
    regulation: 'Transparansi Keuangan & Sosial',
    title: 'Pelacakan PBB-P2 per Dusun & Transparansi Bantuan Sosial',
    description:
      'Pantau ketetapan serta pelunasan Pajak Bumi dan Bangunan (PBB-P2) tingkat desa sekaligus sediakan pengecekan penerima bantuan sosial bagi masyarakat.',
    image: sidesaAsset('preview-perpajakan.svg'),
    points: [
      'Rekap ketetapan dan status pelunasan PBB-P2 per wajib pajak dan dusun',
      'Pencatatan pagu anggaran dan realisasi Pendapatan & Belanja APBDes',
      'Pencarian penerima BLT-DD, PKH, dan BPNT menggunakan NIK atau Nama',
      'Ringkasan anggaran otomatis tersaji di halaman infografis desa',
    ],
  },
  {
    id: 'webgis',
    label: 'WebGIS & Peta Desa',
    regulation: 'Pemetaan Fasilitas & Potensi',
    title: 'Pemetaan Wilayah Desa (WebGIS) & Direktori Lokasi Penting',
    description:
      'Tampilkan peta wilayah desa, lokasi fasilitas pemerintahan, kesehatan, pendidikan, serta potensi pertanian dan wisata desa secara interaktif.',
    image: sidesaAsset('preview-webgis.svg'),
    points: [
      'Peta lokasi Balai Desa, Polindes, Sekolah, Pasar Desa, dan Wisata',
      'Direktori potensi unggulan pertanian, perkebunan, dan ekonomi warga',
      'Antarmuka responsif yang nyaman diakses warga dari ponsel maupun desktop',
      'Kanal pengaduan warga online lengkap dengan kode tiket pelacakan',
    ],
  },
];

const BENEFIT_ROWS = [
  {
    topic: 'Jangkauan Informasi Desa',
    icon: sidesaAsset('benefit-globe.svg'),
    without:
      'Informasi kegiatan, laporan anggaran APBDes, dan potensi produk desa hanya tertempel di papan pengumuman kantor balai desa.',
    withSidesa:
      'Website Resmi Desa dapat diakses kapan saja oleh warga lokal maupun perantauan lengkap dengan berita, infografis, dan katalog UMKM.',
  },
  {
    topic: 'Kecepatan Pelayanan Surat',
    icon: sidesaAsset('benefit-surat.svg'),
    without:
      'Warga harus mengantre di kantor desa sementara perangkat mengetik ulang data NIK dan format surat satu per satu secara manual.',
    withSidesa:
      'Warga mengajukan surat dari ponsel, perangkat memverifikasi data NIK, dan surat bernomor resmi siap dicetak dalam hitungan menit.',
  },
  {
    topic: 'Transparansi & Akuntabilitas',
    icon: sidesaAsset('benefit-transparansi.svg'),
    without:
      'Masyarakat sulit mengakses rincian realisasi APBDes, daftar penerima bantuan sosial, maupun dokumen informasi publik (PPID).',
    withSidesa:
      'Infografis APBDes, fitur Cek Penerima Bansos, dan dokumen resmi PPID tersaji terbuka sesuai ketentuan UU Keterbukaan Informasi Publik.',
  },
  {
    topic: 'Efisiensi Kerja Perangkat Desa',
    icon: sidesaAsset('benefit-efisiensi.svg'),
    without:
      'Perangkat desa harus merekap ulang data penduduk dan laporan keuangan berkali-kali karena tersebar di banyak file terpisah.',
    withSidesa:
      'Satu kali pembaruan di Back-Office otomatis memperbarui buku administrasi, statistik demografi, dan halaman Website Resmi Desa.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu Reneo SIDesa?',
    a: 'Reneo SIDesa adalah platform Sistem Informasi Desa terintegrasi yang memadukan Back-Office Pemerintahan Desa (administrasi kependudukan Permendagri 47/2016, persuratan Permendagri 109/2019, APBDes, Bansos, PBB-P2) dengan Website Resmi Profil Desa untuk pelayanan mandiri masyarakat.',
  },
  {
    q: 'Bagaimana mekanisme pendaftaran, paket berlangganan, dan aktivasi desa baru?',
    a: 'Perangkat desa cukup mendaftar melalui menu Back-Office (/admin), memilih paket serta durasi berlangganan (bulanan atau tahunan layaknya hosting), lalu menyelesaikan pembayaran sesuai invoice. Setelah dikonfirmasi, website resmi desa (/desa/nama-desa) otomatis aktif.',
  },
  {
    q: 'Apakah perubahan data di Back-Office langsung memperbarui Website Resmi Desa?',
    a: 'Ya. Seluruh data penduduk, anggaran APBDes, berita kegiatan, struktur SOTK, dokumen PPID, hingga katalog UMKM yang diinput di Back-Office otomatis tampil di halaman Website Resmi Desa tanpa perlu input ulang.',
  },
  {
    q: 'Apakah mendukung pengajuan surat mandiri dan notifikasi WhatsApp ke warga?',
    a: 'Ya. Warga dapat mengajukan permohonan surat dari Website Resmi Desa dan memantau progresnya dengan Kode Lacak. Saat perangkat desa menyelesaikan surat di Back-Office, sistem dapat mengirimkan pemberitahuan WhatsApp otomatis ke nomor pemohon.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenVillagePortal, onOpenAdmin }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [featureIdx, setFeatureIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [plans, setPlans] = useState<any[]>([]);
  const [registeredVillages, setRegisteredVillages] = useState<Array<{ slug: string; name: string; logoUrl?: string }>>(
    []
  );

  useEffect(() => {
    api
      .getPublicVillages()
      .then((rows) => {
        if (Array.isArray(rows)) {
          setRegisteredVillages(rows);
        }
      })
      .catch(() => {});
    api
      .getPublicPlans()
      .then((res) => {
        if (Array.isArray(res?.plans)) {
          setPlans(res.plans);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, []);

  const activeHero = HERO_SLIDES[heroIdx % HERO_SLIDES.length];
  const activeFeature = FEATURE_TABS[featureIdx] || FEATURE_TABS[0];

  // 100% data desa yang benar-benar terdaftar dan berstatus aktif di database
  const portfolioList = registeredVillages.map((v) => ({
    slug: v.slug,
    name: v.name,
    logoUrl: v.logoUrl || DEFAULT_CREST,
  }));

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col">
      {/* FULL-WIDTH TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <ReneoSidesaLogo className="w-10 h-10 shrink-0" />
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B2A57]">
                Reneo SIDesa
              </div>
              <div className="text-xs text-slate-500 truncate">
                Platform Sistem Informasi Pemerintahan &amp; Pelayanan Publik Desa
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#fitur" className="hover:text-[#0069b6] transition-colors">
              Fitur &amp; Modul
            </a>
            <a href="#manfaat" className="hover:text-[#0069b6] transition-colors">
              Manfaat
            </a>
            <a href="#paket" className="hover:text-[#0069b6] transition-colors">
              Paket &amp; Harga
            </a>
            <a href="#portofolio" className="hover:text-[#0069b6] transition-colors">
              Desa Pengguna
            </a>
            <a href="#faq" className="hover:text-[#0069b6] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-10 px-4 rounded-lg bg-[#0B2A57] hover:bg-slate-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Back-Office Desa</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu navigasi"
              className="lg:hidden h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 grid grid-cols-2 gap-2">
            <a
              href="#fitur"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Fitur &amp; Modul
            </a>
            <a
              href="#manfaat"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Manfaat
            </a>
            <a
              href="#portofolio"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Desa Pengguna
            </a>
            <a
              href="#faq"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      <main id="top" className="flex-1 w-full">
        {/* 1. FULL-WIDTH HERO */}
        <section className="relative w-full min-h-[540px] lg:min-h-[600px] bg-[#0B2A57] text-white overflow-hidden flex items-center">
          <img
            src={activeHero.bgImage}
            alt={activeHero.title}
            className="absolute inset-0 w-full h-full object-cover object-right-top opacity-35 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-[#0B2A57]/80" />

          <button
            type="button"
            onClick={() => setHeroIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Slide sebelumnya"
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Slide berikutnya"
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="relative z-10 w-full px-4 sm:px-10 lg:px-20 xl:px-28 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
                {activeHero.category}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight leading-[1.15]">
                {activeHero.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                {activeHero.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="h-11 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold inline-flex items-center gap-2 transition-colors"
                >
                  <span>Kelola &amp; Daftarkan Desa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#portofolio"
                  className="h-11 px-6 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <span>Lihat Desa Pengguna</span>
                </a>
              </div>

              <div className="pt-4 flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.category}
                    type="button"
                    onClick={() => setHeroIdx(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-sm transition-all ${
                      idx === heroIdx % HERO_SLIDES.length ? 'w-8 bg-emerald-400' : 'w-3 bg-white/35'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <img
                src={activeHero.fgImage}
                alt={activeHero.title}
                className="w-full max-w-lg max-h-[360px] object-contain"
              />
            </div>
          </div>
        </section>

        {/* 2. EMPAT PILAR EKOSISTEM */}
        <section className="w-full bg-[#F6F6F6] border-b border-slate-200 py-10 px-4 sm:px-8 lg:px-14 xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Pemerintahan Desa',
                sub: '32 Buku Administrasi (Permendagri 47/2016), Kependudukan, SOTK & Absensi Aparatur',
                icon: sidesaAsset('icon-profil.svg'),
              },
              {
                title: 'Pelayanan Publik',
                sub: 'Layanan Persuratan Mandiri (Permendagri 109/2019), PBB-P2, & Transparansi Bansos',
                icon: sidesaAsset('icon-ppid.svg'),
              },
              {
                title: 'Publikasi & Website Desa',
                sub: 'Website Profil Desa, Infografis APBDes, PPID (UU KIP), Berita & Lapak UMKM',
                icon: sidesaAsset('icon-infografis.svg'),
              },
              {
                title: 'Pemantauan & Indeks Desa',
                sub: 'WebGIS Peta Wilayah Desa, Indeks Desa Membangun (IDM), SDGs & Data Stunting',
                icon: sidesaAsset('icon-idm.svg'),
              },
            ].map((p) => (
              <div key={p.title} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                <img src={p.icon} alt={p.title} className="w-12 h-12 object-contain shrink-0" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">{p.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. FITUR SIDESA */}
        <section id="fitur" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 space-y-8 border-b border-slate-200">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0069b6]">
              Modul &amp; Layanan Terintegrasi
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Fitur Reneo SIDesa
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Dirancang sesuai ketentuan UU Desa dan Peraturan Menteri Dalam Negeri untuk mempermudah pekerjaan harian
              perangkat desa sekaligus mempercepat layanan masyarakat.
            </p>
          </div>

          {/* Crisp Rectangular Feature Tabs (No Bubble Pills) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {FEATURE_TABS.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeatureIdx(idx)}
                className={`h-10 px-4 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                  featureIdx === idx
                    ? 'bg-[#0B2A57] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-[#F6F6F6] border border-slate-200 rounded-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 flex items-center justify-center">
              <img
                src={activeFeature.image}
                alt={activeFeature.title}
                className="w-full max-w-xl max-h-[360px] object-contain rounded-lg"
              />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-mono font-bold text-[#0069b6] uppercase">
                {activeFeature.regulation}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {activeFeature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{activeFeature.description}</p>

              <ul className="space-y-2 pt-1">
                {activeFeature.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-1" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. MANFAAT SIDESA: TANPA SIDESA VS DENGAN SIDESA */}
        <section id="manfaat" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 bg-[#F6F6F6] border-b border-slate-200 space-y-8">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0069b6]">
              Dampak Transformasi Digital
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Manfaat Reneo SIDesa
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Perbandingan pengelolaan administrasi dan pelayanan warga sebelum dan sesudah menggunakan Reneo SIDesa.
            </p>
          </div>

          <div className="hidden lg:grid lg:grid-cols-12 gap-6 text-center font-extrabold text-base">
            <div className="lg:col-span-5 py-3 rounded-lg bg-slate-200 text-slate-700">Tanpa SIDesa</div>
            <div className="lg:col-span-2 flex items-center justify-center text-xs uppercase tracking-wider text-slate-500">
              Aspek Layanan
            </div>
            <div className="lg:col-span-5 py-3 rounded-lg bg-[#0B2A57] text-white">Dengan Reneo SIDesa</div>
          </div>

          <div className="space-y-4">
            {BENEFIT_ROWS.map((row) => (
              <div key={row.topic} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-5 bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-xl p-5 flex flex-col justify-center space-y-1">
                  <span className="lg:hidden text-xs font-extrabold uppercase text-rose-600">Tanpa SIDesa</span>
                  <div className="text-base font-extrabold text-slate-900">{row.topic}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{row.without}</p>
                </div>

                <div className="lg:col-span-2 flex flex-col items-center justify-center py-1">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2.5">
                    <img src={row.icon} alt={row.topic} className="w-9 h-9 object-contain" />
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-slate-200 border-l-4 border-l-emerald-600 rounded-xl p-5 flex flex-col justify-center space-y-1">
                  <span className="lg:hidden text-xs font-extrabold uppercase text-emerald-700">
                    Dengan Reneo SIDesa
                  </span>
                  <div className="text-base font-extrabold text-[#0B2A57]">{row.topic}</div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{row.withSidesa}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4B. PAKET BERLANGGANAN DESA (Layaknya Hosting) */}
        {plans.length > 0 && (
          <section id="paket" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 bg-white border-b border-slate-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0069b6]">
                  Langganan SaaS Desa
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
                  Paket Berlangganan Reneo SIDesa
                </h2>
                <p className="text-sm sm:text-base text-slate-600">
                  Pilih durasi paket bulanan atau tahunan sesuai kebutuhan pemerintahan desa Anda.
                </p>
              </div>
              <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-bold self-start">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    billingPeriod === 'yearly' ? 'bg-white text-[#0069b6] shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Tahunan (Hemat 2 Bulan)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((p) => {
                const isPro = p.code === 'PRO';
                const price = billingPeriod === 'yearly' ? p.priceYearly : p.priceMonthly;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl p-6 flex flex-col justify-between space-y-6 bg-white border ${
                      isPro ? 'border-[#0069b6] ring-1 ring-[#0069b6]' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                        {isPro && (
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0069b6] text-[11px] font-bold">
                            Populer
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.description}</p>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0B2A57]">
                          Rp {Number(price || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {' '}
                          / {billingPeriod === 'yearly' ? 'tahun' : 'bulan'}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        {(p.features || []).map((f: string) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenAdmin}
                      className={`w-full h-10 rounded-lg text-sm font-bold transition-colors ${
                        isPro
                          ? 'bg-[#0069b6] hover:bg-[#005a9e] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      }`}
                    >
                      Pilih Paket &amp; Daftar Desa
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. PORTOFOLIO DESA PENGGUNA (100% Data Resmi Terdaftar dari Database: Logo & Nama Desa) */}
        <section id="portofolio" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 border-b border-slate-200 space-y-8">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0069b6]">
              Direktori Resmi
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
              Desa Pengguna Reneo SIDesa
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Daftar desa yang terdaftar dan aktif berlangganan layanan Reneo SIDesa.
            </p>
          </div>

          {portfolioList.length === 0 ? (
            <div className="bg-[#F6F6F6] border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <div className="text-base font-extrabold text-slate-800">
                Belum ada desa terdaftar aktif saat ini
              </div>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Setiap desa yang mendaftar dan menyelesaikan aktivasi langganan akan otomatis tampil di direktori resmi ini.
              </p>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="h-10 px-5 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <span>Daftarkan Desa Anda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {portfolioList.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => onOpenVillagePortal('beranda', item.slug)}
                  className="bg-white border border-slate-200 hover:border-[#0069b6] rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center transition-colors group"
                >
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#0069b6]">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 bg-[#F6F6F6]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0069b6]">
                Informasi Tambahan
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Pertanyaan Umum (FAQ)
              </h2>
            </div>

            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-extrabold text-slate-900 hover:bg-slate-50"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FULL-WIDTH FOOTER */}
      <footer className="w-full bg-[#0B2A57] text-slate-300 py-10 px-4 sm:px-8 lg:px-14 xl:px-20">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <ReneoSidesaLogo className="w-10 h-10 shrink-0" />
            <div>
              <div className="text-base font-extrabold text-white">Reneo SIDesa</div>
              <div className="text-xs text-slate-300">
                Platform Sistem Informasi Pemerintahan &amp; Pelayanan Publik Desa · Ekosistem Reneo
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-10 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold"
            >
              Back-Office Perangkat Desa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

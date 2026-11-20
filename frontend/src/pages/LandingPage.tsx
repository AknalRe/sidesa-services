import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Landmark,
  LogIn,
  MapPin,
  Menu,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { ReneoSidesaLogo } from '../components/ReneoSidesaLogo';
import { api } from '../services/api';

interface LandingPageProps {
  onOpenVillagePortal: (initialTab?: string) => void;
  onOpenAdmin: () => void;
}

const BOJONEGORO_CREST =
  'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/common/300_bojonegorokab.png';

const HERO_SLIDES = [
  {
    badge: 'Transformasi Digital Desa',
    title: 'Transformasi Digital Pemerintahan & Pelayanan Desa',
    subtitle:
      'Perluas jangkauan informasi, percepat pelayanan administrasi warga, dan hadirkan transparansi anggaran desa dengan sistem informasi desa terintegrasi.',
    bgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-landing-test.webp',
    fgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-hero1.webp',
  },
  {
    badge: 'Website Profil & Layanan Mandiri',
    title: 'Portal Resmi Desa & Pengajuan Surat dari Rumah',
    subtitle:
      'Setiap desa memiliki website resmi yang langsung terhubung dengan buku induk penduduk, persuratan Permendagri 109/2019, infografis APBDes, cek Bansos, dan lapak UMKM warga.',
    bgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-landing2.webp',
    fgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/preview-fitur/webprofil.webp',
  },
  {
    badge: 'Anjungan Mandiri & WebGIS Desa',
    title: 'Cetak Surat Mandiri & Pemetaan Potensi Wilayah Desa',
    subtitle:
      'Dukung pelayanan cepat di kantor balai desa serta tampilkan peta batas wilayah, fasilitas umum, dan potensi pertanian desa secara interaktif.',
    bgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-anjungan.webp',
    fgImage: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/anjungan.webp',
  },
];

const FEATURE_TABS = [
  {
    id: 'administrasi',
    label: 'Administrasi Desa',
    regulation: 'Permendagri No. 47 Tahun 2016',
    title: 'Tata Kelola 32 Buku Administrasi & Database Kependudukan',
    description:
      'Kelola buku induk penduduk, Kartu Keluarga, mutasi warga, perangkat desa (SOTK), kehadiran aparatur, hingga buku tamu desa dalam satu database terpusat.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/preview-fitur/administrasi.webp',
    points: [
      'Database kependudukan lengkap per Dusun, RT, dan RW',
      'Rekap statistik demografi otomatis (pendidikan, pekerjaan, umur, wajib pilih)',
      'Manajemen perangkat desa (SOTK) dan pencatatan kehadiran harian',
      'Sinkronisasi data Indeks Desa Membangun (IDM) dan SDGs Desa',
    ],
  },
  {
    id: 'pelayanan',
    label: 'Pelayanan & Persuratan',
    regulation: 'Permendagri No. 109 Tahun 2019',
    title: 'Pengajuan & Cetak Surat Keterangan Warga dalam Hitungan Menit',
    description:
      'Warga dapat mengajukan surat keterangan secara mandiri melalui portal desa dan melacak statusnya; perangkat desa memverifikasi NIK dan langsung mencetak surat bernomor resmi.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/preview-fitur/pelayanan.webp',
    points: [
      'Puluhan format surat standar (SKTM, Domisili, SKU, Pengantar, Kelahiran)',
      'Pengajuan surat mandiri oleh warga lengkap dengan Kode Lacak',
      'Notifikasi WhatsApp otomatis ke warga saat surat selesai diproses',
      'Arsip buku register surat keluar tercatat otomatis',
    ],
  },
  {
    id: 'webprofil',
    label: 'Website Profil Desa',
    regulation: 'UU KIP No. 14 Tahun 2008',
    title: 'Portal Resmi Desa, Infografis APBDes, PPID & Lapak UMKM',
    description:
      'Tampilkan wajah resmi desa di internet lengkap dengan infografis penduduk, realisasi APBDes, cek penerima Bansos, dokumen PPID, berita kegiatan, dan katalog Beli dari Desa.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/preview-fitur/webprofil.webp',
    points: [
      'Beranda desa dengan slider berita, Jelajahi Desa, dan Sambutan Kepala Desa',
      'Infografis Penduduk, APBDes, Cek Bansos, IDM, Stunting, dan SDGs',
      'Portal PPID (Informasi Berkala, Serta-Merta, Setiap Saat) & Pengaduan Warga',
      'Katalog Beli Dari Desa untuk memasarkan produk UMKM warga langsung ke pembeli',
    ],
  },
  {
    id: 'perpajakan',
    label: 'Pajak PBB-P2 & Bansos',
    regulation: 'Transparansi Keuangan & Sosial',
    title: 'Pelacakan PBB-P2 per Dusun & Transparansi Bantuan Sosial',
    description:
      'Pantau target serta realisasi Pajak Bumi dan Bangunan (PBB-P2) tingkat desa sekaligus berikan akses pengecekan penerima bantuan sosial yang transparan bagi masyarakat.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/preview-fitur/perpajakan.webp',
    points: [
      'Rekap ketetapan dan status pelunasan PBB-P2 per wajib pajak dan dusun',
      'Pencatatan anggaran dan realisasi Pendapatan & Belanja APBDes',
      'Pencarian penerima BLT-DD, PKH, dan BPNT menggunakan NIK atau Nama',
      'Laporan realisasi otomatis tampil di infografis website desa',
    ],
  },
  {
    id: 'webgis',
    label: 'WebGIS & Layanan Warga',
    regulation: 'Pemetaan & Akses Mobile',
    title: 'Pemetaan Wilayah Desa (WebGIS) & Akses Mudah dari Ponsel',
    description:
      'Visualisasikan batas wilayah desa, lokasi fasilitas umum, potensi pertanian, dan destinasi wisata desa yang nyaman diakses warga dari perangkat mobile maupun komputer.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-webgis.webp',
    points: [
      'Peta interaktif lokasi Balai Desa, Polindes, Sekolah, Pasar, dan Wisata',
      'Direktori potensi unggulan pertanian, perkebunan, dan ekonomi desa',
      'Antarmuka responsif yang mudah digunakan warga dari ponsel',
      'Kanal pengaduan warga online lengkap dengan pelacakan tindak lanjut',
    ],
  },
];

const BENEFIT_PARIS = [
  {
    topic: 'Jangkauan Informasi Desa',
    icon: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/icon/globe.svg',
    without:
      'Informasi kegiatan, transparansi anggaran APBDes, dan potensi produk desa hanya terbatas pada papan pengumuman di kantor balai desa.',
    withSidesa:
      'Website Resmi Desa dapat diakses 24 jam oleh warga lokal, perantauan, maupun masyarakat luas lengkap dengan berita, infografis, dan lapak UMKM.',
  },
  {
    topic: 'Kecepatan Pelayanan Surat',
    icon: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/icon/click.svg',
    without:
      'Warga harus mengantre lama di kantor desa sementara perangkat mengetik ulang data NIK dan format surat satu per satu secara manual.',
    withSidesa:
      'Warga mengajukan surat dari ponsel, data NIK terisi otomatis dari database penduduk, dan surat siap dicetak serta ditandatangani dalam hitungan menit.',
  },
  {
    topic: 'Transparansi & Akuntabilitas',
    icon: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/icon/blt.svg',
    without:
      'Warga sulit mengetahui rincian realisasi APBDes, daftar penerima bantuan sosial, maupun prosedur permohonan dokumen publik (PPID).',
    withSidesa:
      'Infografis APBDes, fitur Cek Penerima Bansos, dan dokumen resmi PPID tersaji terbuka sesuai amanat UU Keterbukaan Informasi Publik.',
  },
  {
    topic: 'Efisiensi Waktu & Tenaga Perangkat',
    icon: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/icon/headphone.svg',
    without:
      'Perangkat desa harus merekap ulang data penduduk dan laporan keuangan berkali-kali karena tersebar di banyak file spreadsheet berbeda.',
    withSidesa:
      'Satu kali input di Back-Office Desa otomatis memperbarui buku administrasi, laporan statistik demografi, dan tampilan Website Resmi Desa.',
  },
];

const SUCCESS_VILLAGES = [
  {
    name: 'Desa Sugihwaras',
    region: 'Kec. Kepohbaru, Kab. Bojonegoro, Jawa Timur',
    highlight: 'Portal Resmi Desa, Layanan Surat Mandiri, Transparansi APBDes & Lapak UMKM',
    image:
      'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/29ac04c99ac6977a17584e511f07072a.jpeg',
    isLiveDemo: true,
  },
  {
    name: 'Desa Senga Selatan',
    region: 'Kab. Luwu, Sulawesi Selatan',
    highlight: 'Digitalisasi Administrasi Kependudukan & Pelayanan Persuratan Terpadu',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/senga-selatan.webp',
    isLiveDemo: false,
  },
  {
    name: 'Desa Cawet',
    region: 'Kab. Pemalang, Jawa Tengah',
    highlight: 'Keterbukaan Informasi Publik (PPID) & Promosi Potensi Pertanian Desa',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/cawet.webp',
    isLiveDemo: false,
  },
  {
    name: 'Desa Pasamai',
    region: 'Kab. Luwu, Sulawesi Selatan',
    highlight: 'Integrasi Data Demografi, PBB-P2 & Pemberdayaan Ekonomi Warga',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/pasamai.webp',
    isLiveDemo: false,
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa itu Reneo SIDesa?',
    a: 'Reneo SIDesa adalah platform Sistem Informasi Desa terintegrasi yang memadukan Back-Office Pemerintahan Desa (administrasi kependudukan Permendagri 47/2016, persuratan Permendagri 109/2019, APBDes, Bansos, PBB-P2) dengan Website Resmi Profil Desa untuk pelayanan mandiri masyarakat.',
  },
  {
    q: 'Bagaimana cara melihat contoh Website Resmi Desa yang berjalan di platform ini?',
    a: 'Klik tombol "Lihat Website Desa Sugihwaras" di bagian atas halaman atau pada bagian Implementasi Desa. Anda akan langsung masuk ke Website Resmi Desa Sugihwaras lengkap dengan fitur Jelajahi Desa, Sambutan Kepala Desa, Peta Desa, SOTK, Infografis, Berita, Belanja UMKM, dan PPID.',
  },
  {
    q: 'Apakah perubahan data di Back-Office otomatis tampil di Website Resmi Desa?',
    a: 'Ya. Saat perangkat desa memperbarui data penduduk, rincian anggaran APBDes, berita kegiatan, perangkat SOTK, atau produk UMKM di Back-Office (#/admin), seluruh data dan grafik di Website Resmi Desa (#/desa) langsung ikut diperbarui secara otomatis.',
  },
  {
    q: 'Apakah mendukung pengajuan surat mandiri dan notifikasi WhatsApp ke warga?',
    a: 'Ya. Warga dapat mengajukan permohonan surat langsung dari Website Resmi Desa dan memantau progresnya dengan Kode Lacak. Ketika perangkat desa menyetujui surat di Back-Office, sistem dapat mengirimkan pemberitahuan WhatsApp otomatis ke nomor pemohon.',
  },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenVillagePortal, onOpenAdmin }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [featureIdx, setFeatureIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [villageData, setVillageData] = useState<any>(null);

  useEffect(() => {
    api
      .getPublicVillage()
      .then((res) => setVillageData(res))
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
  const village = villageData?.village || {
    name: 'Desa Sugihwaras',
    district: 'Kepohbaru',
    regency: 'Bojonegoro',
    province: 'Jawa Timur',
    kodeDesa: '35.22.08.2005',
  };
  const demographics = villageData?.demographics || { totalResidents: 5, totalHouseholds: 3 };
  const apbdes = villageData?.apbdes || {
    fiscalYear: 2026,
    pendapatan: { budget: 1970000000 },
    belanja: { budget: 1800000000 },
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col">
      {/* FULL-WIDTH TOP NAVBAR (Gaya Platform DIGIDES) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
        <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 h-20 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <ReneoSidesaLogo className="w-11 h-11 shrink-0" />
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0B2A57] flex items-center gap-2">
                <span>Reneo SIDesa</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Platform Digital Desa
                </span>
              </div>
              <div className="text-xs text-slate-500 truncate">
                Solusi Sistem Informasi Pemerintahan &amp; Pelayanan Publik Desa
              </div>
            </div>
          </a>

          <nav className="hidden xl:flex items-center gap-8 text-sm font-bold text-slate-700">
            <a href="#fitur" className="hover:text-[#0069b6] transition-colors">
              Fitur &amp; Layanan
            </a>
            <a href="#manfaat" className="hover:text-[#0069b6] transition-colors">
              Manfaat SIDesa
            </a>
            <a href="#implementasi" className="hover:text-[#0069b6] transition-colors">
              Contoh Website Desa
            </a>
            <a href="#faq" className="hover:text-[#0069b6] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenVillagePortal('beranda')}
              className="h-11 px-4 sm:px-5 rounded-full bg-[#0069b6] hover:bg-[#005a9e] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Lihat Website {village.name}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-11 px-4 sm:px-5 rounded-full border-2 border-[#0B2A57] text-[#0B2A57] hover:bg-[#0B2A57] hover:text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Back-Office Desa</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu navigasi"
              className="xl:hidden h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="#fitur"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Fitur &amp; Layanan
              </a>
              <a
                href="#manfaat"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Manfaat SIDesa
              </a>
              <a
                href="#implementasi"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Contoh Website Desa
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                FAQ
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1 w-full">
        {/* 1. FULL-WIDTH JUMBOTRON HERO (seperti digitaldesa.id) */}
        <section className="relative w-full min-h-[560px] lg:min-h-[640px] bg-slate-900 text-white overflow-hidden flex items-center">
          <img
            src={activeHero.bgImage}
            alt={activeHero.title}
            className="absolute inset-0 w-full h-full object-cover object-right-top opacity-45 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2A57]/95 via-[#0B2A57]/80 to-black/50" />

          {/* Left/Right Carousel Buttons */}
          <button
            type="button"
            onClick={() => setHeroIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Slide sebelumnya"
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Slide berikutnya"
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="relative z-10 w-full px-4 sm:px-10 lg:px-20 xl:px-28 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{activeHero.badge}</span>
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.12]">
                {activeHero.title}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-200 leading-relaxed max-w-2xl">
                {activeHero.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onOpenVillagePortal('beranda')}
                  className="h-12 px-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm sm:text-base font-extrabold inline-flex items-center gap-2 shadow-lg transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>Buka Website {village.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="h-12 px-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/35 text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <Landmark className="w-4 h-4" />
                  <span>Masuk Back-Office Perangkat Desa</span>
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="pt-4 flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.badge}
                    type="button"
                    onClick={() => setHeroIdx(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === heroIdx % HERO_SLIDES.length ? 'w-10 bg-emerald-400' : 'w-2.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <img
                src={activeHero.fgImage}
                alt={activeHero.title}
                className="w-full max-w-lg max-h-[380px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* 2. EMPAT PILAR EKOSISTEM (Strip Ringkas di Bawah Hero) */}
        <section className="w-full bg-[#F6F6F6] border-b border-slate-200 py-10 px-4 sm:px-8 lg:px-14 xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Pemerintahan Desa',
                sub: '32 Buku Administrasi (Permendagri 47/2016), Kependudukan, SOTK & Absensi Aparatur',
                icon: 'https://cdn.digitaldesa.com/statics/profil/icon/profil.svg',
              },
              {
                title: 'Pelayanan Publik',
                sub: 'Layanan Persuratan Mandiri (Permendagri 109/2019), PBB-P2, & Transparansi Bansos',
                icon: 'https://cdn.digitaldesa.com/statics/profil/icon/ppid.svg',
              },
              {
                title: 'Publikasi & Website Desa',
                sub: 'Website Profil Desa, Infografis APBDes, PPID (UU KIP), Berita & Lapak UMKM',
                icon: 'https://cdn.digitaldesa.com/statics/profil/icon/infografis.svg',
              },
              {
                title: 'Pemantauan & Indeks Desa',
                sub: 'WebGIS Peta Wilayah Desa, Indeks Desa Membangun (IDM), SDGs & Data Stunting',
                icon: 'https://cdn.digitaldesa.com/statics/profil/icon/infografis/idm.svg',
              },
            ].map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-5 shadow-xs flex items-start gap-4"
              >
                <img src={p.icon} alt={p.title} className="w-14 h-14 object-contain shrink-0" />
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">{p.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. FITUR SIDESA (Interactive Visual Showcase seperti digitaldesa.id) */}
        <section id="fitur" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-sky-50 text-[#0069b6] text-xs font-extrabold uppercase tracking-wider">
              Solusi yang Kami Berikan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900">
              FITUR RENEO SIDESA
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Membawa desa Anda ke era digital dengan pekerjaan yang jauh lebih efektif dan efisien dalam satu platform
              yang sesuai dengan UU Desa &amp; Peraturan Menteri Dalam Negeri.
            </p>
          </div>

          {/* Feature Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {FEATURE_TABS.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeatureIdx(idx)}
                className={`h-11 px-6 rounded-full text-sm font-extrabold transition-all ${
                  featureIdx === idx
                    ? 'bg-[#0069b6] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Active Feature Showcase */}
          <div className="bg-[#F6F6F6] rounded-3xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex items-center justify-center">
              <img
                src={activeFeature.image}
                alt={activeFeature.title}
                className="w-full max-w-xl max-h-[380px] object-contain drop-shadow-lg rounded-2xl"
              />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                {activeFeature.regulation}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {activeFeature.title}
              </h3>
              <p className="text-base text-slate-700 leading-relaxed">{activeFeature.description}</p>

              <ul className="space-y-2.5 pt-1">
                {activeFeature.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onOpenVillagePortal(
                      activeFeature.id === 'pelayanan'
                        ? 'layanan'
                        : activeFeature.id === 'perpajakan'
                          ? 'infografis'
                          : activeFeature.id === 'webgis'
                            ? 'peta'
                            : 'beranda'
                    )
                  }
                  className="h-11 px-6 rounded-full bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold inline-flex items-center gap-2"
                >
                  <span>Coba di Website {village.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="h-11 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-sm font-bold"
                >
                  Kelola di Back-Office
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MANFAAT SIDESA: TANPA SIDESA VS DENGAN SIDESA (seperti digitaldesa.id) */}
        <section id="manfaat" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 bg-[#F6F6F6] space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900">
              Manfaat Reneo SIDesa
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Perbandingan nyata pengelolaan administrasi dan pelayanan warga sebelum dan sesudah transformasi digital
              desa.
            </p>
          </div>

          <div className="hidden lg:grid lg:grid-cols-12 gap-6 text-center font-extrabold text-xl">
            <div className="lg:col-span-5 py-3 rounded-2xl bg-slate-200 text-slate-700">Tanpa SIDesa</div>
            <div className="lg:col-span-2 flex items-center justify-center text-sm uppercase tracking-wider text-slate-500">
              Aspek Layanan
            </div>
            <div className="lg:col-span-5 py-3 rounded-2xl bg-[#0069b6] text-white">Dengan Reneo SIDesa</div>
          </div>

          <div className="space-y-5">
            {BENEFIT_PARIS.map((row) => (
              <div key={row.topic} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Tanpa SIDesa */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-xs border-l-4 border-rose-400 flex flex-col justify-center space-y-1.5">
                  <span className="lg:hidden text-xs font-extrabold uppercase text-rose-600">Tanpa SIDesa</span>
                  <div className="text-base font-extrabold text-slate-900">{row.topic}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{row.without}</p>
                </div>

                {/* Center Icon */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center p-3">
                    <img src={row.icon} alt={row.topic} className="w-10 h-10 object-contain" />
                  </div>
                </div>

                {/* Dengan SIDesa */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-xs border-l-4 border-emerald-500 flex flex-col justify-center space-y-1.5">
                  <span className="lg:hidden text-xs font-extrabold uppercase text-emerald-700">
                    Dengan Reneo SIDesa
                  </span>
                  <div className="text-base font-extrabold text-[#0069b6]">{row.topic}</div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{row.withSidesa}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. IMPLEMENTASI WEBSITE RESMI DESA & CERITA SUKSES (Live Demo Desa Sugihwaras) */}
        <section id="implementasi" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                Cerita Sukses &amp; Portal Desa Aktif
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900">
                Implementasi Website Resmi Desa
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Lihat dan coba langsung portal publik <strong>{village.name}</strong> yang terhubung secara real-time
                dengan database kependudukan, persuratan, APBDes, dan UMKM.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenVillagePortal('beranda')}
              className="h-12 px-7 rounded-full bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm sm:text-base font-extrabold inline-flex items-center gap-2 shadow-md shrink-0"
            >
              <Globe className="w-5 h-5" />
              <span>Buka Website {village.name} Sekarang</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>

          {/* Featured Live Village Portal Banner (Desa Sugihwaras) */}
          <div className="rounded-3xl overflow-hidden shadow-lg bg-[#003865] text-white grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative min-h-[280px]">
              <img
                src="https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/29ac04c99ac6977a17584e511f07072a.jpeg"
                alt={village.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003865] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#003865]" />
            </div>

            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <img src={BOJONEGORO_CREST} alt="Lambang Kabupaten" className="w-16 h-16 object-contain shrink-0" />
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-extrabold">
                    PORTAL DESA AKTIF · LIVE DEMO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Website Resmi {village.name}
                  </h3>
                  <p className="text-sm text-sky-200">
                    Kecamatan {village.district}, Kabupaten {village.regency}, Provinsi {village.province} · Kode{' '}
                    <span className="font-mono">{village.kodeDesa}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/10">
                  <div className="text-xs text-sky-200">Penduduk Terdata</div>
                  <div className="text-lg font-extrabold font-mono text-white mt-0.5">
                    {demographics.totalResidents} Jiwa
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10">
                  <div className="text-xs text-sky-200">Kepala Keluarga</div>
                  <div className="text-lg font-extrabold font-mono text-white mt-0.5">
                    {demographics.totalHouseholds} KK
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10">
                  <div className="text-xs text-sky-200">Pendapatan APBDes</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-300 mt-0.5 truncate">
                    {formatRp(apbdes.pendapatan?.budget)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10">
                  <div className="text-xs text-sky-200">Belanja APBDes</div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-white mt-0.5 truncate">
                    {formatRp(apbdes.belanja?.budget)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  ['beranda', 'Beranda Desa'],
                  ['profil', 'Profil & Sejarah'],
                  ['pemerintah', 'SOTK Perangkat'],
                  ['infografis', 'Infografis & APBDes'],
                  ['layanan', 'Ajukan Surat'],
                  ['belanja', 'Beli Dari Desa (UMKM)'],
                  ['ppid', 'Portal PPID'],
                ].map(([tabKey, label]) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => onOpenVillagePortal(tabKey)}
                    className="h-9 px-4 rounded-full bg-white/15 hover:bg-white text-white hover:text-[#003865] text-xs font-bold transition-colors"
                  >
                    {label} &rarr;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Cerita Sukses Desa Lainnya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUCCESS_VILLAGES.map((v) => (
              <div
                key={v.name}
                onClick={() => onOpenVillagePortal('beranda')}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {v.isLiveDemo && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow">
                        Live Portal
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#0069b6]">{v.name}</h3>
                    <div className="text-xs font-semibold text-slate-500">{v.region}</div>
                    <p className="text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">{v.highlight}</p>
                  </div>
                </div>
                <div className="px-5 pb-4 text-xs font-extrabold text-[#0069b6] inline-flex items-center gap-1">
                  <span>{v.isLiveDemo ? 'Kunjungi Website Desa' : 'Lihat Contoh Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="w-full py-16 px-4 sm:px-8 lg:px-14 xl:px-20 bg-[#F6F6F6]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">FAQ</h2>
              <p className="text-base text-slate-600">
                Pertanyaan yang sering diajukan seputar platform Reneo SIDesa dan Website Resmi Desa.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="bg-white rounded-2xl shadow-2xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-base font-extrabold text-slate-900 hover:bg-slate-50"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-2 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
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
      <footer className="w-full bg-[#0B2A57] text-slate-300 py-12 px-4 sm:px-8 lg:px-14 xl:px-20">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <ReneoSidesaLogo className="w-11 h-11 shrink-0" />
            <div>
              <div className="text-lg font-extrabold text-white">Reneo SIDesa</div>
              <div className="text-xs sm:text-sm text-slate-300">
                Platform Sistem Informasi Pemerintahan &amp; Pelayanan Publik Desa · Ekosistem Reneo
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenVillagePortal('beranda')}
              className="h-11 px-5 rounded-full bg-[#0069b6] hover:bg-[#0078cd] text-white text-xs sm:text-sm font-bold"
            >
              Website {village.name}
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-11 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold"
            >
              Back-Office Perangkat Desa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

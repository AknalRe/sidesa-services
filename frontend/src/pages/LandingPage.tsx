import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe,
  HeartHandshake,
  Landmark,
  LogIn,
  MapPin,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
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

const NAV_LINKS = [
  { href: '#kenapa-dibuat', label: 'Cerita Kami' },
  { href: '#ekosistem', label: 'Ekosistem Modul' },
  { href: '#website-desa', label: 'Contoh Website Desa' },
  { href: '#perbandingan', label: 'Perbandingan' },
  { href: '#faq', label: 'FAQ' },
];

const HERO_MODULE_PREVIEWS = [
  {
    id: 'persuratan',
    label: 'Persuratan Mandiri',
    regBadge: 'Permendagri No. 109/2019',
    title: 'Pengajuan & Cetak Surat Desa',
    statusLabel: 'Siap Cetak · 4 Menit',
    citizenName: 'Budi Santoso (NIK 352208••••••0001)',
    citizenSub: 'Dusun Krajan RT 001 / RW 001 · Pengajuan Mandiri',
    requestSummary: 'Permohonan Surat Keterangan Usaha (SKU) untuk persyaratan modal usaha penggilingan padi.',
    officialResponse: 'Diverifikasi Kasi Pelayanan · Nomor Surat: 470/018/35.22.08.2005/2026 telah diterbitkan.',
    metaLeft: 'Kode Lacak: SR-2026-8419',
    metaMid: 'Pemberitahuan WA Terkirim',
    metaRight: 'Arsip Buku Surat Otomatis',
  },
  {
    id: 'apbdes',
    label: 'APBDes & Bansos',
    regBadge: 'Transparansi Anggaran',
    title: 'Realisasi APBDes & Cek Bansos',
    statusLabel: 'Tahun Anggaran 2026',
    citizenName: 'Ringkasan APBDes & Penyaluran Bantuan',
    citizenSub: 'Terhubung langsung ke infografis portal publik desa',
    requestSummary: 'Pendapatan Desa Rp 1.970.000.000 · Realisasi Belanja Pembangunan & Pemberdayaan Rp 1.445.000.000.',
    officialResponse: 'Warga dapat mengecek status penerima BLT-DD, PKH, dan BPNT menggunakan NIK atau nama lengkap.',
    metaLeft: 'Realisasi: 80,1%',
    metaMid: 'PBB-P2 Terpantau per Dusun',
    metaRight: 'Publikasi Infografis Real-Time',
  },
  {
    id: 'kependudukan',
    label: 'Administrasi Desa',
    regBadge: 'Permendagri No. 47/2016',
    title: 'Database Kependudukan & Aparatur',
    statusLabel: 'Data Terpadu',
    citizenName: 'Buku Induk Penduduk, KK & Mutasi Warga',
    citizenSub: 'Rekap otomatis per Dusun, Kelompok Umur, Pendidikan & Pekerjaan',
    requestSummary: '4.115 Jiwa (1.240 KK) tercatat rapi beserta perangkat desa (SOTK) dan rekap kehadiran harian.',
    officialResponse: 'Setiap perubahan data penduduk otomatis memperbarui statistik demografi di website resmi desa.',
    metaLeft: '4 Dusun Terdata',
    metaMid: 'SOTK & Kehadiran Aparatur',
    metaRight: 'Indeks Desa & SDGs Terukur',
  },
  {
    id: 'publik',
    label: 'PPID, Pengaduan & UMKM',
    regBadge: 'UU KIP No. 14/2008',
    title: 'Keterbukaan Informasi & Ekonomi Warga',
    statusLabel: 'Portal Warga Aktif',
    citizenName: 'Layanan PPID, Aspirasi Warga & Lapak UMKM',
    citizenSub: 'Satu pintu informasi resmi desa dan promosi produk lokal',
    requestSummary: 'Dokumen PPID Berkala/Serta-Merta/Setiap Saat dapat diunduh publik; pengaduan warga tercatat dengan kode tiket.',
    officialResponse: 'Katalog Beli dari Desa menampilkan produk UMKM warga lengkap dengan tombol pesan langsung ke penjual.',
    metaLeft: 'PPID 3 Kategori Lengkap',
    metaMid: 'Tiket Pengaduan Terlacak',
    metaRight: 'Katalog UMKM Tanpa Potongan',
  },
];

const VILLAGE_PAIN_POINTS = [
  {
    stat: 'Antrean Surat',
    title: 'Warga harus bolak-balik ke balai desa hanya untuk mengurus surat pengantar',
    detail:
      'Ketika permohonan surat masih ditulis tangan atau diketik ulang dari nol di komputer terpisah, perangkat desa kewalahan mencari data NIK dan warga tidak tahu kapan suratnya selesai ditandatangani.',
  },
  {
    stat: 'Data Tercecer',
    title: 'Buku penduduk, laporan anggaran, dan data penerima bantuan tidak saling terhubung',
    detail:
      'Data kependudukan berada di lembar spreadsheet berbeda dengan laporan APBDes, PBB-P2, dan daftar penerima bansos. Saat dibutuhkan untuk laporan kecamatan atau pembaruan profil desa, perangkat harus merekap ulang.',
  },
  {
    stat: 'Minim Akses',
    title: 'Transparansi anggaran, berita kegiatan, dan produk UMKM desa sulit diakses warga',
    detail:
      'Banyak desa memiliki program pembangunan dan produk UMKM unggulan, tetapi hanya terpajang di papan pengumuman kantor desa sehingga warga perantauan maupun pembeli luar daerah tidak dapat melihatnya.',
  },
];

const STORY_CHAPTERS = [
  {
    number: '01',
    step: 'Pelayanan desa berawal dari kepercayaan dan kejelasan.',
    paragraphs: [
      'Kantor desa adalah tempat pertama yang didatangi warga ketika mengurus dokumen penting, mencari informasi bantuan sosial, atau menyampaikan keluhan lingkungan. Namun perangkat desa sering harus menangani semuanya dengan berkas yang tersebar.',
      'Kami melihat bahwa digitalisasi desa tidak boleh menambah beban administrasi baru, melainkan harus meringankan pekerjaan harian perangkat desa.',
    ],
  },
  {
    number: '02',
    step: 'Website desa seharusnya hidup dari data operasional, bukan diketik dua kali.',
    paragraphs: [
      'Banyak website desa berakhir tidak terurus karena perangkat desa harus menginput data penduduk, anggaran, dan berita di dua sistem yang terpisah.',
      'Saat back-office pemerintahan desa dan portal publik warga terhubung dalam satu sumber data, setiap pembaruan penduduk, realisasi APBDes, maupun berita kegiatan langsung tampil rapi di website resmi desa.',
    ],
  },
  {
    number: '03',
    step: 'Mengacu langsung pada standar regulasi pemerintahan desa.',
    paragraphs: [
      'Kami menyusun modul administrasi mengacu pada Permendagri No. 47 Tahun 2016, layanan persuratan mengacu pada Permendagri No. 109 Tahun 2019, serta keterbukaan informasi publik sesuai UU KIP.',
      'Dengan struktur yang sesuai ketentuan, perangkat desa dapat langsung bekerja dengan format yang akrab dan siap dipertanggungjawabkan.',
    ],
  },
  {
    number: '04',
    step: 'Mendorong kemandirian warga dan perputaran ekonomi desa.',
    paragraphs: [
      'Melalui pengajuan surat mandiri, cek penerima bansos, pelacakan pengaduan, hingga katalog Beli dari Desa untuk produk UMKM warga, portal desa berubah dari sekadar halaman profil menjadi ruang pelayanan dan ekonomi yang aktif.',
    ],
  },
  {
    number: '05',
    step: 'Itulah mengapa kami membangun Reneo SIDesa.',
    paragraphs: [
      'Reneo SIDesa menyatukan sistem back-office perangkat desa dan portal resmi warga dalam satu platform yang tertib, transparan, dan mudah dipelihara untuk jangka panjang.',
    ],
  },
];

const ECOSYSTEM_PILLARS = [
  {
    badge: 'Back-Office Pemerintahan',
    regulation: 'Permendagri No. 47 Tahun 2016',
    title: 'Administrasi Desa, Kependudukan & Tata Kelola Keuangan',
    description:
      'Kelola buku induk penduduk, Kartu Keluarga, perangkat desa (SOTK), kehadiran aparatur, buku tamu, hingga rincian anggaran APBDes dari satu ruang kerja.',
    icon: Landmark,
    items: [
      'Database penduduk & KK terstruktur per Dusun, RT, dan RW',
      'Rekap demografi otomatis (umur, pendidikan, pekerjaan, agama, perkawinan)',
      'Pencatatan Pendapatan, Belanja, dan Pembiayaan APBDes lintas tahun',
      'Manajemen SOTK perangkat desa, absensi harian aparatur, dan buku tamu',
    ],
  },
  {
    badge: 'Pelayanan Publik & Pajak',
    regulation: 'Permendagri No. 109 Tahun 2019',
    title: 'Persuratan Mandiri, Transparansi Bansos & PBB-P2',
    description:
      'Pangkas waktu tunggu warga di balai desa. Warga dapat mengajukan surat dari rumah dan memantau progresnya menggunakan kode lacak.',
    icon: FileText,
    items: [
      'Pengajuan surat online (SKTM, Domisili, SKU, Pengantar, Keterangan Kelahiran)',
      'Verifikasi perangkat, penomoran surat resmi, dan cetak surat siap tanda tangan',
      'Fitur Cek Penerima Bansos (BLT-DD, PKH, BPNT) secara transparan oleh warga',
      'Pelacakan ketetapan dan status pelunasan Pajak Bumi & Bangunan (PBB-P2)',
    ],
  },
  {
    badge: 'Portal Resmi & Keterbukaan',
    regulation: 'UU KIP No. 14 Tahun 2008',
    title: 'Website Profil Desa, Infografis, PPID & Pengaduan Warga',
    description:
      'Hadirkan portal resmi desa yang selalu mutakhir dengan visualisasi data kependudukan, anggaran, dokumen publik, dan kanal aspirasi masyarakat.',
    icon: Globe,
    items: [
      'Website profil desa lengkap: sejarah, visi-misi, batas wilayah, dan struktur SOTK',
      'Dashboard infografis interaktif: Demografi Penduduk, APBDes, Bansos, IDM & SDGs',
      'Portal PPID (Informasi Berkala, Serta-Merta, Setiap Saat) & form permohonan informasi',
      'Form pengaduan masyarakat online lengkap dengan tiket pelacakan tindak lanjut',
    ],
  },
  {
    badge: 'Ekonomi, Peta & Indeks Desa',
    regulation: 'IDM · SDGs Desa · WebGIS',
    title: 'Lapak UMKM Desa, Peta Potensi Wilayah & Indeks Kemajuan',
    description:
      'Tampilkan potensi unggulan, destinasi wisata, titik fasilitas desa, serta hubungkan pelaku UMKM desa langsung dengan pembeli.',
    icon: ShoppingBag,
    items: [
      'Katalog Beli dari Desa (UMKM) dengan kontak pemesanan langsung ke penjual warga',
      'Direktori peta lokasi penting (balai desa, sekolah, poskesdes, wisata, sentra tani)',
      'Portal berita dan dokumentasi kegiatan desa yang ramah mesin pencari',
      'Pemantauan skor Indeks Desa Membangun (IDM), SDGs Desa, dan data penanganan stunting',
    ],
  },
];

const COMPARISON_ROWS = [
  {
    aspect: 'Pengajuan & Cetak Surat Warga',
    manual: 'Warga datang membawa fotokopi berkas, perangkat mengetik ulang dari awal di dokumen Word.',
    sidesa: 'Warga mengajukan mandiri dari portal, perangkat memverifikasi dan langsung mencetak surat bernomor resmi.',
  },
  {
    aspect: 'Publikasi Infografis Penduduk & APBDes',
    manual: 'Dibuat manual menjadi gambar/poster setiap akhir tahun sehingga sering terlambat diperbarui.',
    sidesa: 'Grafik demografi, realisasi APBDes, IDM, dan SDGs terbentuk otomatis dari data yang diinput di back-office.',
  },
  {
    aspect: 'Transparansi Bansos & PPID',
    manual: 'Daftar penerima dan dokumen publik hanya ditempel di papan pengumuman kantor desa.',
    sidesa: 'Warga dapat mengecek status penerima bansos via NIK/Nama dan mengunduh dokumen resmi PPID kapan saja.',
  },
  {
    aspect: 'Penanganan Pengaduan Masyarakat',
    manual: 'Keluhan masuk lewat pesan pribadi perangkat desa tanpa catatan status tindak lanjut.',
    sidesa: 'Setiap laporan warga memiliki kode tiket resmi dan tanggapan perangkat desa tercatat transparan.',
  },
  {
    aspect: 'Promosi Produk UMKM Desa',
    manual: 'Produk warga hanya dipasarkan dari mulut ke mulut di lingkungan sekitar.',
    sidesa: 'Terpajang di katalog Beli dari Desa lengkap dengan harga, kategori, dan tombol hubungi penjual.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Apa perbedaan antara halaman Platform SIDesa ini dengan Website Resmi Desa?',
    a: 'Halaman ini adalah beranda platform SaaS Reneo SIDesa (seperti digitaldesa.id) yang menjelaskan ekosistem layanan. Setiap desa memiliki Website Resmi Desa tersendiri (contohnya Desa Sugihwaras) yang menampilkan profil, infografis, layanan surat, PPID, dan UMKM desa tersebut.',
  },
  {
    q: 'Bagaimana warga mengajukan surat keterangan tanpa harus mengantre lama?',
    a: 'Warga cukup membuka menu Layanan Surat di Website Resmi Desa, memilih jenis surat (misalnya SKTM, Domisili, atau SKU), mengisi NIK dan keperluan, lalu menyimpan Kode Lacak. Perangkat desa memverifikasi di Back-Office dan mencetak surat siap tanda tangan.',
  },
  {
    q: 'Apakah data di Website Resmi Desa otomatis berubah saat perangkat desa memperbarui data di Back-Office?',
    a: 'Ya. Penduduk, rincian APBDes, penerima bansos, berita, produk UMKM, dokumen PPID, hingga struktur perangkat desa (SOTK) membaca dari satu sumber data yang sama.',
  },
  {
    q: 'Apakah warga dapat menerima pemberitahuan WhatsApp saat surat atau pengaduannya selesai diproses?',
    a: 'Ya. Reneo SIDesa mendukung pengiriman notifikasi WhatsApp otomatis kepada pemohon ketika status pengajuan surat atau tindak lanjut pengaduan diperbarui oleh perangkat desa.',
  },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenVillagePortal, onOpenAdmin }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [villageData, setVillageData] = useState<any>(null);

  useEffect(() => {
    api
      .getPublicVillage()
      .then((res) => setVillageData(res))
      .catch(() => {});
  }, []);

  const activePreview = HERO_MODULE_PREVIEWS[activeHeroIdx] || HERO_MODULE_PREVIEWS[0];
  const village = villageData?.village || {
    name: 'Desa Sugihwaras',
    district: 'Kepohbaru',
    regency: 'Bojonegoro',
    province: 'Jawa Timur',
    postalCode: '62194',
    areaKm2: '6.45',
    headName: 'H. Sukamto, S.Sos.',
    headTitle: 'Kepala Desa',
  };
  const demographics = villageData?.demographics || { totalPopulation: 5, totalKK: 3 };
  const apbdes = villageData?.apbdes || { year: 2026, pendapatan: 1970000000, belanja: 1800000000 };
  const indicator = villageData?.indicator || { idmScore: '0.7845', idmStatus: 'MAJU', sdgsScore: '76.40' };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 min-w-0">
            <ReneoSidesaLogo className="w-9 h-9 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>Reneo SIDesa</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  DIGIDES SaaS
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Platform Sistem Informasi &amp; Pelayanan Publik Desa
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-slate-900 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenVillagePortal('beranda')}
              className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Lihat Website Desa</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-9 px-3.5 rounded-lg bg-[#0B2A57] hover:bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back-Office Desa</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Buka navigasi"
              className="lg:hidden h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenVillagePortal('beranda');
                }}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
              >
                Website {village.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenAdmin();
                }}
                className="flex-1 h-9 px-3 rounded-lg bg-[#0B2A57] text-white text-xs font-semibold"
              >
                Masuk Back-Office
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-12 gap-10 items-start">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Platform Digitalisasi Pemerintahan &amp; Pelayanan Publik Desa</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Kelola pemerintahan dan pelayanan warga desa dalam satu sistem yang tertib.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                Dari administrasi kependudukan, cetak surat mandiri dalam hitungan menit, transparansi APBDes &amp; Bansos,
                hingga portal resmi desa dan katalog UMKM warga — semuanya terhubung dalam satu platform yang mudah dijalankan
                perangkat desa.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenVillagePortal('beranda')}
                  className="h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Jelajahi Website {village.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="h-11 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Landmark className="w-4 h-4 text-[#0B2A57]" />
                  <span>Buka Back-Office Perangkat Desa</span>
                </button>
              </div>

              {/* Regulatory & Feature Strip */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900">Permendagri 47/2016</div>
                  <div className="text-slate-500">Standar Administrasi Desa</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Permendagri 109/2019</div>
                  <div className="text-slate-500">Format Pelayanan Persuratan</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">UU KIP &amp; Transparansi</div>
                  <div className="text-slate-500">Portal PPID, APBDes &amp; Bansos</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Module Preview */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Preview Header Bar */}
                <div className="bg-[#0B2A57] text-white px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ReneoSidesaLogo className="w-6 h-6 shrink-0" />
                    <span className="text-xs font-semibold truncate">Simulasi Modul Reneo SIDesa</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-mono">
                    {activePreview.regBadge}
                  </span>
                </div>

                {/* Module Selector Tabs */}
                <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {HERO_MODULE_PREVIEWS.map((mod, idx) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setActiveHeroIdx(idx)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-center ${
                        activeHeroIdx === idx
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>

                {/* Active Module Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-emerald-700">{activePreview.title}</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{activePreview.citizenName}</div>
                      <div className="text-xs text-slate-500">{activePreview.citizenSub}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold shrink-0">
                      {activePreview.statusLabel}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Data / Permohonan Masuk
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{activePreview.requestSummary}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                      Tindak Lanjut Sistem &amp; Portal Desa
                    </div>
                    <p className="text-xs text-emerald-950 leading-relaxed">{activePreview.officialResponse}</p>
                  </div>

                  {/* Operational Context Strip */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 truncate">
                      {activePreview.metaLeft}
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700 truncate">
                      {activePreview.metaMid}
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700 truncate">
                      {activePreview.metaRight}
                    </div>
                  </div>
                </div>

                {/* Preview Footer Action */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">Ingin mencoba langsung modul ini?</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenVillagePortal(
                          activePreview.id === 'persuratan'
                            ? 'layanan'
                            : activePreview.id === 'apbdes'
                              ? 'infografis'
                              : activePreview.id === 'kependudukan'
                                ? 'infografis'
                                : 'ppid'
                        )
                      }
                      className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>Buka di Website Desa</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-14 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Tantangan Pelayanan Desa
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Mengapa administrasi manual membuat perangkat desa kewalahan?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {VILLAGE_PAIN_POINTS.map((item) => (
                <div key={item.stat} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#0B2A57] text-white text-xs font-bold">
                    {item.stat}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Editorial Storytelling Section */}
        <section id="kenapa-dibuat" className="py-16 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Cerita di Balik Reneo SIDesa
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                Kenapa kami membangun Reneo SIDesa untuk pemerintahan desa.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Digitalisasi desa bukan soal memindahkan tumpukan kertas ke layar yang rumit, melainkan menghadirkan tata
                kelola yang tenang bagi perangkat desa dan transparan bagi seluruh warga.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900">Prinsip Utama Reneo SIDesa</div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Satu sumber data untuk Back-Office &amp; Website Desa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mengacu Permendagri 47/2016, 109/2019 &amp; UU KIP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Warga dapat mengurus surat &amp; cek bansos dari ponsel</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {STORY_CHAPTERS.map((ch) => (
                <div key={ch.number} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Bab {ch.number}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{ch.step}</h3>
                  </div>
                  {ch.paragraphs.map((p, i) => (
                    <p key={i} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4-Pillar Ecosystem Section */}
        <section id="ekosistem" className="py-16 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Ekosistem &amp; Modul Terintegrasi
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Empat pilar digitalisasi desa dalam satu platform.
              </h2>
              <p className="text-sm text-slate-600">
                Dirancang mengikuti alur kerja nyata di kantor desa — mulai dari pencatatan buku administrasi, penerbitan
                surat warga, publikasi infografis APBDes, hingga promosi produk UMKM desa.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {ECOSYSTEM_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                          <Icon className="w-3.5 h-3.5 text-[#0B2A57]" />
                          <span>{pillar.badge}</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                          {pillar.regulation}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                    </div>

                    <ul className="pt-4 border-t border-slate-100 space-y-2">
                      {pillar.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live Village Implementation Showcase (seperti sugihwaras.digitaldesa.id) */}
        <section id="website-desa" className="py-16 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Implementasi Portal Resmi Desa
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Lihat langsung Website Resmi Desa yang berjalan di atas Reneo SIDesa.
                </h2>
                <p className="text-sm text-slate-600">
                  Pilih modul di bawah ini untuk masuk ke portal publik <strong>{village.name}</strong> atau buka
                  Back-Office untuk mengubah datanya secara langsung.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenVillagePortal('beranda')}
                  className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Buka Website {village.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Village Card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-[#0B2A57] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <ReneoSidesaLogo className="w-12 h-12 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold">{village.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-semibold">
                        Status IDM: {indicator.idmStatus} ({indicator.idmScore})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Kecamatan {village.district} · Kabupaten {village.regency} · Provinsi {village.province} ({village.postalCode})
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenVillagePortal('beranda')}
                    className="h-9 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>Masuk Portal Warga</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="h-9 px-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Kelola di Back-Office</span>
                  </button>
                </div>
              </div>

              {/* Live Metrics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-200 border-b border-slate-200 bg-slate-50/50">
                <div className="p-4">
                  <div className="text-[11px] text-slate-500">Populasi &amp; Kepala Keluarga</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {demographics.totalPopulation} Jiwa · {demographics.totalKK} KK
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-slate-500">Pendapatan APBDes {apbdes.year}</div>
                  <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                    {formatRp(apbdes.pendapatan)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-slate-500">Belanja APBDes {apbdes.year}</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatRp(apbdes.belanja)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-slate-500">Skor SDGs Desa &amp; Luas Wilayah</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    SDGs {indicator.sdgsScore} · {village.areaKm2} km²
                  </div>
                </div>
              </div>

              {/* Direct Shortcut Grid to Village Website Sections */}
              <div className="p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pintasan Halaman Website {village.name}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    {
                      tab: 'profil',
                      title: 'Profil & Sejarah Desa',
                      desc: 'Visi-misi, batas geografis & luas wilayah',
                      icon: Building2,
                    },
                    {
                      tab: 'pemerintah',
                      title: 'Pemerintah & SOTK',
                      desc: 'Struktur organisasi & perangkat desa',
                      icon: Users,
                    },
                    {
                      tab: 'infografis',
                      title: 'Infografis & Bansos',
                      desc: 'Demografi, APBDes, Cek Bansos, IDM & SDGs',
                      icon: BarChart3,
                    },
                    {
                      tab: 'layanan',
                      title: 'Layanan Surat Mandiri',
                      desc: 'Ajukan SKTM, Domisili, SKU & lacak status',
                      icon: FileText,
                    },
                    {
                      tab: 'ppid',
                      title: 'PPID, Pengaduan & UMKM',
                      desc: 'Dokumen publik UU KIP & Beli dari Desa',
                      icon: Scale,
                    },
                  ].map((shortcut) => {
                    const Icon = shortcut.icon;
                    return (
                      <button
                        key={shortcut.tab}
                        type="button"
                        onClick={() => onOpenVillagePortal(shortcut.tab)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-colors group flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="w-4 h-4 text-[#0B2A57] group-hover:text-emerald-700" />
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{shortcut.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{shortcut.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="perbandingan" className="py-16 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Perbandingan Cara Kerja
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Sebelum dan sesudah menggunakan Reneo SIDesa.
              </h2>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="py-3.5 px-4 font-bold">Aspek Pelayanan &amp; Administrasi</th>
                    <th className="py-3.5 px-4 font-bold">Cara Manual / Terpisah</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/60">Reneo SIDesa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.aspect}>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.aspect}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.manual}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-medium bg-emerald-50/30">{row.sidesa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Pertanyaan Umum
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Hal yang sering ditanyakan perangkat desa.
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-900 hover:bg-slate-50"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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

      {/* Footer */}
      <footer className="bg-[#0B2A57] text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ReneoSidesaLogo className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">Reneo SIDesa</div>
              <div className="text-xs text-slate-400">
                Platform Sistem Informasi &amp; Pelayanan Publik Desa · Ekosistem Reneo
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => onOpenVillagePortal('beranda')}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Website {village.name}
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
            >
              Back-Office Perangkat Desa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

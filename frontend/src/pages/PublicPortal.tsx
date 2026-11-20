import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Globe,
  HeartHandshake,
  Home,
  Landmark,
  Layers,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Phone,
  Quote,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Trees,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ReneoSidesaLogo } from '../components/ReneoSidesaLogo';

type PublicTab =
  | 'beranda'
  | 'profil'
  | 'pemerintah'
  | 'infografis'
  | 'layanan'
  | 'berita'
  | 'belanja'
  | 'ppid'
  | 'pengaduan'
  | 'peta';

type InfografisSubTab = 'penduduk' | 'apbdes' | 'bansos' | 'indeks';

const NAV_ITEMS: Array<{ id: PublicTab; label: string }> = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'profil', label: 'Profil Desa' },
  { id: 'pemerintah', label: 'Pemerintahan' },
  { id: 'infografis', label: 'Infografis' },
  { id: 'layanan', label: 'Layanan Surat' },
  { id: 'berita', label: 'Berita' },
  { id: 'belanja', label: 'Beli dari Desa' },
  { id: 'ppid', label: 'PPID' },
  { id: 'pengaduan', label: 'Pengaduan' },
  { id: 'peta', label: 'Peta & Potensi' },
];

const JELAJAHI_DESA_CARDS: Array<{
  id: PublicTab;
  infoSub?: InfografisSubTab;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<any>;
  tone: string;
}> = [
  {
    id: 'profil',
    title: 'Profil & Sejarah Desa',
    subtitle: 'Visi-misi, sejarah, dan batas wilayah desa',
    badge: 'Tentang Desa',
    icon: Landmark,
    tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'pemerintah',
    title: 'Pemerintahan (SOTK)',
    subtitle: 'Struktur organisasi & perangkat desa',
    badge: 'Aparatur',
    icon: UserCheck,
    tone: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'infografis',
    infoSub: 'penduduk',
    title: 'Administrasi Penduduk',
    subtitle: 'Demografi warga, KK, dusun, & pekerjaan',
    badge: 'Demografi',
    icon: Users,
    tone: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'infografis',
    infoSub: 'apbdes',
    title: 'Transparansi APBDes',
    subtitle: 'Realisasi pendapatan & belanja desa',
    badge: 'Keuangan',
    icon: Wallet,
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'infografis',
    infoSub: 'bansos',
    title: 'Cek Penerima Bansos',
    subtitle: 'Pencarian penerima BLT-DD, PKH & BPNT',
    badge: 'Bantuan Sosial',
    icon: HeartHandshake,
    tone: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    id: 'layanan',
    title: 'Layanan Surat Mandiri',
    subtitle: 'Ajukan SKTM, Domisili, SKU & lacak surat',
    badge: 'Permendagri 109',
    icon: FileText,
    tone: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'belanja',
    title: 'Beli Dari Desa (UMKM)',
    subtitle: 'Katalog produk unggulan warga desa',
    badge: 'Ekonomi Lokal',
    icon: ShoppingBag,
    tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'ppid',
    title: 'Portal PPID & UU KIP',
    subtitle: 'Dokumen publik berkala & permohonan info',
    badge: 'Transparansi',
    icon: Scale,
    tone: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];

const VILLAGE_POTENTIALS = [
  {
    category: 'Pertanian & Pangan',
    title: 'Lumbung Padi & Palawija Irigasi Teknis',
    description:
      'Hamparan lahan sawah produktif dengan jaringan irigasi jalan usaha tani yang menghasilkan panen padi kualitas premium dan jagung hibrida.',
    metric: '420 Ha Lahan Produktif',
    dusun: 'Dusun Krajan & Dusun Sugihwaras',
    icon: Sprout,
  },
  {
    category: 'UMKM & Olahan Pangan',
    title: 'Sentra Kuliner Tradisional & Keripik Desa',
    description:
      'Kelompok usaha ibu-ibu PKK dan pemuda desa yang mengolah hasil pertanian menjadi camilan kemasan, beras organik, dan produk rumah tangga.',
    metric: '38 Pelaku UMKM Aktif',
    dusun: 'Seluruh Dusun',
    icon: ShoppingBag,
  },
  {
    category: 'Wisata & Lingkungan',
    title: 'Embung Desa & Kawasan Hijau Terpadu',
    description:
      'Kawasan konservasi air desa yang berfungsi sebagai cadangan pengairan musim kemarau sekaligus ruang terbuka rekreasi keluarga warga.',
    metric: 'Destinasi Edukasi & Rekreasi',
    dusun: 'Dusun Sidomulyo',
    icon: Trees,
  },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

function calcPercent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((Number(part || 0) / Number(total)) * 100));
}

function getInitials(name: string): string {
  return String(name || 'PD')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

export const PublicPortal: React.FC<{
  onOpenAdmin: () => void;
  onBackToPlatform?: () => void;
  initialTab?: string;
}> = ({ onOpenAdmin, onBackToPlatform, initialTab }) => {
  const [tab, setTab] = useState<PublicTab>(() => {
    const valid = NAV_ITEMS.some((i) => i.id === initialTab);
    return valid ? (initialTab as PublicTab) : 'beranda';
  });
  const [infoSub, setInfoSub] = useState<InfografisSubTab>('penduduk');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [heroNewsIdx, setHeroNewsIdx] = useState(0);
  const [poiFilter, setPoiFilter] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [ppidDocs, setPpidDocs] = useState<any[]>([]);
  const [ppidCat, setPpidCat] = useState<string>('');
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  // Cek Bansos
  const [bansosQuery, setBansosQuery] = useState('');
  const [bansosResults, setBansosResults] = useState<any[] | null>(null);
  const [bansosLoading, setBansosLoading] = useState(false);

  // Pengajuan & Lacak Surat
  const [letterForm, setLetterForm] = useState({
    letterType: 'SKTM',
    applicantNik: '',
    applicantName: '',
    applicantPhone: '',
    purpose: '',
    notes: '',
  });
  const [letterSubmitting, setLetterSubmitting] = useState(false);
  const [letterCreated, setLetterCreated] = useState<any | null>(null);
  const [letterTrackCode, setLetterTrackCode] = useState('');
  const [letterTrackResult, setLetterTrackResult] = useState<any | null>(null);
  const [letterTrackErr, setLetterTrackErr] = useState<string | null>(null);

  // Pengaduan & Lacak
  const [complaintForm, setComplaintForm] = useState({
    reporterName: '',
    reporterPhone: '',
    category: 'Infrastruktur',
    location: '',
    description: '',
  });
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintCreated, setComplaintCreated] = useState<any | null>(null);
  const [complaintTrackCode, setComplaintTrackCode] = useState('');
  const [complaintTrackResult, setComplaintTrackResult] = useState<any | null>(null);
  const [complaintTrackErr, setComplaintTrackErr] = useState<string | null>(null);

  // Permohonan PPID
  const [ppidForm, setPpidForm] = useState({
    requesterName: '',
    requesterNik: '',
    requesterPhone: '',
    requesterEmail: '',
    informationNeeded: '',
    purpose: '',
  });
  const [ppidSubmitting, setPpidSubmitting] = useState(false);
  const [ppidCreated, setPpidCreated] = useState<any | null>(null);

  useEffect(() => {
    if (initialTab && NAV_ITEMS.some((i) => i.id === initialTab)) {
      setTab(initialTab as PublicTab);
    }
  }, [initialTab]);

  const loadBootstrap = async () => {
    try {
      setLoading(true);
      setError(null);
      const [villageData, docs] = await Promise.all([api.getPublicVillage(), api.getPublicPpid()]);
      setData(villageData);
      setPpidDocs(docs || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Gagal memuat data portal desa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBootstrap();
  }, []);

  const handleCheckBansos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bansosQuery.trim().length < 3) return;
    setBansosLoading(true);
    try {
      const res = await api.checkBansos(bansosQuery.trim());
      setBansosResults(res);
    } catch {
      setBansosResults([]);
    } finally {
      setBansosLoading(false);
    }
  };

  const handleSubmitLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLetterSubmitting(true);
    try {
      const res = await api.submitLetterRequest(letterForm);
      setLetterCreated(res);
      setLetterForm({
        letterType: 'SKTM',
        applicantNik: '',
        applicantName: '',
        applicantPhone: '',
        purpose: '',
        notes: '',
      });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal mengajukan surat.');
    } finally {
      setLetterSubmitting(false);
    }
  };

  const handleTrackLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterTrackCode.trim()) return;
    setLetterTrackErr(null);
    setLetterTrackResult(null);
    try {
      const res = await api.trackLetter(letterTrackCode.trim());
      setLetterTrackResult(res);
    } catch (err: any) {
      setLetterTrackErr(err?.response?.data?.error || 'Kode surat tidak ditemukan.');
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSubmitting(true);
    try {
      const res = await api.submitComplaint(complaintForm);
      setComplaintCreated(res);
      setComplaintForm({
        reporterName: '',
        reporterPhone: '',
        category: 'Infrastruktur',
        location: '',
        description: '',
      });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal mengirim pengaduan.');
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const handleTrackComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTrackCode.trim()) return;
    setComplaintTrackErr(null);
    setComplaintTrackResult(null);
    try {
      const res = await api.trackComplaint(complaintTrackCode.trim());
      setComplaintTrackResult(res);
    } catch (err: any) {
      setComplaintTrackErr(err?.response?.data?.error || 'Tiket pengaduan tidak ditemukan.');
    }
  };

  const handleSubmitPpid = async (e: React.FormEvent) => {
    e.preventDefault();
    setPpidSubmitting(true);
    try {
      const res = await api.submitPpidRequest(ppidForm);
      setPpidCreated(res);
      setPpidForm({
        requesterName: '',
        requesterNik: '',
        requesterPhone: '',
        requesterEmail: '',
        informationNeeded: '',
        purpose: '',
      });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal mengirim permohonan PPID.');
    } finally {
      setPpidSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        <div className="flex items-center gap-3">
          <ReneoSidesaLogo className="w-8 h-8 animate-pulse" />
          <span>Memuat Website Resmi Pemerintah Desa...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-center">
          <p className="text-sm font-semibold text-rose-700">{error || 'Data desa belum tersedia'}</p>
          <button
            type="button"
            onClick={() => void loadBootstrap()}
            className="h-10 px-4 rounded-lg bg-emerald-700 text-white text-sm font-semibold"
          >
            Muat Ulang Portal
          </button>
        </div>
      </div>
    );
  }

  const { village, officials, demographics, apbdes, indicator, latestNews, umkm, places, letterTypes } = data;
  const filteredPpid = ppidCat ? ppidDocs.filter((d) => d.category === ppidCat) : ppidDocs;
  const activeHeroNews = latestNews && latestNews.length > 0 ? latestNews[heroNewsIdx % latestNews.length] : null;
  const pendapatanPct = calcPercent(apbdes.pendapatan?.realized, apbdes.pendapatan?.budget);
  const belanjaPct = calcPercent(apbdes.belanja?.realized, apbdes.belanja?.budget);
  const filteredPlaces =
    poiFilter === 'ALL' ? places : places.filter((p: any) => String(p.kind || '').toUpperCase() === poiFilter);
  const missionList = String(village.mission || '')
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);

  const navigateTab = (nextTab: PublicTab, sub?: InfografisSubTab) => {
    setTab(nextTab);
    if (sub) setInfoSub(sub);
    setSelectedNews(null);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Official Civic Attribution Bar */}
      <div className="bg-[#0B2A57] text-slate-200 text-[11px] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-white">
              PEMERINTAH KAB. {String(village.regency || 'BOJONEGORO').toUpperCase()} · KEC.{' '}
              {String(village.district || 'KEPOHBARU').toUpperCase()}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="font-mono text-emerald-300">Kode Kemendagri: {village.kodeDesa || '35.22.08.2005'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Pelayanan Balai Desa: Senin–Jumat 08.00–15.00 WIB</span>
            </span>
            {village.phone && (
              <span className="hidden md:inline-flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{village.phone}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Portal Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateTab('beranda')}
            className="flex items-center gap-3 text-left min-w-0"
          >
            <ReneoSidesaLogo className="w-10 h-10 shrink-0" />
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  Pemerintah {village.name}
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Portal Resmi
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Kecamatan {village.district} · Kabupaten {village.regency}, {village.province}
              </div>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTab(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === item.id
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToPlatform && (
              <button
                type="button"
                onClick={onBackToPlatform}
                title="Kembali ke Beranda Platform SaaS Reneo SIDesa"
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>&larr;</span>
                <span className="hidden sm:inline">Platform SIDesa</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-9 px-3.5 rounded-lg bg-[#0B2A57] hover:bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perangkat Desa</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label="Menu navigasi"
              className="xl:hidden h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700"
            >
              {mobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTab(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-left ${
                  tab === item.id ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Sub-Page Breadcrumb Banner for Non-Beranda Tabs */}
      {tab !== 'beranda' && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => navigateTab('beranda')}
                className="hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda {village.name}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">
                {NAV_ITEMS.find((i) => i.id === tab)?.label || 'Halaman'}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Kec. {village.district} · Kab. {village.regency} · Kode Pos{' '}
              <span className="font-mono font-semibold text-slate-700">{village.postalCode}</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
        {/* =========================================================
            TAB 1: BERANDA WEBSITE RESMI DESA (seperti sugihwaras.digitaldesa.id)
           ========================================================= */}
        {tab === 'beranda' && (
          <>
            {/* 1. Hero Banner Desa + Sorotan Berita Utama */}
            <section className="relative rounded-2xl bg-[#0B2A57] text-white overflow-hidden border border-slate-800">
              {/* Subtle SVG Village Landscape Silhouette Background */}
              <svg
                className="absolute inset-x-0 bottom-0 w-full h-36 opacity-15 pointer-events-none"
                viewBox="0 0 1200 180"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 130 C240 60 440 150 720 85 C920 40 1080 95 1200 70 L1200 180 L0 180 Z"
                  fill="#10B981"
                />
                <path
                  d="M0 155 C320 110 640 170 940 120 C1060 100 1140 125 1200 115 L1200 180 L0 180 Z"
                  fill="#34D399"
                />
              </svg>

              <div className="relative p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Welcome & Quick Citizen Service */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                      Website Resmi Pemerintah {village.name}
                    </span>
                    {indicator && (
                      <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-mono">
                        IDM {indicator.year}: <strong className="text-white">{indicator.idmStatus}</strong> ({indicator.idmScore})
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                    Selamat Datang di Portal Informasi &amp; Pelayanan Warga {village.name}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                    Media transparansi anggaran APBDes, pelayanan persuratan mandiri, data kependudukan, keterbukaan
                    informasi publik (PPID), serta promosi produk UMKM masyarakat Kecamatan {village.district},
                    Kabupaten {village.regency}.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => navigateTab('layanan')}
                      className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold inline-flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ajukan Surat Mandiri</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTab('infografis', 'bansos')}
                      className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                    >
                      <HeartHandshake className="w-4 h-4 text-emerald-300" />
                      <span>Cek Penerima Bansos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTab('pengaduan')}
                      className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                    >
                      <MessageSquareWarning className="w-4 h-4 text-amber-300" />
                      <span>Pengaduan Warga</span>
                    </button>
                  </div>
                </div>

                {/* Right Featured News Slider Card */}
                <div className="lg:col-span-5">
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Kabari Warga · Sorotan Desa</span>
                      </span>
                      {latestNews && latestNews.length > 1 && (
                        <div className="flex items-center gap-1">
                          {latestNews.map((_: any, i: number) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setHeroNewsIdx(i)}
                              aria-label={`Berita ${i + 1}`}
                              className={`h-2 rounded-full transition-all ${
                                i === heroNewsIdx % latestNews.length ? 'w-5 bg-emerald-400' : 'w-2 bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {activeHeroNews ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-semibold">
                            {activeHeroNews.category}
                          </span>
                          <span>{new Date(activeHeroNews.publishedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {activeHeroNews.title}
                        </h2>
                        <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                          {activeHeroNews.excerpt}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300">Oleh: {activeHeroNews.authorName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNews(activeHeroNews);
                              setTab('berita');
                            }}
                            className="text-xs font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
                          >
                            <span>Baca Selengkapnya</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300">Belum ada berita terbaru yang dipublikasikan.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Menu Cepat "Jelajahi Desa" (8 Modul Utama seperti sugihwaras.digitaldesa.id) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Akses Cepat Layanan &amp; Informasi
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Jelajahi {village.name}</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Pilih menu di bawah ini untuk melihat data publik atau mengajukan layanan warga secara online.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {JELAJAHI_DESA_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => navigateTab(card.id, card.infoSub)}
                      className="bg-white border border-slate-200 hover:border-emerald-600 rounded-xl p-4 text-left transition-colors group flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.tone}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800">
                          {card.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 flex items-center justify-between gap-1">
                          <span>{card.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{card.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Sambutan Kepala Desa & Visi Misi Singkat */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Official Portrait / Crest Card */}
              <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-[#0B2A57] text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-sm border-4 border-emerald-500/20">
                  {getInitials(village.headName)}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    {village.headTitle || 'Kepala Desa'} {village.name}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">{village.headName || '-'}</h3>
                  <p className="text-xs text-slate-500">
                    Pemerintah {village.name} · Kec. {village.district}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 text-left space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{village.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Luas Wilayah Desa</span>
                    <span className="font-mono font-bold text-slate-900">{village.areaKm2} km²</span>
                  </div>
                </div>
              </div>

              {/* Right Editorial Greeting & Vision */}
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <Quote className="w-4 h-4" />
                  <span>Sambutan {village.headTitle || 'Kepala Desa'}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-snug">
                  Mewujudkan Tata Kelola Pemerintahan {village.name} yang Terbuka, Cepat, dan Melayani
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">{village.headGreeting}</p>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Visi Pemerintah {village.name}
                  </div>
                  <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                    &ldquo;{village.vision}&rdquo;
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTab('profil')}
                    className="h-10 px-4 rounded-xl bg-[#0B2A57] hover:bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca Sejarah &amp; Visi-Misi Lengkap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTab('pemerintah')}
                    className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lihat Struktur Perangkat Desa (SOTK)</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 4. Ringkasan Administrasi Penduduk & Transparansi APBDes */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Administrasi Penduduk */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Data Kependudukan
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Ringkasan Administrasi Penduduk</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTab('infografis', 'penduduk')}
                      className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Detail Demografi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Total Penduduk</div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                        {demographics.totalResidents.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Jiwa Terdata</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Kepala Keluarga</div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                        {demographics.totalHouseholds.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500">Kartu Keluarga</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Laki-Laki</div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                        {demographics.male.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {calcPercent(demographics.male, demographics.totalResidents)}% Warga
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] text-slate-500">Perempuan</div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                        {demographics.female.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {calcPercent(demographics.female, demographics.totalResidents)}% Warga
                      </div>
                    </div>
                  </div>

                  {/* Distribusi per Dusun */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-700">Sebaran Penduduk per Wilayah Dusun</div>
                    {(demographics.byDusun || []).map((d: any) => {
                      const pct = calcPercent(d.total, demographics.totalResidents);
                      return (
                        <div key={d.label} className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-slate-700">{d.label}</span>
                            <span className="font-mono font-semibold text-slate-900">
                              {d.total} Jiwa ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(8, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Wajib Pilih (KTP-el): <strong className="font-mono text-slate-800">{demographics.voters} Jiwa</strong></span>
                  <span>Sumber: Buku Induk Penduduk</span>
                </div>
              </div>

              {/* Right: Transparansi APBDes */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Keuangan Desa · TA {apbdes.fiscalYear}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Transparansi Realisasi APBDes</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTab('infografis', 'apbdes')}
                      className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Rincian APBDes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Pendapatan & Belanja Progress Cards */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950">Pendapatan Desa</span>
                        <span className="font-mono font-bold text-emerald-800">{pendapatanPct}% Terealisasi</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[11px] text-slate-500">Target Anggaran</div>
                          <div className="font-mono font-bold text-slate-900">{formatRp(apbdes.pendapatan?.budget)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Realisasi Masuk</div>
                          <div className="font-mono font-bold text-emerald-700">{formatRp(apbdes.pendapatan?.realized)}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pendapatanPct}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">Belanja Desa (Pembangunan &amp; Pemberdayaan)</span>
                        <span className="font-mono font-bold text-slate-700">{belanjaPct}% Terserap</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[11px] text-slate-500">Pagu Anggaran</div>
                          <div className="font-mono font-bold text-slate-900">{formatRp(apbdes.belanja?.budget)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Realisasi Belanja</div>
                          <div className="font-mono font-bold text-[#0B2A57]">{formatRp(apbdes.belanja?.realized)}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0B2A57] rounded-full" style={{ width: `${belanjaPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Surplus / Sisa Lebih Pembiayaan:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatRp(apbdes.surplusDeficit)}</span>
                </div>
              </div>
            </section>

            {/* 5. Aparatur Pemerintah Desa (SOTK Strip) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Struktur Organisasi &amp; Tata Kerja
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Aparatur Pemerintah {village.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTab('pemerintah')}
                  className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Seluruh Perangkat ({officials.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {officials.slice(0, 4).map((o: any) => (
                  <div
                    key={o.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0B2A57] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {getInitials(o.name)}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {o.position}
                      </span>
                      <div className="text-sm font-bold text-slate-900 truncate mt-1">{o.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {o.nip ? `NIP. ${o.nip}` : 'Perangkat Desa Aktif'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Berita Kegiatan & Lapak UMKM "Beli Dari Desa" */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Berita Desa */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Kabar &amp; Publikasi
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Berita Kegiatan {village.name}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTab('berita')}
                    className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Semua Berita</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {latestNews.map((n: any) => (
                    <article
                      key={n.id}
                      onClick={() => {
                        setSelectedNews(n);
                        setTab('berita');
                      }}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 cursor-pointer transition-colors space-y-2 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {n.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(n.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span>· Oleh {n.authorName}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">{n.excerpt}</p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Beli Dari Desa (UMKM) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Produk Ekonomi Warga
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Beli Dari Desa (UMKM)</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTab('belanja')}
                    className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Katalog Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {umkm.slice(0, 4).map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">· {item.sellerName}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 truncate mt-0.5">{item.name}</div>
                          <div className="text-xs font-extrabold font-mono text-emerald-700 mt-0.5">
                            {formatRp(item.price)} <span className="font-normal text-slate-500">/ {item.unit}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Halo ${item.sellerName}, saya ingin memesan ${item.name} dari Portal Resmi ${village.name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center shrink-0"
                      >
                        Pesan WA
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Potensi Unggulan & Peta Wilayah Desa (WebGIS Preview) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Potensi Wilayah &amp; WebGIS Desa
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Potensi Unggulan &amp; Peta Lokasi {village.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTab('peta')}
                  className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Peta &amp; Semua Titik Lokasi ({places.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {VILLAGE_POTENTIALS.map((pot) => {
                  const Icon = pot.icon;
                  return (
                    <div key={pot.title} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{pot.category}</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-600">{pot.metric}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{pot.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{pot.description}</p>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lokasi: {pot.dusun}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* =========================================================
            TAB 2: PROFIL DESA (Visi-Misi, Sejarah, Bagan & Geografis)
           ========================================================= */}
        {tab === 'profil' && (
          <section className="space-y-6">
            <div className="bg-[#0B2A57] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                  Profil Resmi Pemerintahan Desa
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Kecamatan {village.district}, Kabupaten {village.regency}, Provinsi {village.province} · Kode Wilayah{' '}
                  <span className="font-mono text-white">{village.kodeDesa || '35.22.08.2005'}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Luas Wilayah</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">{village.areaKm2} km²</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Jumlah Penduduk</div>
                  <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                    {demographics.totalResidents} Jiwa
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                {/* Visi & Misi */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Arah Pembangunan Desa
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Visi &amp; Misi {village.name}</h2>
                  </div>

                  <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Visi Desa</div>
                    <p className="text-base font-bold text-emerald-950 leading-relaxed">&ldquo;{village.vision}&rdquo;</p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Misi Pembangunan Desa</div>
                    <div className="space-y-2">
                      {missionList.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700"
                        >
                          <span className="w-6 h-6 rounded-lg bg-[#0B2A57] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sejarah Desa */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Asal-Usul Wilayah</div>
                  <h2 className="text-lg font-bold text-slate-900">Sejarah {village.name}</h2>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{village.history}</p>
                </div>
              </div>

              {/* Geografis & Batas Wilayah */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-base font-bold text-slate-900">Geografis &amp; Batas Wilayah</h2>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Kode Kemendagri</span>
                      <span className="font-mono font-bold text-slate-900">{village.kodeDesa || '35.22.08.2005'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Luas Wilayah</span>
                      <span className="font-mono font-bold text-slate-900">{village.areaKm2} km²</span>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Batas Sebelah Utara</span>
                      <span className="font-semibold text-slate-900">{village.boundaries?.north || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Batas Sebelah Timur</span>
                      <span className="font-semibold text-slate-900">{village.boundaries?.east || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Batas Sebelah Selatan</span>
                      <span className="font-semibold text-slate-900">{village.boundaries?.south || '-'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between gap-2">
                      <span className="text-slate-500">Batas Sebelah Barat</span>
                      <span className="font-semibold text-slate-900">{village.boundaries?.west || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Wilayah Dusun */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">Pembagian Wilayah Dusun</h3>
                  <div className="space-y-2 text-xs">
                    {(demographics.byDusun || []).map((d: any) => (
                      <div
                        key={d.label}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{d.label}</span>
                        <span className="font-mono font-bold text-emerald-700">{d.total} Jiwa</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 3: PEMERINTAHAN (SOTK)
           ========================================================= */}
        {tab === 'pemerintah' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Susunan Organisasi &amp; Tata Kerja (SOTK)
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Aparatur Pemerintah {village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Pelaksana pemerintahan, pelayanan administrasi masyarakat, dan pembinaan wilayah dusun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTab('layanan')}
                className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-2 shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Ajukan Pelayanan Surat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officials.map((o: any, idx: number) => (
                <div
                  key={o.id}
                  className={`bg-white border rounded-2xl p-5 flex items-start gap-4 ${
                    idx === 0 ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl font-extrabold text-base flex items-center justify-center shrink-0 ${
                      idx === 0 ? 'bg-emerald-700 text-white' : 'bg-[#0B2A57] text-white'
                    }`}
                  >
                    {getInitials(o.name)}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      {o.position}
                    </span>
                    <div className="text-base font-bold text-slate-900">{o.name}</div>
                    <div className="text-xs font-mono text-slate-500">
                      {o.nip ? `NIP/NIAP: ${o.nip}` : 'Aparatur Pemerintah Desa'}
                    </div>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Aktif Melayani di Balai Desa</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 4: INFOGRAFIS (Penduduk, APBDes, Bansos, Indeks Desa)
           ========================================================= */}
        {tab === 'infografis' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Transparansi &amp; Statistik Desa
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Infografis {village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Data demografi penduduk, realisasi APBDes, pencarian penerima Bansos, serta skor IDM &amp; SDGs Desa.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['penduduk', 'Demografi Penduduk'],
                    ['apbdes', 'Keuangan APBDes'],
                    ['bansos', 'Bansos & Cek NIK'],
                    ['indeks', 'IDM, Stunting & SDGs'],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setInfoSub(k)}
                    className={`h-9 px-3.5 rounded-lg text-xs font-semibold border transition-colors ${
                      infoSub === k
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {infoSub === 'penduduk' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    ['Total Penduduk', `${demographics.totalResidents} Jiwa`],
                    ['Kepala Keluarga', `${demographics.totalHouseholds} KK`],
                    ['Laki-laki', `${demographics.male} Jiwa`],
                    ['Perempuan', `${demographics.female} Jiwa`],
                    ['Wajib Pilih', `${demographics.voters} Jiwa`],
                  ].map(([lbl, val]) => (
                    <div key={String(lbl)} className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500">{lbl}</div>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ['Sebaran Wilayah Dusun', demographics.byDusun],
                    ['Tingkat Pendidikan', demographics.byEducation],
                    ['Mata Pencaharian Warga', demographics.byOccupation],
                  ].map(([title, list]: any) => (
                    <div key={title} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                      <div className="space-y-2.5 text-xs">
                        {list.map((row: any) => {
                          const pct = calcPercent(row.total, demographics.totalResidents);
                          return (
                            <div key={row.label} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">{row.label}</span>
                                <span className="font-mono font-semibold text-slate-900">
                                  {row.total} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full"
                                  style={{ width: `${Math.max(6, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoSub === 'apbdes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <div className="text-xs text-slate-500">Total Pendapatan ({apbdes.fiscalYear})</div>
                    <div className="text-xl font-extrabold font-mono text-emerald-700">
                      {formatRp(apbdes.pendapatan.budget)}
                    </div>
                    <div className="text-xs text-slate-600">
                      Realisasi: <strong className="font-mono">{formatRp(apbdes.pendapatan.realized)}</strong> ({pendapatanPct}%)
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <div className="text-xs text-slate-500">Total Belanja ({apbdes.fiscalYear})</div>
                    <div className="text-xl font-extrabold font-mono text-slate-900">
                      {formatRp(apbdes.belanja.budget)}
                    </div>
                    <div className="text-xs text-slate-600">
                      Realisasi: <strong className="font-mono">{formatRp(apbdes.belanja.realized)}</strong> ({belanjaPct}%)
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <div className="text-xs text-slate-500">Surplus / Defisit Realisasi</div>
                    <div className="text-xl font-extrabold font-mono text-emerald-700">
                      {formatRp(apbdes.surplusDeficit)}
                    </div>
                    <div className="text-xs text-slate-500">Selisih Realisasi Pendapatan &amp; Belanja</div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="py-3 px-4 font-bold">Kategori</th>
                        <th className="py-3 px-4 font-bold">Bidang &amp; Uraian Kegiatan</th>
                        <th className="py-3 px-4 text-right font-bold">Anggaran</th>
                        <th className="py-3 px-4 text-right font-bold">Realisasi</th>
                        <th className="py-3 px-4 text-right font-bold">Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...apbdes.pendapatan.items, ...apbdes.belanja.items, ...apbdes.pembiayaan.items].map((item: any) => {
                        const pct = calcPercent(item.realizedAmount, item.budgetAmount);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  item.category === 'PENDAPATAN'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-blue-50 text-blue-800'
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{item.label}</div>
                              <div className="text-[11px] text-slate-500">{item.subCategory}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono">{formatRp(item.budgetAmount)}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                              {formatRp(item.realizedAmount)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {infoSub === 'bansos' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pencarian Penerima Bantuan Sosial (Bansos)</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Masukkan NIK atau Nama Lengkap warga untuk memeriksa kepesertaan program BLT Dana Desa, PKH, atau BPNT.
                  </p>
                </div>
                <form onSubmit={handleCheckBansos} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={bansosQuery}
                    onChange={(e) => setBansosQuery(e.target.value)}
                    placeholder="Contoh: 3522 atau Siti Aminah..."
                    className="flex-1 h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                  <button
                    type="submit"
                    disabled={bansosLoading}
                    className="h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{bansosLoading ? 'Memeriksa...' : 'Cek Penerima Bansos'}</span>
                  </button>
                </form>
                {bansosResults &&
                  (bansosResults.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Tidak ditemukan data penerima bantuan sosial untuk kata kunci <strong>{bansosQuery}</strong>.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                      {bansosResults.map((b) => (
                        <div key={b.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-xs bg-white">
                          <div>
                            <div className="text-sm font-bold text-slate-900">{b.fullName}</div>
                            <div className="font-mono text-slate-500">
                              NIK: {b.maskedNik} · Wilayah: {b.dusun}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                              {b.program} · {b.status}
                            </span>
                            <div className="text-[11px] font-mono text-slate-600 mt-1">
                              {b.period} · {formatRp(b.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}

            {infoSub === 'indeks' && indicator && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Indeks Desa Membangun ({indicator.year})
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-slate-900">{indicator.idmScore}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-bold">
                      {indicator.idmStatus}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    {(indicator.dimensions || []).map((d: any) => (
                      <div key={d.name} className="flex justify-between">
                        <span className="text-slate-600">{d.name}</span>
                        <span className="font-mono font-bold text-slate-900">{d.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Skor SDGs Desa</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{indicator.sdgsScore}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Rata-rata capaian 18 tujuan pembangunan berkelanjutan tingkat desa (Desa Tanpa Kemiskinan, Desa
                    Peduli Kesehatan, dan Infrastruktur Desa).
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Pemantauan Posyandu &amp; Stunting
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{indicator.stuntingCases} Kasus</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prevalensi tercatat: <strong className="font-mono">{indicator.stuntingRate}%</strong> · Didampingi
                    melalui program Pemberian Makanan Tambahan (PMT) Posyandu Desa.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            TAB 5: LAYANAN SURAT MANDIRI
           ========================================================= */}
        {tab === 'layanan' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Pelayanan Administrasi Terpadu
                </div>
                <h1 className="text-xl font-bold text-slate-900">Pengajuan Surat Mandiri (Permendagri 109/2019)</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi formulir permohonan di bawah ini. Perangkat desa akan memverifikasi data NIK Anda dan menerbitkan
                  surat resmi siap cetak di Balai Desa.
                </p>
              </div>
              {letterCreated && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Permohonan Surat Berhasil Diterima Sistem</span>
                  </div>
                  <div>
                    Simpan Kode Pelacakan Anda:{' '}
                    <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {letterCreated.trackingCode}
                    </strong>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmitLetter} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Format Surat</label>
                  <select
                    value={letterForm.letterType}
                    onChange={(e) => setLetterForm({ ...letterForm, letterType: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {letterTypes.map((lt: any) => (
                      <option key={lt.code} value={lt.code}>
                        {lt.label} ({lt.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIK Pemohon (16 Digit) *</label>
                    <input
                      type="text"
                      required
                      value={letterForm.applicantNik}
                      onChange={(e) => setLetterForm({ ...letterForm, applicantNik: e.target.value })}
                      placeholder="352213..."
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Sesuai KTP *</label>
                    <input
                      type="text"
                      required
                      value={letterForm.applicantName}
                      onChange={(e) => setLetterForm({ ...letterForm, applicantName: e.target.value })}
                      placeholder="Nama Lengkap"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif (Untuk Notifikasi) *</label>
                  <input
                    type="tel"
                    required
                    value={letterForm.applicantPhone}
                    onChange={(e) => setLetterForm({ ...letterForm, applicantPhone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keperluan Pengajuan Surat *</label>
                  <textarea
                    rows={3}
                    required
                    value={letterForm.purpose}
                    onChange={(e) => setLetterForm({ ...letterForm, purpose: e.target.value })}
                    placeholder="Contoh: Persyaratan pengajuan beasiswa sekolah / kredit usaha mikro..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={letterSubmitting}
                  className="h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
                >
                  {letterSubmitting ? 'Mengirim Permohonan...' : 'Kirim Permohonan Surat'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">Lacak Status Permohonan Surat</h2>
                <p className="text-xs text-slate-500">
                  Masukkan kode lacak (mis. <span className="font-mono">SRT-2611-XXXXXX</span>) untuk melihat progres
                  verifikasi surat Anda.
                </p>
                <form onSubmit={handleTrackLetter} className="flex gap-2">
                  <input
                    type="text"
                    value={letterTrackCode}
                    onChange={(e) => setLetterTrackCode(e.target.value)}
                    placeholder="SRT-2611-XXXXXX"
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-lg bg-[#0B2A57] hover:bg-slate-900 text-white text-xs font-semibold"
                  >
                    Cek Status
                  </button>
                </form>
                {letterTrackErr && <div className="text-xs text-rose-700">{letterTrackErr}</div>}
                {letterTrackResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">{letterTrackResult.applicantName}</div>
                    <div>
                      Jenis Surat: <strong>{letterTrackResult.letterType}</strong>
                    </div>
                    <div>
                      Status:{' '}
                      <span className="font-mono font-bold text-emerald-700">{letterTrackResult.status}</span>
                    </div>
                    {letterTrackResult.letterNumber && (
                      <div>
                        Nomor Surat Resmi: <span className="font-mono font-bold">{letterTrackResult.letterNumber}</span>
                      </div>
                    )}
                    {letterTrackResult.adminNotes && (
                      <div className="text-slate-600">Catatan Perangkat: {letterTrackResult.adminNotes}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-[#0B2A57] text-white rounded-2xl p-5 space-y-2 text-xs">
                <div className="font-bold text-emerald-300">Alur Pelayanan Cepat Balai Desa</div>
                <ol className="space-y-1.5 text-slate-200 list-decimal list-inside">
                  <li>Warga mengisi form permohonan surat &amp; menerima Kode Lacak.</li>
                  <li>Kasi Pelayanan memverifikasi NIK dan menerbitkan Nomor Surat.</li>
                  <li>Warga menerima notifikasi WhatsApp &amp; mengambil surat tercetak di Balai Desa.</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 6: BERITA & KEGIATAN DESA
           ========================================================= */}
        {tab === 'berita' && (
          <section className="space-y-5">
            {selectedNews ? (
              <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 max-w-3xl">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  &larr; Kembali ke Daftar Berita Desa
                </button>
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    {selectedNews.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{selectedNews.title}</h1>
                  <div className="text-xs text-slate-500">
                    Dipublikasikan pada {new Date(selectedNews.publishedAt).toLocaleDateString('id-ID')} · Oleh{' '}
                    {selectedNews.authorName}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedNews.content}
                </div>
              </article>
            ) : (
              <>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Kabar Pemerintahan &amp; Warga
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Berita &amp; Kegiatan {village.name}</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestNews.map((n: any) => (
                    <article
                      key={n.id}
                      onClick={() => setSelectedNews(n)}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 cursor-pointer space-y-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {n.category}
                        </span>
                        <span>{new Date(n.publishedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">{n.title}</h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{n.excerpt}</p>
                      <div className="pt-1 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                        <span>Baca Artikel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* =========================================================
            TAB 7: BELI DARI DESA (UMKM)
           ========================================================= */}
        {tab === 'belanja' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Katalog Produk Lokal Warga
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Beli Dari Desa — Lapak UMKM {village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Pesan langsung produk pertanian, kuliner, dan olahan UMKM warga tanpa perantara.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                {umkm.length} Produk UMKM Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {umkm.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500">Penjual: {item.sellerName}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 text-base font-extrabold font-mono text-emerald-700">
                      {formatRp(item.price)} <span className="text-xs font-normal text-slate-500">/ {item.unit}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Halo ${item.sellerName}, saya ingin memesan ${item.name} dari Portal ${village.name}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Hubungi Penjual via WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 8: PPID (UU KIP)
           ========================================================= */}
        {tab === 'ppid' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Keterbukaan Informasi Publik (UU No. 14 Tahun 2008)
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Portal PPID {village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Pejabat Pengelola Informasi dan Dokumentasi Desa menyediakan akses dokumen Informasi Berkala,
                  Serta-Merta, dan Setiap Saat bagi masyarakat.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    ['', 'Semua Dokumen'],
                    ['BERKALA', 'Informasi Berkala'],
                    ['SERTA_MERTA', 'Serta-Merta'],
                    ['SETIAP_SAAT', 'Setiap Saat'],
                    ['DASAR_HUKUM', 'Dasar Hukum'],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPpidCat(val)}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold border ${
                        ppidCat === val
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredPpid.map((doc) => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                        {doc.category}
                      </span>
                      <span className="font-mono text-slate-500">{doc.documentNumber || `Tahun ${doc.year}`}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{doc.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-3.5 h-fit text-xs">
              <h2 className="text-base font-bold text-slate-900">Formulir Permohonan Informasi Publik</h2>
              <p className="text-slate-500">
                Ajukan permohonan dokumen atau data publik yang belum tercantum di daftar dokumen PPID.
              </p>
              {ppidCreated && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  Permohonan tercatat! Nomor Tiket PPID: <strong className="font-mono">{ppidCreated.ticketCode}</strong>
                </div>
              )}
              <form onSubmit={handleSubmitPpid} className="space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Pemohon *"
                  value={ppidForm.requesterName}
                  onChange={(e) => setPpidForm({ ...ppidForm, requesterName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="NIK Pemohon *"
                  value={ppidForm.requesterNik}
                  onChange={(e) => setPpidForm({ ...ppidForm, requesterNik: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                />
                <input
                  type="tel"
                  required
                  placeholder="Nomor WhatsApp Aktif *"
                  value={ppidForm.requesterPhone}
                  onChange={(e) => setPpidForm({ ...ppidForm, requesterPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Rincian informasi publik yang dibutuhkan *"
                  value={ppidForm.informationNeeded}
                  onChange={(e) => setPpidForm({ ...ppidForm, informationNeeded: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Tujuan penggunaan informasi *"
                  value={ppidForm.purpose}
                  onChange={(e) => setPpidForm({ ...ppidForm, purpose: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                />
                <button
                  type="submit"
                  disabled={ppidSubmitting}
                  className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
                >
                  {ppidSubmitting ? 'Mengirim...' : 'Kirim Permohonan PPID'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 9: PENGADUAN WARGA
           ========================================================= */}
        {tab === 'pengaduan' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Kanal Aspirasi &amp; Laporan Warga
                </div>
                <h1 className="text-xl font-bold text-slate-900">Pengaduan Masyarakat Online</h1>
                <p className="text-xs text-slate-500">
                  Sampaikan laporan kerusakan infrastruktur, pelayanan, atau usulan pembangunan lingkungan dusun Anda.
                </p>
              </div>
              {complaintCreated && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  Laporan diterima! Kode Tiket Pelacakan:{' '}
                  <strong className="font-mono">{complaintCreated.ticketCode}</strong>
                </div>
              )}
              <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nama Pelapor *"
                    value={complaintForm.reporterName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, reporterName: e.target.value })}
                    className="h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp *"
                    value={complaintForm.reporterPhone}
                    onChange={(e) => setComplaintForm({ ...complaintForm, reporterPhone: e.target.value })}
                    className="h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="Infrastruktur">Infrastruktur &amp; Jalan Desa</option>
                    <option value="Pelayanan">Pelayanan Balai Desa</option>
                    <option value="Bansos">Bantuan Sosial</option>
                    <option value="Lingkungan">Kebersihan &amp; Irigasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lokasi kejadian (Dusun / RT / RW)"
                    value={complaintForm.location}
                    onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                    className="h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan rincian pengaduan atau aspirasi Anda secara jelas *"
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
                <button
                  type="submit"
                  disabled={complaintSubmitting}
                  className="h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
                >
                  {complaintSubmitting ? 'Mengirim...' : 'Kirim Laporan Pengaduan'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-3.5 h-fit">
              <h2 className="text-base font-bold text-slate-900">Lacak Tindak Lanjut Pengaduan</h2>
              <p className="text-xs text-slate-500">
                Masukkan nomor tiket pengaduan untuk melihat tanggapan dari Pemerintah {village.name}.
              </p>
              <form onSubmit={handleTrackComplaint} className="flex gap-2">
                <input
                  type="text"
                  value={complaintTrackCode}
                  onChange={(e) => setComplaintTrackCode(e.target.value)}
                  placeholder="ADU-2611-XXXXXX"
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-[#0B2A57] text-white text-xs font-semibold"
                >
                  Lacak
                </button>
              </form>
              {complaintTrackErr && <div className="text-xs text-rose-700">{complaintTrackErr}</div>}
              {complaintTrackResult && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">{complaintTrackResult.category}</div>
                  <div>
                    Status: <strong className="font-mono text-emerald-700">{complaintTrackResult.status}</strong>
                  </div>
                  <p className="text-slate-600">{complaintTrackResult.description}</p>
                  {complaintTrackResult.responseText && (
                    <div className="pt-2 border-t border-slate-200 text-emerald-800 font-medium">
                      Tanggapan Pemerintah Desa: {complaintTrackResult.responseText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 10: PETA LOKASI (WEBGIS), POTENSI & WISATA DESA
           ========================================================= */}
        {tab === 'peta' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  WebGIS &amp; Direktori Fasilitas Desa
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Peta Lokasi (POI) &amp; Potensi {village.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Titik koordinat fasilitas pemerintahan, kesehatan, pendidikan, dan potensi ekonomi desa.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ['ALL', 'Semua Titik'],
                  ['POI', 'Fasilitas Desa'],
                  ['POTENSI', 'Potensi Ekonomi'],
                  ['WISATA', 'Wisata & Lingkungan'],
                ].map(([code, lbl]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPoiFilter(code)}
                    className={`h-9 px-3.5 rounded-lg text-xs font-semibold border ${
                      poiFilter === code
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((pl: any) => (
                <div
                  key={pl.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                        {pl.kind}
                      </span>
                      <span className="text-slate-500 font-medium">{pl.category}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{pl.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{pl.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    {pl.address && (
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{pl.address}</span>
                      </div>
                    )}
                    {pl.lat && pl.lng && (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-400">
                          {pl.lat}, {pl.lng}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${pl.lat},${pl.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Buka Peta</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Official Civic Footer */}
      <footer className="bg-[#0B2A57] text-slate-300 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-3">
              <ReneoSidesaLogo className="w-10 h-10 shrink-0" />
              <div>
                <div className="text-sm font-extrabold text-white">Pemerintah {village.name}</div>
                <div className="text-[11px] text-emerald-300">
                  Kecamatan {village.district} · Kabupaten {village.regency}
                </div>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-md">{village.address}</p>
            <div className="font-mono text-[11px] text-slate-400">
              Kode Wilayah Kemendagri: {village.kodeDesa || '35.22.08.2005'} · Kode Pos {village.postalCode}
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Kontak &amp; Jam Pelayanan Balai Desa
            </div>
            <div className="text-slate-300">Senin – Kamis: 08.00 – 15.00 WIB · Jumat: 08.00 – 14.00 WIB</div>
            {village.phone && (
              <div className="flex items-center gap-2 font-mono text-white">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{village.phone}</span>
              </div>
            )}
            {village.email && (
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{village.email}</span>
              </div>
            )}
          </div>

          <div className="md:col-span-3 md:text-right space-y-2">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">Ditenagai Ekosistem Reneo</div>
            <div className="text-slate-300">Reneo SIDesa — Sistem Informasi &amp; Pelayanan Publik Desa</div>
            <div className="pt-1 flex md:justify-end gap-2">
              {onBackToPlatform && (
                <button
                  type="button"
                  onClick={onBackToPlatform}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Platform SIDesa
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Login Perangkat
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

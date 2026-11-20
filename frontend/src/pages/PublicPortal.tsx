import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  HeartHandshake,
  Home,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Phone,
  Search,
  ShoppingBag,
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

const BOJONEGORO_CREST =
  'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/common/300_bojonegorokab.png';

const HERO_SLIDES = [
  {
    eyebrow: 'Selamat Datang',
    title: 'Website Resmi Desa Sugihwaras',
    subtitle:
      'Sumber informasi terbaru tentang pemerintahan, pelayanan warga, transparansi anggaran, dan potensi Desa Sugihwaras, Kecamatan Kepohbaru, Kabupaten Bojonegoro.',
    image:
      'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/29ac04c99ac6977a17584e511f07072a.jpeg',
    ctaLabel: 'Jelajahi Profil Desa',
    targetTab: 'profil' as PublicTab,
  },
  {
    eyebrow: 'Kegiatan Kemasyarakatan',
    title: 'Sinergi Terjalin Melalui Pertemuan Rutin dan Tahlil Bersama di Desa Sugihwaras',
    subtitle:
      'Pertemuan rutin perangkat desa dan tokoh masyarakat memperkuat kebersamaan, musyawarah mufakat, serta gotong royong warga di seluruh dusun.',
    image:
      'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/50f000f2b0725caecd8f9937c7b85e07.jpeg',
    ctaLabel: 'Baca Berita Desa',
    targetTab: 'berita' as PublicTab,
  },
  {
    eyebrow: 'Ketahanan Pangan & Pertanian',
    title: 'Sosialisasi AUTP dan Penyusunan Programa Pertanian di Desa Sugihwaras',
    subtitle:
      'Pemerintah Desa Sugihwaras bersama penyuluh pertanian mendorong perlindungan usaha tani padi dan peningkatan hasil panen kelompok tani.',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-landing-test.webp',
    ctaLabel: 'Lihat Potensi Desa',
    targetTab: 'peta' as PublicTab,
  },
];

const JELAJAHI_ITEMS: Array<{
  id: PublicTab;
  infoSub?: InfografisSubTab;
  label: string;
  iconUrl: string;
}> = [
  {
    id: 'profil',
    label: 'Profil Desa',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/profil.svg',
  },
  {
    id: 'infografis',
    infoSub: 'penduduk',
    label: 'Infografis',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/infografis.svg',
  },
  {
    id: 'infografis',
    infoSub: 'indeks',
    label: 'IDM',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/infografis/idm.svg',
  },
  {
    id: 'ppid',
    label: 'PPID',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/ppid.svg',
  },
  {
    id: 'berita',
    label: 'Berita',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/berita.svg',
  },
  {
    id: 'belanja',
    label: 'Belanja',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/belanja.svg',
  },
  {
    id: 'infografis',
    infoSub: 'bansos',
    label: 'Bansos',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/infografis/bansos.svg',
  },
  {
    id: 'layanan',
    label: 'Layanan Surat',
    iconUrl: 'https://cdn.digitaldesa.com/statics/profil/icon/galeri.svg',
  },
];

const NAV_ITEMS: Array<{ id: PublicTab; label: string }> = [
  { id: 'beranda', label: 'Home' },
  { id: 'profil', label: 'Profil Desa' },
  { id: 'pemerintah', label: 'SOTK' },
  { id: 'infografis', label: 'Infografis' },
  { id: 'peta', label: 'Listing' },
  { id: 'layanan', label: 'Layanan Surat' },
  { id: 'berita', label: 'Berita' },
  { id: 'belanja', label: 'Belanja' },
  { id: 'ppid', label: 'PPID' },
  { id: 'pengaduan', label: 'Pengaduan' },
];

const NEWS_IMAGES = [
  'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/29ac04c99ac6977a17584e511f07072a.jpeg',
  'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/50f000f2b0725caecd8f9937c7b85e07.jpeg',
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/pasamai.webp',
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/cawet.webp',
];

const UMKM_IMAGES = [
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/suban-ayam.webp',
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/balantang.webp',
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/mananggu.webp',
  'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/sebawang.webp',
];

const GALLERY_PHOTOS = [
  {
    title: 'Pertemuan Rutin Perangkat & Tokoh Masyarakat Desa Sugihwaras',
    date: '18 Nov 2026',
    image:
      'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/29ac04c99ac6977a17584e511f07072a.jpeg',
  },
  {
    title: 'Sosialisasi Programa Pertanian & Ketahanan Pangan Kelompok Tani',
    date: '12 Nov 2026',
    image:
      'https://cdn.digitaldesa.com/uploads/profil/35.22.09.2024/berita/50f000f2b0725caecd8f9937c7b85e07.jpeg',
  },
  {
    title: 'Pelayanan Administrasi & Musyawarah Pembangunan Desa',
    date: '05 Nov 2026',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/senga-selatan.webp',
  },
  {
    title: 'Pemberdayaan UMKM & Kelompok Wanita Tani Desa Sugihwaras',
    date: '28 Okt 2026',
    image: 'https://cdn.digitaldesa.com/statics/landing/homepage/media/success-story/salumukanan.webp',
  },
];

function formatRp(n: number): string {
  return `Rp${Number(n || 0).toLocaleString('id-ID')},00`;
}

function calcPercent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((Number(part || 0) / Number(total)) * 100));
}

export const PublicPortal: React.FC<{
  villageSlug?: string;
  onOpenAdmin: () => void;
  onBackToPlatform?: () => void;
  onTabChange?: (tab: PublicTab) => void;
  initialTab?: string;
}> = ({ villageSlug = 'sugihwaras', onOpenAdmin, onBackToPlatform, onTabChange, initialTab }) => {
  const [tab, setTab] = useState<PublicTab>(() => {
    const valid = NAV_ITEMS.some((i) => i.id === initialTab);
    return valid ? (initialTab as PublicTab) : 'beranda';
  });
  const [infoSub, setInfoSub] = useState<InfografisSubTab>('penduduk');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [poiFilter, setPoiFilter] = useState<string>('ALL');
  const [visitorOpen, setVisitorOpen] = useState(false);

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const loadBootstrap = async () => {
    try {
      setLoading(true);
      setError(null);
      const [villageData, docs] = await Promise.all([
        api.getPublicVillage(villageSlug),
        api.getPublicPpid(undefined, villageSlug),
      ]);
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
  }, [villageSlug]);

  const handleCheckBansos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bansosQuery.trim().length < 3) return;
    setBansosLoading(true);
    try {
      const res = await api.checkBansos(bansosQuery.trim(), villageSlug);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] text-base text-slate-700">
        <div className="flex items-center gap-3">
          <img src={BOJONEGORO_CREST} alt="Lambang Kabupaten" className="w-10 h-10 object-contain animate-pulse" />
          <span className="font-bold">Memuat Website Resmi Desa Sugihwaras...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-6 space-y-3 text-center">
          <p className="text-sm font-semibold text-rose-700">{error || 'Data desa belum tersedia'}</p>
          <button
            type="button"
            onClick={() => void loadBootstrap()}
            className="h-10 px-5 rounded-xl bg-[#0078cd] text-white text-sm font-bold"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const { village, officials, demographics, apbdes, indicator, latestNews, umkm, places, letterTypes } = data;
  const filteredPpid = ppidCat ? ppidDocs.filter((d) => d.category === ppidCat) : ppidDocs;
  const activeSlide = HERO_SLIDES[slideIdx % HERO_SLIDES.length];
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
    onTabChange?.(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F6F6] text-slate-900 flex flex-col">
      {/* FULL-WIDTH TOP NAVBAR (Identik dengan sugihwaras.digitaldesa.id) */}
      <header className="sticky top-0 z-40 w-full bg-[#0069b6] text-white shadow-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-2.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateTab('beranda')}
            className="flex items-center gap-3 text-left min-w-0"
          >
            <img
              src={BOJONEGORO_CREST}
              alt={`Lambang ${village.regency}`}
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-xs"
            />
            <div className="min-w-0 leading-tight">
              <div className="text-base sm:text-lg lg:text-xl font-extrabold text-white truncate">
                {village.name}
              </div>
              <div className="text-xs sm:text-sm text-sky-100 truncate">
                Kabupaten {village.regency}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-4 lg:gap-7">
            <nav className="hidden xl:flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTab(item.id)}
                    className={`py-1.5 text-sm lg:text-[15px] font-bold transition-all border-b-2 ${
                      active
                        ? 'text-white border-white'
                        : 'text-sky-100 border-transparent hover:text-white hover:border-sky-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {onBackToPlatform && (
                <button
                  type="button"
                  onClick={onBackToPlatform}
                  title="Kembali ke Platform SaaS SIDesa"
                  className="h-9 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>&larr;</span>
                  <span className="hidden sm:inline">Platform SIDesa</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAdmin}
                className="h-9 px-3.5 rounded-lg bg-white text-[#0069b6] hover:bg-sky-50 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layanan Mandiri / Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenu((v) => !v)}
                aria-label="Menu navigasi"
                className="xl:hidden h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center text-white"
              >
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="xl:hidden border-t border-white/15 bg-[#005a9e] px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTab(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-bold text-left ${
                  tab === item.id ? 'bg-white text-[#0069b6]' : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* =========================================================
          BERANDA WEBSITE RESMI DESA (FULL WIDTH)
         ========================================================= */}
      {tab === 'beranda' && (
        <main className="w-full flex-1 space-y-16 pb-16">
          {/* 1. FULL-WIDTH HERO CAROUSEL SLIDER */}
          <section className="relative w-full h-[480px] sm:h-[560px] lg:h-[640px] overflow-hidden bg-slate-900">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />

            {/* Left / Right Carousel Arrows */}
            <button
              type="button"
              onClick={() => setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              aria-label="Slide sebelumnya"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Slide berikutnya"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Centered Hero Text */}
            <div className="relative z-10 h-full w-full px-6 sm:px-14 lg:px-24 flex flex-col items-center justify-center text-center text-white">
              <div className="max-w-4xl space-y-3">
                <p className="text-lg sm:text-2xl font-bold text-sky-300 drop-shadow">
                  {activeSlide.eyebrow}
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] drop-shadow-md">
                  {activeSlide.title}
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-slate-100 max-w-3xl mx-auto leading-relaxed drop-shadow">
                  {activeSlide.subtitle}
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTab(activeSlide.targetTab)}
                    className="h-12 px-7 rounded-full bg-[#099cff] hover:bg-[#0078cd] text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <span>{activeSlide.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTab('layanan')}
                    className="h-12 px-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/40 text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ajukan Surat Online</span>
                  </button>
                </div>
              </div>

              {/* Slide Dots */}
              <div className="absolute bottom-6 flex items-center gap-2">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSlideIdx(idx)}
                    aria-label={`Pilih slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === slideIdx % HERO_SLIDES.length ? 'w-9 bg-[#099cff]' : 'w-2.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 2. JELAJAHI DESA (Full-Width 50/50 Grid seperti sugihwaras.digitaldesa.id) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#099cff] uppercase leading-tight">
                  JELAJAHI DESA
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed">
                  Melalui website ini Anda dapat menjelajahi segala hal yang terkait dengan Desa. Aspek pemerintahan,
                  penduduk, demografi, potensi Desa, dan juga berita tentang Desa.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                {JELAJAHI_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigateTab(item.id, item.infoSub)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md p-6 flex flex-col items-center justify-center gap-3.5 text-center transition-all hover:-translate-y-0.5 group"
                  >
                    <img
                      src={item.iconUrl}
                      alt={item.label}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                    <span className="text-sm sm:text-base font-extrabold text-slate-700 group-hover:text-[#0069b6] uppercase">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 3. SAMBUTAN KEPALA DESA SUGIHWARAS */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-white shadow-lg p-6 flex items-center justify-center border-4 border-sky-100">
                  <img
                    src={BOJONEGORO_CREST}
                    alt={`Lambang ${village.name}`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                  />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] leading-tight">
                  Sambutan {village.headTitle || 'Kepala Desa'} {village.name}
                </h2>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {village.headName || 'H. Sukamto, S.Sos.'}
                </div>
                <div className="text-sm font-bold text-slate-600">
                  {village.headTitle || 'Kepala Desa'} {village.name} · Kecamatan {village.district}, Kabupaten{' '}
                  {village.regency}
                </div>
                <div className="pt-2 text-base sm:text-lg text-slate-700 leading-relaxed space-y-3 max-w-4xl">
                  <p className="font-semibold">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                  <p>{village.headGreeting}</p>
                  <p>
                    Visi bersama kita adalah: <strong>&ldquo;{village.vision}&rdquo;</strong>. Semoga kehadiran website
                    resmi desa ini memberikan manfaat sebesar-besarnya bagi seluruh masyarakat {village.name}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. PETA DESA (Full-Width Interactive OpenStreetMap) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                PETA DESA
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Menampilkan Peta Desa Dengan <em>Interest Point</em> {village.name}
              </p>
            </div>

            <div className="w-full h-[420px] sm:h-[500px] rounded-2xl overflow-hidden shadow-md bg-white relative">
              <iframe
                title={`Peta Wilayah ${village.name}`}
                src="https://www.openstreetmap.org/export/embed.html?bbox=112.0020%2C-7.2160%2C112.0420%2C-7.1860&amp;layer=mapnik&amp;marker=-7.2010%2C112.0220"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </section>

          {/* 5. SOTK (Struktur Organisasi dan Tata Kerja) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                SOTK
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Struktur Organisasi dan Tata Kerja {village.name}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {officials.slice(0, 4).map((o: any) => (
                <div
                  key={o.id}
                  className="rounded-2xl overflow-hidden shadow-md bg-[#099cff] text-white flex flex-col justify-between"
                >
                  <div className="pt-8 pb-4 px-6 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                      <img
                        src={BOJONEGORO_CREST}
                        alt={o.name}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  </div>
                  <div className="bg-[#0069b6] p-4 text-center space-y-0.5">
                    <div className="text-base sm:text-lg font-extrabold text-white truncate">{o.name}</div>
                    <div className="text-xs sm:text-sm text-sky-100 font-semibold">{o.position}</div>
                    {o.nip && <div className="text-[11px] font-mono text-sky-200">NIP. {o.nip}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigateTab('pemerintah')}
                className="text-sm sm:text-base font-extrabold uppercase text-slate-800 hover:text-[#0069b6] inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>LIHAT STRUKTUR LEBIH LENGKAP</span>
              </button>
            </div>
          </section>

          {/* 6. ADMINISTRASI PENDUDUK (2x3 Counter Bars seperti sugihwaras.digitaldesa.id) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                Administrasi Penduduk
              </h2>
              <p className="text-base sm:text-lg text-slate-700 max-w-4xl">
                Sistem digital yang berfungsi mempermudah pengelolaan data dan informasi terkait dengan kependudukan
                dan pendayagunaannya untuk pelayanan publik yang efektif dan efisien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Penduduk', value: demographics.totalResidents },
                { label: 'Laki-Laki', value: demographics.male },
                { label: 'Kepala Keluarga', value: demographics.totalHouseholds },
                { label: 'Perempuan', value: demographics.female },
                { label: 'Wajib Pilih', value: demographics.voters },
                { label: 'Wilayah Dusun', value: (demographics.byDusun || []).length || 3 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="h-20 sm:h-24 rounded-xl overflow-hidden shadow-xs bg-white grid grid-cols-12 items-center"
                >
                  <div
                    className="col-span-5 h-full flex items-center justify-center text-white text-2xl sm:text-4xl font-extrabold font-mono"
                    style={{
                      background: 'linear-gradient(163deg, #0078cd 0%, #3baefe 100%)',
                    }}
                  >
                    {Number(stat.value || 0).toLocaleString('id-ID')}
                  </div>
                  <div className="col-span-7 px-6 text-lg sm:text-2xl font-extrabold text-slate-700">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigateTab('infografis', 'penduduk')}
                className="text-sm sm:text-base font-extrabold uppercase text-slate-800 hover:text-[#0069b6] inline-flex items-center gap-2"
              >
                <span>LIHAT DEMOGRAFI LEBIH LENGKAP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* 7. APB DESA (2-Column Financial Section seperti sugihwaras.digitaldesa.id) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                <div className="w-44 h-44 rounded-3xl bg-sky-100 flex items-center justify-center">
                  <Wallet className="w-24 h-24 text-[#0078cd]" />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase">
                  APB Desa {apbdes.fiscalYear}
                </h2>
                <p className="text-base sm:text-lg text-slate-700">
                  Akses cepat dan transparan terhadap APB Desa serta proyek pembangunan {village.name}.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl shadow-xs p-6 space-y-1">
                  <div className="text-base font-bold text-slate-500">Pendapatan Desa</div>
                  <div className="text-2xl sm:text-4xl font-extrabold font-mono text-emerald-700">
                    {formatRp(apbdes.pendapatan?.budget)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    Realisasi: <strong className="font-mono">{formatRp(apbdes.pendapatan?.realized)}</strong>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xs p-6 space-y-1">
                  <div className="text-base font-bold text-slate-500">Belanja Desa</div>
                  <div className="text-2xl sm:text-4xl font-extrabold font-mono text-rose-700">
                    {formatRp(apbdes.belanja?.budget)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500">
                    Realisasi: <strong className="font-mono">{formatRp(apbdes.belanja?.realized)}</strong>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xs p-6 space-y-2">
                  <div className="text-base font-bold text-slate-500">Pembiayaan &amp; Sisa Lebih Anggaran</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="text-xs text-slate-500">Realisasi Pendapatan</div>
                      <div className="text-lg font-extrabold font-mono text-slate-800">
                        {formatRp(apbdes.pendapatan?.realized)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Surplus / Defisit Realisasi</div>
                      <div className="text-lg font-extrabold font-mono text-[#0078cd]">
                        {formatRp(apbdes.surplusDeficit)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigateTab('infografis', 'apbdes')}
                    className="text-sm sm:text-base font-extrabold uppercase text-slate-800 hover:text-[#0069b6] inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>LIHAT DATA LEBIH LENGKAP</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 8. BERITA DESA (3-Column Photographic News Cards dengan Badge Tanggal) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                Berita Desa
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Menyajikan informasi terbaru tentang peristiwa, berita terkini, dan artikel-artikel jurnalistik dari{' '}
                {village.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.slice(0, 3).map((n: any, idx: number) => (
                <article
                  key={n.id}
                  onClick={() => {
                    setSelectedNews(n);
                    setTab('berita');
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                      <img
                        src={NEWS_IMAGES[idx % NEWS_IMAGES.length]}
                        alt={n.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#0069b6] text-white text-xs font-bold shadow">
                        {n.category}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#0069b6] line-clamp-2 leading-snug">
                        {n.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{n.excerpt}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      <div className="font-semibold text-slate-700">{n.authorName}</div>
                      <div className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dilihat {(idx + 1) * 42} kali</span>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-xl text-white font-bold text-center leading-tight"
                      style={{
                        background: 'linear-gradient(163deg, #0078cd 0%, #3baefe 100%)',
                      }}
                    >
                      {new Date(n.publishedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigateTab('berita')}
                className="text-sm sm:text-base font-extrabold uppercase text-slate-800 hover:text-[#0069b6] inline-flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4" />
                <span>LIHAT BERITA LEBIH BANYAK</span>
              </button>
            </div>
          </section>

          {/* 9. POTENSI DESA & WISATA DESA (seperti sugihwaras.digitaldesa.id) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                POTENSI DESA
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Informasi tentang potensi dan kemajuan Desa di berbagai bidang seperti ekonomi, pariwisata, pertanian,
                industri kreatif, dan kelestarian lingkungan
              </p>
            </div>

            {/* Full-Width Dark/Photo Wisata & Potensi Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-lg">
              <img
                src="https://cdn.digitaldesa.com/statics/landing/homepage/media/bg/bg-landing-test.webp"
                alt="Potensi & Wisata Desa"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white uppercase">
                    WISATA &amp; POTENSI DESA
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Layanan yang mempermudah promosi potensi pertanian, produk kreatif, dan destinasi wisata sehingga
                    dapat menarik pengunjung dan meningkatkan kesejahteraan warga {village.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTab('peta')}
                    className="mt-2 h-11 px-6 rounded-full bg-[#099cff] hover:bg-[#0078cd] text-white text-sm font-bold inline-flex items-center gap-2"
                  >
                    <span>LIHAT POTENSI &amp; WISATA LEBIH BANYAK</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {places.slice(0, 2).map((pl: any, idx: number) => (
                    <div
                      key={pl.id}
                      className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between"
                    >
                      <img
                        src={NEWS_IMAGES[(idx + 2) % NEWS_IMAGES.length]}
                        alt={pl.title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-5 space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded bg-[#099cff] text-white text-xs font-bold">
                          {pl.category}
                        </span>
                        <h4 className="text-lg font-extrabold text-white">{pl.title}</h4>
                        <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">{pl.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 10. BELI DARI DESA (UMKM) */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                BELI DARI DESA
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Layanan yang disediakan promosi produk UMKM desa sehingga mampu meningkatkan perekonomian masyarakat
                Desa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {umkm.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-52 w-full bg-slate-200 overflow-hidden">
                      <img
                        src={UMKM_IMAGES[idx % UMKM_IMAGES.length]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/65 text-white text-xs font-bold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5 space-y-1.5">
                      <h3 className="text-lg font-extrabold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                      <div className="text-xs text-slate-500">Penjual: {item.sellerName}</div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3">
                    <div className="text-lg font-extrabold font-mono text-[#0069b6]">
                      {formatRp(item.price)} <span className="text-xs font-sans font-normal text-slate-500">/ {item.unit}</span>
                    </div>
                    <a
                      href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Halo ${item.sellerName}, saya ingin memesan ${item.name} dari Website Resmi ${village.name}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-4 rounded-xl bg-[#0078cd] hover:bg-[#0069b6] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Beli Sekarang</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigateTab('belanja')}
                className="text-sm sm:text-base font-extrabold uppercase text-slate-800 hover:text-[#0069b6] inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>LIHAT PRODUK LEBIH BANYAK</span>
              </button>
            </div>
          </section>

          {/* 11. GALERI DESA */}
          <section className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 space-y-5">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#099cff] uppercase leading-tight">
                GALERI DESA
              </h2>
              <p className="text-base sm:text-lg text-slate-700">
                Menampilkan kegiatan-kegiatan yang berlangsung di desa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {GALLERY_PHOTOS.map((g) => (
                <div key={g.title} className="group relative h-64 rounded-2xl overflow-hidden shadow-sm bg-slate-900">
                  <img
                    src={g.image}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-xs text-sky-300 font-semibold">{g.date}</span>
                    <div className="text-sm font-bold leading-snug mt-0.5">{g.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* =========================================================
          SUB-PAGES (FULL WIDTH CONTAINER)
         ========================================================= */}
      {tab !== 'beranda' && (
        <main className="flex-1 w-full px-4 sm:px-8 lg:px-14 xl:px-20 py-8 space-y-8">
          {/* PROFIL DESA */}
          {tab === 'profil' && (
            <section className="space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">
                  Profil {village.name}
                </h1>
                <p className="text-base sm:text-lg text-slate-700">
                  Visi, Misi, Sejarah, dan Letak Geografis {village.name}, Kecamatan {village.district}, Kabupaten{' '}
                  {village.regency}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-4">
                    <h2 className="text-2xl font-extrabold text-[#0069b6]">Visi</h2>
                    <p className="text-lg font-bold text-slate-800 leading-relaxed">&ldquo;{village.vision}&rdquo;</p>
                    <h2 className="text-2xl font-extrabold text-[#0069b6] pt-2">Misi</h2>
                    <ol className="list-decimal list-inside space-y-2 text-base text-slate-700 leading-relaxed">
                      {missionList.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-3">
                    <h2 className="text-2xl font-extrabold text-[#0069b6]">Sejarah {village.name}</h2>
                    <p className="text-base text-slate-700 whitespace-pre-line leading-relaxed">{village.history}</p>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-2xl shadow-xs p-6 space-y-4">
                    <h2 className="text-xl font-extrabold text-[#0069b6]">Peta &amp; Batas Wilayah</h2>
                    <div className="divide-y divide-slate-100 text-sm">
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Kode Desa</span>
                        <span className="font-mono font-bold">{village.kodeDesa}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Luas Wilayah</span>
                        <span className="font-mono font-bold">{village.areaKm2} km²</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Utara</span>
                        <span className="font-bold">{village.boundaries?.north}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Timur</span>
                        <span className="font-bold">{village.boundaries?.east}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Selatan</span>
                        <span className="font-bold">{village.boundaries?.south}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span className="text-slate-500">Barat</span>
                        <span className="font-bold">{village.boundaries?.west}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PEMERINTAHAN (SOTK) */}
          {tab === 'pemerintah' && (
            <section className="space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">SOTK</h1>
                <p className="text-base sm:text-lg text-slate-700">
                  Struktur Organisasi dan Tata Kerja Pemerintah {village.name}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {officials.map((o: any) => (
                  <div
                    key={o.id}
                    className="rounded-2xl overflow-hidden shadow-md bg-[#099cff] text-white flex flex-col justify-between"
                  >
                    <div className="pt-8 pb-4 px-6 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center">
                        <img src={BOJONEGORO_CREST} alt={o.name} className="w-20 h-20 object-contain" />
                      </div>
                    </div>
                    <div className="bg-[#0069b6] p-4 text-center space-y-0.5">
                      <div className="text-lg font-extrabold text-white">{o.name}</div>
                      <div className="text-sm text-sky-100 font-semibold">{o.position}</div>
                      {o.nip && <div className="text-xs font-mono text-sky-200">NIP. {o.nip}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INFOGRAFIS */}
          {tab === 'infografis' && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">
                    Infografis {village.name}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-700">
                    Data Demografi Penduduk, APBDes, Bansos, IDM, Stunting, dan SDGs Desa
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['penduduk', 'Penduduk'],
                      ['apbdes', 'APBDes'],
                      ['bansos', 'Bansos'],
                      ['indeks', 'IDM & SDGs'],
                    ] as const
                  ).map(([k, lbl]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setInfoSub(k)}
                      className={`h-10 px-5 rounded-xl text-sm font-bold transition-colors ${
                        infoSub === k
                          ? 'bg-[#0069b6] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-sky-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {infoSub === 'penduduk' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Penduduk', value: demographics.totalResidents },
                      { label: 'Kepala Keluarga', value: demographics.totalHouseholds },
                      { label: 'Wajib Pilih', value: demographics.voters },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="h-20 rounded-xl overflow-hidden shadow-xs bg-white grid grid-cols-12 items-center"
                      >
                        <div
                          className="col-span-5 h-full flex items-center justify-center text-white text-2xl font-extrabold font-mono"
                          style={{ background: 'linear-gradient(163deg, #0078cd 0%, #3baefe 100%)' }}
                        >
                          {s.value}
                        </div>
                        <div className="col-span-7 px-5 text-lg font-extrabold text-slate-700">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      ['Berdasarkan Dusun', demographics.byDusun],
                      ['Berdasarkan Pendidikan', demographics.byEducation],
                      ['Berdasarkan Pekerjaan', demographics.byOccupation],
                    ].map(([title, list]: any) => (
                      <div key={title} className="bg-white rounded-2xl shadow-xs p-6 space-y-3">
                        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                        <div className="space-y-2.5 text-sm">
                          {list.map((row: any) => {
                            const pct = calcPercent(row.total, demographics.totalResidents);
                            return (
                              <div key={row.label} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="font-semibold text-slate-700">{row.label}</span>
                                  <span className="font-mono font-bold text-slate-900">
                                    {row.total} ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#099cff] rounded-full"
                                    style={{ width: `${Math.max(8, pct)}%` }}
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl shadow-xs p-6">
                      <div className="text-sm font-bold text-slate-500">Pendapatan Desa ({apbdes.fiscalYear})</div>
                      <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                        {formatRp(apbdes.pendapatan.budget)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Realisasi: {formatRp(apbdes.pendapatan.realized)}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xs p-6">
                      <div className="text-sm font-bold text-slate-500">Belanja Desa ({apbdes.fiscalYear})</div>
                      <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1">
                        {formatRp(apbdes.belanja.budget)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Realisasi: {formatRp(apbdes.belanja.realized)}</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xs p-6">
                      <div className="text-sm font-bold text-slate-500">Surplus / Defisit</div>
                      <div className="text-2xl font-extrabold font-mono text-[#0078cd] mt-1">
                        {formatRp(apbdes.surplusDeficit)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#0069b6] text-white">
                        <tr>
                          <th className="py-3.5 px-5 font-bold">Kategori</th>
                          <th className="py-3.5 px-5 font-bold">Uraian Kegiatan</th>
                          <th className="py-3.5 px-5 text-right font-bold">Anggaran</th>
                          <th className="py-3.5 px-5 text-right font-bold">Realisasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...apbdes.pendapatan.items, ...apbdes.belanja.items, ...apbdes.pembiayaan.items].map(
                          (item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-5 font-bold text-slate-700">{item.category}</td>
                              <td className="py-3.5 px-5">
                                <div className="font-bold text-slate-900">{item.label}</div>
                                <div className="text-xs text-slate-500">{item.subCategory}</div>
                              </td>
                              <td className="py-3.5 px-5 text-right font-mono">{formatRp(item.budgetAmount)}</td>
                              <td className="py-3.5 px-5 text-right font-mono text-[#0078cd] font-bold">
                                {formatRp(item.realizedAmount)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {infoSub === 'bansos' && (
                <div className="bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-4">
                  <h2 className="text-2xl font-extrabold text-[#0069b6]">Cek Penerima Bantuan Sosial (Bansos)</h2>
                  <p className="text-sm text-slate-600">
                    Masukkan NIK atau Nama Lengkap untuk memeriksa kepesertaan PKH, BPNT, atau BLT Dana Desa.
                  </p>
                  <form onSubmit={handleCheckBansos} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={bansosQuery}
                      onChange={(e) => setBansosQuery(e.target.value)}
                      placeholder="Masukkan NIK atau Nama Warga..."
                      className="flex-1 h-12 px-4 rounded-xl border border-slate-300 text-base font-mono"
                    />
                    <button
                      type="submit"
                      disabled={bansosLoading}
                      className="h-12 px-6 rounded-xl bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold inline-flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>{bansosLoading ? 'Mencari...' : 'Cari Penerima'}</span>
                    </button>
                  </form>
                  {bansosResults &&
                    (bansosResults.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-600">
                        Data penerima bansos tidak ditemukan untuk kata kunci tersebut.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                        {bansosResults.map((b) => (
                          <div key={b.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <div>
                              <div className="font-extrabold text-slate-900">{b.fullName}</div>
                              <div className="font-mono text-slate-500">
                                NIK: {b.maskedNik} · {b.dusun}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-3 py-1 rounded-full bg-sky-50 text-[#0069b6] font-bold">
                                {b.program} · {b.status}
                              </span>
                              <div className="text-xs font-mono text-slate-500 mt-1">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-xs p-6 space-y-3">
                    <div className="text-sm font-bold text-[#0069b6] uppercase">Indeks Desa Membangun ({indicator.year})</div>
                    <div className="text-4xl font-extrabold font-mono text-slate-900">{indicator.idmScore}</div>
                    <div className="text-base font-extrabold text-emerald-700">Status: {indicator.idmStatus}</div>
                    <div className="pt-2 space-y-2 text-sm">
                      {(indicator.dimensions || []).map((d: any) => (
                        <div key={d.name} className="flex justify-between">
                          <span className="text-slate-600">{d.name}</span>
                          <span className="font-mono font-bold">{d.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xs p-6 space-y-2">
                    <div className="text-sm font-bold text-[#0069b6] uppercase">Skor SDGs Desa</div>
                    <div className="text-4xl font-extrabold font-mono text-slate-900">{indicator.sdgsScore}</div>
                    <p className="text-sm text-slate-600">
                      Capaian rata-rata 18 tujuan pembangunan berkelanjutan tingkat desa.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xs p-6 space-y-2">
                    <div className="text-sm font-bold text-[#0069b6] uppercase">Pemantauan Stunting</div>
                    <div className="text-4xl font-extrabold font-mono text-slate-900">{indicator.stuntingCases} Kasus</div>
                    <p className="text-sm text-slate-600">Prevalensi tercatat: {indicator.stuntingRate}%.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* LAYANAN SURAT MANDIRI */}
          {tab === 'layanan' && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0069b6]">
                  Pengajuan Surat Mandiri Warga
                </h1>
                <p className="text-sm text-slate-600">
                  Ajukan surat pengantar/keterangan dari rumah; perangkat desa akan memproses dan mengirim notifikasi
                  WhatsApp saat surat siap diambil.
                </p>
                {letterCreated && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950">
                    Pengajuan tercatat! Simpan Kode Lacak Anda:{' '}
                    <strong className="font-mono">{letterCreated.trackingCode}</strong>
                  </div>
                )}
                <form onSubmit={handleSubmitLetter} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Surat</label>
                    <select
                      value={letterForm.letterType}
                      onChange={(e) => setLetterForm({ ...letterForm, letterType: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white"
                    >
                      {letterTypes.map((lt: any) => (
                        <option key={lt.code} value={lt.code}>
                          {lt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">NIK Pemohon *</label>
                      <input
                        type="text"
                        required
                        value={letterForm.applicantNik}
                        onChange={(e) => setLetterForm({ ...letterForm, applicantNik: e.target.value })}
                        placeholder="352213..."
                        className="w-full h-11 px-3 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={letterForm.applicantName}
                        onChange={(e) => setLetterForm({ ...letterForm, applicantName: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      value={letterForm.applicantPhone}
                      onChange={(e) => setLetterForm({ ...letterForm, applicantPhone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keperluan Surat *</label>
                    <textarea
                      rows={3}
                      required
                      value={letterForm.purpose}
                      onChange={(e) => setLetterForm({ ...letterForm, purpose: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={letterSubmitting}
                    className="h-11 px-6 rounded-xl bg-[#0069b6] hover:bg-[#005a9e] text-white font-bold"
                  >
                    {letterSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Surat'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-4 h-fit">
                <h2 className="text-xl font-extrabold text-slate-900">Lacak Status Pengajuan Surat</h2>
                <form onSubmit={handleTrackLetter} className="flex gap-2">
                  <input
                    type="text"
                    value={letterTrackCode}
                    onChange={(e) => setLetterTrackCode(e.target.value)}
                    placeholder="SRT-2611-XXXXXX"
                    className="flex-1 h-11 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                  <button type="submit" className="h-11 px-5 rounded-xl bg-[#0069b6] text-white text-sm font-bold">
                    Lacak
                  </button>
                </form>
                {letterTrackErr && <div className="text-sm text-rose-700">{letterTrackErr}</div>}
                {letterTrackResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-1">
                    <div className="font-bold text-slate-900">{letterTrackResult.applicantName}</div>
                    <div>
                      Jenis: <strong>{letterTrackResult.letterType}</strong>
                    </div>
                    <div>
                      Status: <span className="font-mono font-bold text-[#0069b6]">{letterTrackResult.status}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* BERITA */}
          {tab === 'berita' && (
            <section className="space-y-6">
              {selectedNews ? (
                <article className="bg-white rounded-2xl shadow-xs p-6 sm:p-10 space-y-5 max-w-4xl">
                  <button
                    type="button"
                    onClick={() => setSelectedNews(null)}
                    className="text-sm font-bold text-[#0069b6] hover:underline"
                  >
                    &larr; Kembali ke Berita Desa
                  </button>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-lg bg-sky-50 text-[#0069b6] text-xs font-bold">
                      {selectedNews.category}
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900">{selectedNews.title}</h1>
                    <div className="text-xs text-slate-500">
                      {new Date(selectedNews.publishedAt).toLocaleDateString('id-ID')} · {selectedNews.authorName}
                    </div>
                  </div>
                  <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedNews.content}
                  </div>
                </article>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">
                    Berita {village.name}
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {latestNews.map((n: any, idx: number) => (
                      <article
                        key={n.id}
                        onClick={() => setSelectedNews(n)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all"
                      >
                        <img
                          src={NEWS_IMAGES[idx % NEWS_IMAGES.length]}
                          alt={n.title}
                          className="h-52 w-full object-cover"
                        />
                        <div className="p-5 space-y-2">
                          <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0069b6] text-xs font-bold">
                            {n.category}
                          </span>
                          <h2 className="text-lg font-extrabold text-slate-900">{n.title}</h2>
                          <p className="text-sm text-slate-600 line-clamp-3">{n.excerpt}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* BELANJA / UMKM */}
          {tab === 'belanja' && (
            <section className="space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">Beli Dari Desa</h1>
                <p className="text-base sm:text-lg text-slate-700">
                  Katalog Produk UMKM Warga {village.name}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {umkm.map((item: any, idx: number) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={UMKM_IMAGES[idx % UMKM_IMAGES.length]}
                        alt={item.name}
                        className="h-52 w-full object-cover"
                      />
                      <div className="p-5 space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0069b6] text-xs font-bold">
                          {item.category}
                        </span>
                        <h2 className="text-lg font-extrabold text-slate-900">{item.name}</h2>
                        <p className="text-sm text-slate-600">{item.description}</p>
                        <div className="text-xs text-slate-500">Penjual: {item.sellerName}</div>
                      </div>
                    </div>
                    <div className="p-5 pt-0 flex items-center justify-between">
                      <span className="text-lg font-extrabold font-mono text-[#0069b6]">
                        {formatRp(item.price)} / {item.unit}
                      </span>
                      <a
                        href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Halo ${item.sellerName}, saya ingin memesan ${item.name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-10 px-4 rounded-xl bg-[#0078cd] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan WA</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PPID */}
          {tab === 'ppid' && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <h1 className="text-3xl font-extrabold text-[#099cff] uppercase">PPID {village.name}</h1>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['', 'Semua'],
                    ['BERKALA', 'Informasi Berkala'],
                    ['SERTA_MERTA', 'Serta-Merta'],
                    ['SETIAP_SAAT', 'Setiap Saat'],
                    ['DASAR_HUKUM', 'Dasar Hukum'],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPpidCat(val)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold ${
                        ppidCat === val ? 'bg-[#0069b6] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredPpid.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-2xl shadow-xs p-5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0069b6] font-bold">{doc.category}</span>
                        <span className="font-mono text-slate-500">{doc.documentNumber || doc.year}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{doc.title}</h3>
                      <p className="text-sm text-slate-600">{doc.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl shadow-xs p-6 space-y-3 h-fit text-sm">
                <h2 className="text-xl font-extrabold text-slate-900">Permohonan Informasi Publik</h2>
                {ppidCreated && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900">
                    Tiket PPID: <strong className="font-mono">{ppidCreated.ticketCode}</strong>
                  </div>
                )}
                <form onSubmit={handleSubmitPpid} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Nama Pemohon *"
                    value={ppidForm.requesterName}
                    onChange={(e) => setPpidForm({ ...ppidForm, requesterName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    required
                    placeholder="NIK *"
                    value={ppidForm.requesterNik}
                    onChange={(e) => setPpidForm({ ...ppidForm, requesterNik: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp *"
                    value={ppidForm.requesterPhone}
                    onChange={(e) => setPpidForm({ ...ppidForm, requesterPhone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Informasi yang dibutuhkan *"
                    value={ppidForm.informationNeeded}
                    onChange={(e) => setPpidForm({ ...ppidForm, informationNeeded: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Tujuan penggunaan *"
                    value={ppidForm.purpose}
                    onChange={(e) => setPpidForm({ ...ppidForm, purpose: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={ppidSubmitting}
                    className="w-full h-11 rounded-xl bg-[#0069b6] text-white font-bold"
                  >
                    {ppidSubmitting ? 'Mengirim...' : 'Ajukan Permohonan'}
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* PENGADUAN */}
          {tab === 'pengaduan' && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs p-6 sm:p-8 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0069b6]">Pengaduan Masyarakat</h1>
                {complaintCreated && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-sm text-emerald-950">
                    Tiket Pengaduan: <strong className="font-mono">{complaintCreated.ticketCode}</strong>
                  </div>
                )}
                <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nama Pelapor *"
                      value={complaintForm.reporterName}
                      onChange={(e) => setComplaintForm({ ...complaintForm, reporterName: e.target.value })}
                      className="h-11 px-3 rounded-xl border border-slate-300"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Nomor WhatsApp *"
                      value={complaintForm.reporterPhone}
                      onChange={(e) => setComplaintForm({ ...complaintForm, reporterPhone: e.target.value })}
                      className="h-11 px-3 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={complaintForm.category}
                      onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                      className="h-11 px-3 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Infrastruktur">Infrastruktur &amp; Jalan</option>
                      <option value="Pelayanan">Pelayanan Publik</option>
                      <option value="Bansos">Bantuan Sosial</option>
                      <option value="Lingkungan">Lingkungan</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Lokasi (Dusun / RT)"
                      value={complaintForm.location}
                      onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                      className="h-11 px-3 rounded-xl border border-slate-300"
                    />
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Uraian pengaduan *"
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={complaintSubmitting}
                    className="h-11 px-6 rounded-xl bg-[#0069b6] text-white font-bold"
                  >
                    {complaintSubmitting ? 'Mengirim...' : 'Kirim Pengaduan'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl shadow-xs p-6 space-y-3 h-fit">
                <h2 className="text-xl font-extrabold text-slate-900">Lacak Tiket Pengaduan</h2>
                <form onSubmit={handleTrackComplaint} className="flex gap-2">
                  <input
                    type="text"
                    value={complaintTrackCode}
                    onChange={(e) => setComplaintTrackCode(e.target.value)}
                    placeholder="ADU-2611-XXXXXX"
                    className="flex-1 h-11 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                  <button type="submit" className="h-11 px-5 rounded-xl bg-[#0069b6] text-white text-sm font-bold">
                    Lacak
                  </button>
                </form>
                {complaintTrackErr && <div className="text-sm text-rose-700">{complaintTrackErr}</div>}
                {complaintTrackResult && (
                  <div className="p-4 rounded-xl bg-slate-50 text-sm space-y-1">
                    <div className="font-bold">{complaintTrackResult.category}</div>
                    <div>
                      Status: <strong className="font-mono text-[#0069b6]">{complaintTrackResult.status}</strong>
                    </div>
                    <p>{complaintTrackResult.description}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* LISTING / PETA DESA */}
          {tab === 'peta' && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#099cff] uppercase">
                    Peta &amp; Listing {village.name}
                  </h1>
                  <p className="text-base text-slate-700">
                    Titik lokasi penting (Interest Point), potensi unggulan, dan wisata desa
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['ALL', 'Semua'],
                    ['POI', 'Fasilitas Desa'],
                    ['POTENSI', 'Potensi Desa'],
                    ['WISATA', 'Wisata Desa'],
                  ].map(([code, lbl]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPoiFilter(code)}
                      className={`h-10 px-4 rounded-xl text-xs font-bold ${
                        poiFilter === code ? 'bg-[#0069b6] text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-[420px] rounded-2xl overflow-hidden shadow-md bg-white">
                <iframe
                  title={`Peta ${village.name}`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=112.0020%2C-7.2160%2C112.0420%2C-7.1860&amp;layer=mapnik&amp;marker=-7.2010%2C112.0220"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPlaces.map((pl: any) => (
                  <div key={pl.id} className="bg-white rounded-2xl shadow-xs p-5 space-y-2">
                    <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0069b6] text-xs font-bold">
                      {pl.kind} · {pl.category}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900">{pl.title}</h2>
                    <p className="text-sm text-slate-600">{pl.description}</p>
                    {pl.address && (
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0069b6]" />
                        <span>{pl.address}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* FLOATING QUICK WIDGETS (Kunjungan Website & Pengaduan seperti sugihwaras.digitaldesa.id) */}
      <div className="fixed bottom-5 left-5 z-30">
        {visitorOpen ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-60 space-y-2 text-xs">
            <div className="flex items-center justify-between font-extrabold text-slate-800">
              <span>Kunjungan Website</span>
              <button type="button" onClick={() => setVisitorOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                ['Hari Ini', '48'],
                ['Kemarin', '112'],
                ['Minggu Ini', '645'],
                ['Bulan Ini', '2.840'],
                ['Total Kunjungan', '19.420'],
              ].map(([k, v]) => (
                <div key={k} className="py-1 flex justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-mono font-bold text-[#0069b6]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setVisitorOpen(true)}
            className="h-11 px-4 rounded-full bg-[#0069b6] hover:bg-[#005a9e] text-white text-xs font-bold shadow-lg inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Kunjungan Website</span>
          </button>
        )}
      </div>

      <div className="fixed bottom-5 right-5 z-30">
        <button
          type="button"
          onClick={() => navigateTab('pengaduan')}
          className="h-11 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg inline-flex items-center gap-2"
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>Pengaduan Warga</span>
        </button>
      </div>

      {/* FULL-WIDTH VILLAGE FOOTER (seperti sugihwaras.digitaldesa.id) */}
      <footer className="w-full bg-[#003865] text-white mt-auto">
        <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-sm">
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <img src={BOJONEGORO_CREST} alt="Lambang Kabupaten" className="w-14 h-14 object-contain" />
              <div>
                <div className="text-lg font-extrabold">Pemerintah {village.name}</div>
                <div className="text-xs text-sky-200">
                  Kecamatan {village.district} · Kabupaten {village.regency}
                </div>
              </div>
            </div>
            <p className="text-sky-100 leading-relaxed">
              {village.address || 'Jl. Brawijaya Nomor 143 Sugihwaras Kode Pos 62194'}
            </p>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <div className="text-base font-extrabold text-white">Hubungi Kami</div>
            {village.phone && (
              <div className="flex items-center gap-2 text-sky-100 font-mono">
                <Phone className="w-4 h-4 text-sky-300" />
                <span>{village.phone}</span>
              </div>
            )}
            {village.email && (
              <div className="flex items-center gap-2 text-sky-100">
                <Mail className="w-4 h-4 text-sky-300" />
                <span>{village.email}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            <div className="text-base font-extrabold text-white">Nomor Telepon Penting</div>
            <ul className="space-y-1 text-sky-100 text-xs">
              <li>Ambulans Desa Sugihwaras: 0812-3456-7890</li>
              <li>Bidan Desa / Polindes: 0813-3522-0811</li>
              <li>Bhabinkamtibmas / Babinsa: 0812-3522-0110</li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-2.5">
            <div className="text-base font-extrabold text-white">Jelajahi</div>
            <ul className="space-y-1.5 text-sky-100 text-xs">
              <li>
                <button type="button" onClick={() => navigateTab('profil')} className="hover:underline">
                  Profil Desa
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTab('infografis')} className="hover:underline">
                  Infografis &amp; APBDes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTab('layanan')} className="hover:underline">
                  Pelayanan Surat
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTab('ppid')} className="hover:underline">
                  PPID Desa
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 sm:px-8 lg:px-14 xl:px-20 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-200">
          <span>&copy; 2026 Pemerintah {village.name} — Ditenagai oleh Reneo SIDesa</span>
          <span>Kode Wilayah Kemendagri: {village.kodeDesa || '35.22.08.2005'}</span>
        </div>
      </footer>
    </div>
  );
};

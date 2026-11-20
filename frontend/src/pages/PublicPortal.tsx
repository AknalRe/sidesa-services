import React, { useEffect, useState } from 'react';
import {
  Building2,
  FileText,
  Users,
  Wallet,
  HeartHandshake,
  Newspaper,
  ShoppingBag,
  ShieldCheck,
  MessageSquareWarning,
  MapPin,
  Menu,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  LogIn,
  BarChart3,
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
  { id: 'profil', label: 'Profil' },
  { id: 'pemerintah', label: 'Pemerintah' },
  { id: 'infografis', label: 'Infografis' },
  { id: 'layanan', label: 'Layanan Surat' },
  { id: 'berita', label: 'Berita' },
  { id: 'belanja', label: 'Belanja' },
  { id: 'ppid', label: 'PPID' },
  { id: 'pengaduan', label: 'Pengaduan' },
  { id: 'peta', label: 'Peta & Potensi' },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

export const PublicPortal: React.FC<{ onOpenAdmin: () => void }> = ({ onOpenAdmin }) => {
  const [tab, setTab] = useState<PublicTab>('beranda');
  const [infoSub, setInfoSub] = useState<InfografisSubTab>('penduduk');
  const [mobileMenu, setMobileMenu] = useState(false);

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
      setLetterForm({ letterType: 'SKTM', applicantNik: '', applicantName: '', applicantPhone: '', purpose: '', notes: '' });
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
      setComplaintForm({ reporterName: '', reporterPhone: '', category: 'Infrastruktur', location: '', description: '' });
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
      setPpidForm({ requesterName: '', requesterNik: '', requesterPhone: '', requesterEmail: '', informationNeeded: '', purpose: '' });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal mengirim permohonan PPID.');
    } finally {
      setPpidSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Memuat Portal Resmi Desa...
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
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const { village, officials, demographics, apbdes, indicator, latestNews, umkm, places, letterTypes } = data;
  const filteredPpid = ppidCat ? ppidDocs.filter((d) => d.category === ppidCat) : ppidDocs;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setTab('beranda');
              setSelectedNews(null);
            }}
            className="flex items-center gap-2.5 text-left min-w-0"
          >
            <ReneoSidesaLogo className="w-9 h-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-bold text-slate-900 truncate">{village.name}</div>
              <div className="text-[11px] text-slate-500 truncate">
                Kec. {village.district} · Kab. {village.regency}
              </div>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setSelectedNews(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === item.id
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
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
                onClick={() => {
                  setTab(item.id);
                  setSelectedNews(null);
                  setMobileMenu(false);
                }}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* BERANDA */}
        {tab === 'beranda' && (
          <>
            <section className="rounded-xl bg-emerald-800 text-white p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Website Resmi Pemerintah Desa · Kode {village.kodeDesa || '-'}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  Selamat Datang di Portal Digital {village.name}
                </h1>
                <p className="text-sm sm:text-base text-emerald-100 leading-relaxed max-w-2xl">
                  {village.headGreeting}
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTab('layanan')}
                    className="h-11 px-5 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ajukan Surat Mandiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('infografis');
                      setInfoSub('bansos');
                    }}
                    className="h-11 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Cek Penerima Bansos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('pengaduan')}
                    className="h-11 px-4 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-600 text-white text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <MessageSquareWarning className="w-4 h-4" />
                    <span>Pengaduan Warga</span>
                  </button>
                </div>
              </div>
              <div className="lg:col-span-4 bg-white/10 border border-white/15 rounded-xl p-4 space-y-2 text-xs">
                <div className="text-emerald-200 font-semibold uppercase tracking-wider text-[11px]">
                  Sambutan {village.headTitle || 'Kepala Desa'}
                </div>
                <div className="text-base font-bold text-white">{village.headName || '-'}</div>
                <div className="text-emerald-100 leading-relaxed">{village.address}</div>
                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-emerald-100">
                  <span>Status Indeks Desa</span>
                  <span className="font-mono font-bold text-white">
                    {indicator ? `${indicator.idmStatus} (${indicator.idmScore})` : '-'}
                  </span>
                </div>
              </div>
            </section>

            {/* Quick Summary Metrics */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  Total Penduduk
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {demographics.totalResidents.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {demographics.totalHouseholds} KK · {demographics.male} L / {demographics.female} P
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                  Pendapatan APBDes {apbdes.fiscalYear}
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                  {formatRp(apbdes.pendapatan.budget)}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Realisasi: {formatRp(apbdes.pendapatan.realized)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                  Belanja APBDes {apbdes.fiscalYear}
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                  {formatRp(apbdes.belanja.budget)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Realisasi: {formatRp(apbdes.belanja.realized)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Indeks Desa &amp; SDGs
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {indicator ? indicator.idmScore : '-'}
                </div>
                <div className="text-[11px] text-slate-500">
                  SDGs: {indicator ? indicator.sdgsScore : '-'} · Stunting: {indicator?.stuntingCases ?? 0} kasus
                </div>
              </div>
            </section>

            {/* Latest News & UMKM */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Berita &amp; Kegiatan Desa</h2>
                  <button
                    type="button"
                    onClick={() => setTab('berita')}
                    className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
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
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                          {n.category}
                        </span>
                        <span>{new Date(n.publishedAt).toLocaleDateString('id-ID')}</span>
                        <span>· {n.authorName}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{n.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{n.excerpt}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Beli Dari Desa (UMKM)</h2>
                  <button
                    type="button"
                    onClick={() => setTab('belanja')}
                    className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Semua Produk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {umkm.slice(0, 4).map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{item.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.sellerName} · {item.category}
                        </div>
                        <div className="text-xs font-bold font-mono text-emerald-700 mt-1">
                          {formatRp(item.price)} / {item.unit}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Halo ${item.sellerName}, saya ingin memesan ${item.name} dari Portal ${village.name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-9 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center shrink-0"
                      >
                        Pesan WA
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* PROFIL DESA */}
        {tab === 'profil' && (
          <section className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Profil {village.name}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Visi Desa</h2>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{village.vision}</p>
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Misi Desa</h2>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed">{village.mission}</p>
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Sejarah Desa</h2>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed">{village.history}</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
                <h2 className="font-bold text-slate-900">Geografis &amp; Batas Wilayah</h2>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Luas Wilayah</span>
                    <span className="font-mono font-semibold">{village.areaKm2} km²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Batas Utara</span>
                    <span className="font-medium">{village.boundaries?.north}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Batas Timur</span>
                    <span className="font-medium">{village.boundaries?.east}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Batas Selatan</span>
                    <span className="font-medium">{village.boundaries?.south}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Batas Barat</span>
                    <span className="font-medium">{village.boundaries?.west}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PEMERINTAHAN (SOTK) */}
        {tab === 'pemerintah' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Struktur Organisasi &amp; Perangkat Desa (SOTK)</h1>
              <p className="text-sm text-slate-600">Daftar aparatur Pemerintah {village.name}.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officials.map((o: any) => (
                <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-semibold text-emerald-700">{o.position}</div>
                  <div className="text-base font-bold text-slate-900">{o.name}</div>
                  {o.nip && <div className="text-xs font-mono text-slate-500">NIP. {o.nip}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INFOGRAFIS */}
        {tab === 'infografis' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Infografis &amp; Transparansi Desa</h1>
                <p className="text-sm text-slate-600">Data kependudukan, APBDes, Bansos, IDM, Stunting, dan SDGs.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['penduduk', 'Penduduk'],
                    ['apbdes', 'APBDes'],
                    ['bansos', 'Bansos & Cek'],
                    ['indeks', 'IDM, Stunting & SDGs'],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setInfoSub(k)}
                    className={`h-9 px-3.5 rounded-lg text-xs font-semibold border ${
                      infoSub === k
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                    ['Total Penduduk', demographics.totalResidents],
                    ['Kepala Keluarga', demographics.totalHouseholds],
                    ['Laki-laki', demographics.male],
                    ['Perempuan', demographics.female],
                    ['Wajib Pilih', demographics.voters],
                  ].map(([lbl, val]) => (
                    <div key={String(lbl)} className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500">{lbl}</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ['Berdasarkan Dusun', demographics.byDusun],
                    ['Berdasarkan Pendidikan', demographics.byEducation],
                    ['Berdasarkan Pekerjaan', demographics.byOccupation],
                  ].map(([title, list]: any) => (
                    <div key={title} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                      <div className="space-y-2 text-xs">
                        {list.map((row: any) => (
                          <div key={row.label} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-700">{row.label}</span>
                              <span className="font-mono font-semibold">{row.total}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{
                                  width: `${Math.min(100, Math.round((row.total / Math.max(1, demographics.totalResidents)) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoSub === 'apbdes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Total Pendapatan ({apbdes.fiscalYear})</div>
                    <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                      {formatRp(apbdes.pendapatan.budget)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Realisasi: {formatRp(apbdes.pendapatan.realized)}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Total Belanja ({apbdes.fiscalYear})</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {formatRp(apbdes.belanja.budget)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Realisasi: {formatRp(apbdes.belanja.realized)}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Surplus / Defisit Realisasi</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {formatRp(apbdes.surplusDeficit)}
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2.5 px-4">Kategori</th>
                        <th className="py-2.5 px-4">Uraian Pos</th>
                        <th className="py-2.5 px-4 text-right">Anggaran</th>
                        <th className="py-2.5 px-4 text-right">Realisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...apbdes.pendapatan.items, ...apbdes.belanja.items, ...apbdes.pembiayaan.items].map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-4 font-semibold text-slate-700">{item.category}</td>
                          <td className="py-2.5 px-4">
                            <div className="font-medium text-slate-900">{item.label}</div>
                            <div className="text-[11px] text-slate-500">{item.subCategory}</div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono">{formatRp(item.budgetAmount)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                            {formatRp(item.realizedAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {infoSub === 'bansos' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Cek Penerima Bantuan Sosial (Bansos)</h2>
                  <p className="text-xs text-slate-500">
                    Masukkan NIK atau Nama Lengkap untuk memeriksa status kepesertaan PKH, BPNT, atau BLT-DD.
                  </p>
                </div>
                <form onSubmit={handleCheckBansos} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={bansosQuery}
                    onChange={(e) => setBansosQuery(e.target.value)}
                    placeholder="Masukkan NIK (16 digit) atau Nama Lengkap..."
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                  <button
                    type="submit"
                    disabled={bansosLoading}
                    className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>{bansosLoading ? 'Mencari...' : 'Cek Bansos'}</span>
                  </button>
                </form>
                {bansosResults && (
                  bansosResults.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Data penerima bansos tidak ditemukan untuk kata kunci tersebut.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                      {bansosResults.map((b) => (
                        <div key={b.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{b.fullName}</div>
                            <div className="font-mono text-slate-500">NIK: {b.maskedNik} · {b.dusun}</div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                              {b.program} · {b.status}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {b.period} · {formatRp(b.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {infoSub === 'indeks' && indicator && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="text-xs font-semibold uppercase text-emerald-700">Indeks Desa / IDM ({indicator.year})</div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{indicator.idmScore}</div>
                  <div className="text-sm font-semibold text-emerald-800">Status: {indicator.idmStatus}</div>
                  <div className="pt-2 space-y-1.5 text-xs">
                    {(indicator.dimensions || []).map((d: any) => (
                      <div key={d.name} className="flex justify-between">
                        <span className="text-slate-600">{d.name}</span>
                        <span className="font-mono font-semibold">{d.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="text-xs font-semibold uppercase text-emerald-700">Skor SDGs Desa</div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{indicator.sdgsScore}</div>
                  <p className="text-xs text-slate-600">Capaian rata-rata 18 tujuan pembangunan berkelanjutan tingkat desa.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="text-xs font-semibold uppercase text-emerald-700">Pemantauan Stunting</div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{indicator.stuntingCases} Kasus</div>
                  <div className="text-xs text-slate-600">Prevalensi tercatat: {indicator.stuntingRate}% (pantauan Posyandu).</div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* LAYANAN SURAT MANDIRI */}
        {tab === 'layanan' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Pengajuan Surat Mandiri (Permendagri 109/2019)</h1>
                <p className="text-xs text-slate-500">Isi data di bawah ini; perangkat desa akan memproses dan mengirim notifikasi WhatsApp saat surat selesai.</p>
              </div>
              {letterCreated && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Pengajuan Surat Berhasil Tercatat
                  </div>
                  <div>
                    Kode Pelacakan Anda: <strong className="font-mono">{letterCreated.trackingCode}</strong> (simpan untuk cek status).
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmitLetter} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Surat</label>
                  <select
                    value={letterForm.letterType}
                    onChange={(e) => setLetterForm({ ...letterForm, letterType: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {letterTypes.map((lt: any) => (
                      <option key={lt.code} value={lt.code}>{lt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIK Pemohon *</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={letterForm.applicantName}
                      onChange={(e) => setLetterForm({ ...letterForm, applicantName: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Keperluan Surat *</label>
                  <textarea
                    rows={3}
                    required
                    value={letterForm.purpose}
                    onChange={(e) => setLetterForm({ ...letterForm, purpose: e.target.value })}
                    placeholder="Contoh: Persyaratan pendaftaran beasiswa sekolah / pengajuan KUR UMKM..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={letterSubmitting}
                  className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
                >
                  {letterSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Surat'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit">
              <h2 className="text-base font-bold text-slate-900">Lacak Status Pengajuan Surat</h2>
              <form onSubmit={handleTrackLetter} className="flex gap-2">
                <input
                  type="text"
                  value={letterTrackCode}
                  onChange={(e) => setLetterTrackCode(e.target.value)}
                  placeholder="SRT-2611-XXXXXX"
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <button type="submit" className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold">
                  Lacak
                </button>
              </form>
              {letterTrackErr && <div className="text-xs text-rose-700">{letterTrackErr}</div>}
              {letterTrackResult && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{letterTrackResult.applicantName}</div>
                  <div>Jenis: <strong>{letterTrackResult.letterType}</strong></div>
                  <div>Status: <span className="font-mono font-bold text-emerald-700">{letterTrackResult.status}</span></div>
                  {letterTrackResult.letterNumber && (
                    <div>Nomor Surat: <span className="font-mono">{letterTrackResult.letterNumber}</span></div>
                  )}
                  {letterTrackResult.adminNotes && (
                    <div className="text-slate-600">Catatan: {letterTrackResult.adminNotes}</div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* BERITA */}
        {tab === 'berita' && (
          <section className="space-y-5">
            {selectedNews ? (
              <article className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 max-w-3xl">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  &larr; Kembali ke Daftar Berita
                </button>
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    {selectedNews.category}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedNews.title}</h1>
                  <div className="text-xs text-slate-500">
                    {new Date(selectedNews.publishedAt).toLocaleDateString('id-ID')} · {selectedNews.authorName}
                  </div>
                </div>
                <div className="text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedNews.content}
                </div>
              </article>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Berita &amp; Kegiatan Desa</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestNews.map((n: any) => (
                    <article
                      key={n.id}
                      onClick={() => setSelectedNews(n)}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 cursor-pointer space-y-2"
                    >
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                        {n.category}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{n.title}</h2>
                      <p className="text-sm text-slate-600">{n.excerpt}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* BELANJA / UMKM */}
        {tab === 'belanja' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Beli Dari Desa — Lapak UMKM Warga</h1>
              <p className="text-sm text-slate-600">Dukung ekonomi lokal dengan memesan langsung ke pelaku UMKM desa.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {umkm.map((item: any) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {item.category}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <div className="text-sm font-bold font-mono text-emerald-700">
                      {formatRp(item.price)} / {item.unit}
                    </div>
                    <div className="text-xs text-slate-500">Penjual: {item.sellerName}</div>
                  </div>
                  <a
                    href={`https://wa.me/${String(item.sellerPhone).replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Halo ${item.sellerName}, saya ingin memesan ${item.name}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pesan via WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PPID (UU KIP) */}
        {tab === 'ppid' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Portal PPID Desa (UU KIP)</h1>
                <p className="text-xs text-slate-500">Pejabat Pengelola Informasi dan Dokumentasi — Informasi Berkala, Serta-Merta, Setiap Saat &amp; Dasar Hukum.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ['', 'Semua'],
                  ['BERKALA', 'Berkala'],
                  ['SERTA_MERTA', 'Serta-Merta'],
                  ['SETIAP_SAAT', 'Setiap Saat'],
                  ['DASAR_HUKUM', 'Dasar Hukum'],
                ].map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPpidCat(val)}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold border ${
                      ppidCat === val ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <div className="space-y-2.5">
                {filteredPpid.map((doc) => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">{doc.category}</span>
                      <span className="font-mono text-slate-500">{doc.documentNumber || doc.year}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-xs text-slate-600">{doc.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3 h-fit text-xs">
              <h2 className="text-base font-bold text-slate-900">Form Permohonan Informasi Publik</h2>
              {ppidCreated && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  Permohonan tercatat! Tiket: <strong className="font-mono">{ppidCreated.ticketCode}</strong>
                </div>
              )}
              <form onSubmit={handleSubmitPpid} className="space-y-2.5">
                <input type="text" required placeholder="Nama Pemohon *" value={ppidForm.requesterName} onChange={(e) => setPpidForm({ ...ppidForm, requesterName: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-300" />
                <input type="text" required placeholder="NIK *" value={ppidForm.requesterNik} onChange={(e) => setPpidForm({ ...ppidForm, requesterNik: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono" />
                <input type="tel" required placeholder="Nomor WhatsApp *" value={ppidForm.requesterPhone} onChange={(e) => setPpidForm({ ...ppidForm, requesterPhone: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono" />
                <textarea rows={3} required placeholder="Rincian informasi yang dimohon *" value={ppidForm.informationNeeded} onChange={(e) => setPpidForm({ ...ppidForm, informationNeeded: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300" />
                <input type="text" required placeholder="Tujuan penggunaan informasi *" value={ppidForm.purpose} onChange={(e) => setPpidForm({ ...ppidForm, purpose: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-slate-300" />
                <button type="submit" disabled={ppidSubmitting} className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  {ppidSubmitting ? 'Mengirim...' : 'Ajukan Permohonan PPID'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* PENGADUAN WARGA */}
        {tab === 'pengaduan' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h1 className="text-xl font-bold text-slate-900">Pengaduan Masyarakat Online</h1>
              {complaintCreated && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  Pengaduan diterima! Kode Tiket: <strong className="font-mono">{complaintCreated.ticketCode}</strong>
                </div>
              )}
              <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder="Nama Pelapor *" value={complaintForm.reporterName} onChange={(e) => setComplaintForm({ ...complaintForm, reporterName: e.target.value })} className="h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                  <input type="tel" required placeholder="Nomor WhatsApp *" value={complaintForm.reporterPhone} onChange={(e) => setComplaintForm({ ...complaintForm, reporterPhone: e.target.value })} className="h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })} className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm">
                    <option value="Infrastruktur">Infrastruktur &amp; Jalan</option>
                    <option value="Pelayanan">Pelayanan Publik</option>
                    <option value="Bansos">Bantuan Sosial</option>
                    <option value="Lingkungan">Kebersihan &amp; Lingkungan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <input type="text" placeholder="Lokasi kejadian (Dusun / RT)" value={complaintForm.location} onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })} className="h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                </div>
                <textarea rows={4} required placeholder="Tuliskan detail laporan atau aspirasi Anda *" value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} className="w-full p-3 rounded-lg border border-slate-300 text-sm" />
                <button type="submit" disabled={complaintSubmitting} className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
                  {complaintSubmitting ? 'Mengirim...' : 'Kirim Pengaduan'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3 h-fit">
              <h2 className="text-base font-bold text-slate-900">Lacak Tiket Pengaduan</h2>
              <form onSubmit={handleTrackComplaint} className="flex gap-2">
                <input type="text" value={complaintTrackCode} onChange={(e) => setComplaintTrackCode(e.target.value)} placeholder="ADU-2611-XXXXXX" className="flex-1 h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs" />
                <button type="submit" className="h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold">Lacak</button>
              </form>
              {complaintTrackErr && <div className="text-xs text-rose-700">{complaintTrackErr}</div>}
              {complaintTrackResult && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{complaintTrackResult.category}</div>
                  <div>Status: <strong className="font-mono text-emerald-700">{complaintTrackResult.status}</strong></div>
                  <p className="text-slate-600">{complaintTrackResult.description}</p>
                  {complaintTrackResult.responseText && (
                    <div className="pt-1 border-t border-slate-200 text-emerald-800">
                      Tanggapan Desa: {complaintTrackResult.responseText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PETA, POTENSI & WISATA */}
        {tab === 'peta' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Peta Lokasi (POI), Potensi &amp; Wisata Desa</h1>
              <p className="text-sm text-slate-600">Titik fasilitas umum, potensi unggulan, dan destinasi wisata {village.name}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((pl: any) => (
                <div key={pl.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">{pl.kind}</span>
                    <span className="text-slate-500">{pl.category}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{pl.title}</h2>
                  <p className="text-xs text-slate-600">{pl.description}</p>
                  {pl.address && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{pl.address}</span>
                    </div>
                  )}
                  {pl.lat && pl.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${pl.lat},${pl.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Buka di Google Maps &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <div className="text-sm font-bold text-white">{village.name}</div>
            <p className="text-slate-400">{village.address}</p>
          </div>
          <div className="space-y-1.5">
            <div className="font-semibold text-white">Kontak Kantor Desa</div>
            {village.phone && (
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5" /> {village.phone}
              </div>
            )}
            {village.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {village.email}
              </div>
            )}
          </div>
          <div className="md:text-right space-y-1.5">
            <div className="font-semibold text-white">Reneo SIDesa</div>
            <div className="text-slate-400">Sistem Informasi &amp; Portal Digital Pemerintahan Desa</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

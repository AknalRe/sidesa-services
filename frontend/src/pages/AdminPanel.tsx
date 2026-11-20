import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Edit3,
  FileText,
  Globe,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareWarning,
  Newspaper,
  Plus,
  Printer,
  Scale,
  ShoppingBag,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import { api } from '../services/api';
import { ReneoSidesaLogo } from '../components/ReneoSidesaLogo';

type AdminTab =
  | 'dashboard'
  | 'profile'
  | 'news'
  | 'letters'
  | 'residents'
  | 'apbdes'
  | 'bansos'
  | 'pbb'
  | 'officials'
  | 'umkm'
  | 'places'
  | 'indicators'
  | 'ppid'
  | 'complaints'
  | 'attendance';

const MENU: Array<{ id: AdminTab; label: string; icon: React.ComponentType<any> }> = [
  { id: 'dashboard', label: 'Dashboard Desa', icon: LayoutDashboard },
  { id: 'profile', label: 'Profil & Banner Desa', icon: Building2 },
  { id: 'news', label: 'Artikel & Berita Blog', icon: Newspaper },
  { id: 'letters', label: 'Pelayanan Surat', icon: FileText },
  { id: 'residents', label: 'Data Penduduk', icon: Users },
  { id: 'apbdes', label: 'Keuangan APBDes', icon: Wallet },
  { id: 'bansos', label: 'Bantuan Sosial', icon: HeartHandshake },
  { id: 'pbb', label: 'Pajak PBB-P2', icon: Wallet },
  { id: 'officials', label: 'Perangkat (SOTK)', icon: Building2 },
  { id: 'umkm', label: 'Produk UMKM Desa', icon: ShoppingBag },
  { id: 'places', label: 'Peta, Potensi & Galeri', icon: MapPin },
  { id: 'indicators', label: 'IDM, SDGs & Stunting', icon: BarChart3 },
  { id: 'ppid', label: 'Dokumen & Tiket PPID', icon: Scale },
  { id: 'complaints', label: 'Pengaduan Warga', icon: MessageSquareWarning },
  { id: 'attendance', label: 'Absensi & Buku Tamu', icon: ClipboardCheck },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

export const AdminPanel: React.FC<{
  onBackToPortal: (slug?: string) => void;
  onBackToLanding?: () => void;
}> = ({ onBackToPortal, onBackToLanding }) => {
  const [auth, setAuth] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    villageName: '',
    slug: '',
    district: '',
    regency: '',
    province: 'Jawa Timur',
    kodeDesa: '',
  });
  const [authErr, setAuthErr] = useState<string | null>(null);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [letters, setLetters] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [apbdes, setApbdes] = useState<any[]>([]);
  const [bansos, setBansos] = useState<any[]>([]);
  const [pbb, setPbb] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [umkm, setUmkm] = useState<any[]>([]);
  const [officials, setOfficials] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [ppidData, setPpidData] = useState<{ documents: any[]; requests: any[] }>({ documents: [], requests: [] });
  const [indicatorForm, setIndicatorForm] = useState({
    year: new Date().getFullYear(),
    idmScore: 0.7845,
    idmStatus: 'MAJU',
    sdgsScore: 76.4,
    stuntingCases: 4,
    stuntingRate: 2.1,
  });
  const [attendance, setAttendance] = useState<any[]>([]);
  const [village, setVillage] = useState<any>(null);
  const [printLetter, setPrintLetter] = useState<any | null>(null);

  // Quick create forms
  const [newResident, setNewResident] = useState({
    nik: '',
    kkNumber: '',
    fullName: '',
    gender: 'L',
    dusun: 'Dusun Krajan',
    rt: '001',
    rw: '001',
    education: 'SLTA/Sederajat',
    occupation: 'Petani/Pekebun',
  });
  const [newApbdes, setNewApbdes] = useState({
    fiscalYear: new Date().getFullYear(),
    category: 'BELANJA',
    subCategory: 'Bidang Pembangunan Desa',
    label: '',
    budgetAmount: 0,
    realizedAmount: 0,
  });
  const [newBansos, setNewBansos] = useState({
    nik: '',
    fullName: '',
    program: 'BLT-DD',
    period: `Tahun ${new Date().getFullYear()}`,
    amount: 900000,
    dusun: 'Dusun Krajan',
  });
  const [newPbb, setNewPbb] = useState({
    nop: '',
    taxpayerName: '',
    dusun: 'Dusun Krajan',
    fiscalYear: new Date().getFullYear(),
    taxAmount: 100000,
  });
  const [newNews, setNewNews] = useState({
    title: '',
    category: 'Kegiatan Desa',
    excerpt: '',
    coverUrl: '',
    content: '',
  });
  const [newUmkm, setNewUmkm] = useState({
    name: '',
    category: 'Kuliner',
    price: 25000,
    unit: 'pcs',
    sellerName: '',
    sellerPhone: '',
    imageUrl: '',
    description: '',
  });
  const [newOfficial, setNewOfficial] = useState({
    name: '',
    position: '',
    nip: '',
    phone: '',
    photoUrl: '',
    sortOrder: 10,
  });
  const [newPlace, setNewPlace] = useState({
    kind: 'POI',
    title: '',
    category: 'Fasilitas Umum',
    address: '',
    lat: '-7.2010',
    lng: '112.0220',
    imageUrl: '',
    description: '',
  });
  const [newPpidDoc, setNewPpidDoc] = useState({
    category: 'BERKALA',
    title: '',
    documentNumber: '',
    year: new Date().getFullYear(),
    fileUrl: '',
    summary: '',
  });
  const [newAttendance, setNewAttendance] = useState({
    kind: 'APARATUR',
    personName: '',
    roleOrOrigin: '',
    purpose: '',
  });

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const status = await api.getAuthStatus();
      setAuth(status);
      if (status.authenticated) {
        const [dash, v] = await Promise.all([api.getDashboard(), api.getVillageProfile()]);
        setDashboard(dash);
        setVillage(v);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const loadTab = async (t: AdminTab) => {
    setTab(t);
    if (t === 'dashboard') setDashboard(await api.getDashboard());
    else if (t === 'letters') setLetters(await api.getLetters());
    else if (t === 'residents') setResidents(await api.getResidents());
    else if (t === 'apbdes') setApbdes(await api.getApbdes());
    else if (t === 'bansos') setBansos(await api.getBansos());
    else if (t === 'pbb') setPbb(await api.getPbb());
    else if (t === 'complaints') setComplaints(await api.getComplaints());
    else if (t === 'news') setNews(await api.getNewsAdmin());
    else if (t === 'umkm') setUmkm(await api.getUmkmAdmin());
    else if (t === 'officials') setOfficials(await api.getOfficials());
    else if (t === 'places') setPlaces(await api.getPlacesAdmin());
    else if (t === 'ppid') setPpidData(await api.getPpidAdmin());
    else if (t === 'indicators') {
      const rows = await api.getIndicatorsAdmin();
      if (rows && rows[0]) {
        setIndicatorForm({
          year: rows[0].year,
          idmScore: rows[0].idmScore,
          idmStatus: rows[0].idmStatus,
          sdgsScore: rows[0].sdgsScore,
          stuntingCases: rows[0].stuntingCases,
          stuntingRate: rows[0].stuntingRate,
        });
      }
    } else if (t === 'attendance') setAttendance(await api.getAttendance());
    else if (t === 'profile') setVillage(await api.getVillageProfile());
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr(null);
    try {
      if (authMode === 'login') {
        await api.login({ email: authForm.email.trim(), password: authForm.password });
      } else if (!auth?.initialized) {
        await api.setupAdmin(authForm);
      } else {
        await api.registerVillage(authForm);
      }
      await checkAuth();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Autentikasi gagal.';
      if (err?.response?.status === 409 || msg.toLowerCase().includes('sudah diinisialisasi')) {
        setAuthMode('login');
        setAuthErr('Akun admin desa sudah terdaftar. Silakan masukkan email dan kata sandi Anda.');
      } else {
        setAuthErr(msg);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
        Memuat Back-Office Pemerintahan Desa...
      </div>
    );
  }

  if (!auth?.authenticated) {
    const isRegister = authMode === 'register';
    const currentHost =
      typeof window !== 'undefined' && window.location.host ? window.location.host : 'panel.reneo.my.id';
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-xs p-5 sm:p-6 space-y-5">
          {/* Header seperti Reneo CRM */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <ReneoSidesaLogo className="w-7 h-7 shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate">Reneo SIDesa</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 truncate">{currentHost}</span>
          </div>

          {/* Tab Switcher — SELALU tampil (Masuk & Daftar) seperti Reneo CRM */}
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthErr(null);
              }}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-center ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk ke Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthErr(null);
              }}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-center ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {auth?.initialized ? 'Daftar Desa Baru' : 'Daftar / Setup Awal'}
            </button>
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-slate-900">
              {authMode === 'login'
                ? 'Masuk Back-Office Perangkat Desa'
                : auth?.initialized
                  ? 'Daftarkan Desa Baru di Reneo SIDesa'
                  : 'Setup Awal Admin Reneo SIDesa'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {authMode === 'login'
                ? 'Masukkan email dan kata sandi perangkat desa untuk mengelola website profil desa, kependudukan, persuratan, dan APBDes.'
                : auth?.initialized
                  ? 'Daftarkan desa Anda untuk mendapatkan website resmi desa (/desa/nama-desa) dan ruang kerja Back-Office terpisah.'
                  : 'Buat akun admin pertama untuk mulai mengelola CMS Website Profil Desa, Artikel Berita, Kependudukan, dan APBDes.'}
            </p>
          </div>

          {authErr && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {authErr}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
            {isRegister && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Desa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Desa Sugihwaras"
                      value={authForm.villageName}
                      onChange={(e) => setAuthForm({ ...authForm, villageName: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug URL (/desa/...) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: sugihwaras"
                      value={authForm.slug}
                      onChange={(e) => setAuthForm({ ...authForm, slug: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:border-[#0069b6]"
                    />
                  </div>
                </div>
                {auth?.initialized && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Kecamatan *"
                      value={authForm.district}
                      onChange={(e) => setAuthForm({ ...authForm, district: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Kabupaten *"
                      value={authForm.regency}
                      onChange={(e) => setAuthForm({ ...authForm, regency: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
                    />
                    <input
                      type="text"
                      placeholder="Kode Desa"
                      value={authForm.kodeDesa}
                      onChange={(e) => setAuthForm({ ...authForm, kodeDesa: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:border-[#0069b6]"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Admin / Perangkat Desa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Perangkat Desa"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Perangkat Desa *</label>
              <input
                type="email"
                required
                placeholder="admin@desa.id"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kata Sandi *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0069b6]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold transition-colors"
            >
              {authMode === 'login'
                ? 'Masuk ke Back-Office Desa'
                : auth?.initialized
                  ? 'Daftarkan Desa & Buat Website'
                  : 'Simpan & Buat Akun Admin'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 text-center">
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthErr(null);
                }}
                className="text-xs text-[#0069b6] hover:text-[#0B2A57] font-semibold transition-colors"
              >
                {auth?.initialized
                  ? 'Belum punya akun? Daftarkan desa baru di sini'
                  : 'Belum setup akun? Daftar / Setup awal di sini'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthErr(null);
                }}
                className="text-xs text-[#0069b6] hover:text-[#0B2A57] font-semibold transition-colors"
              >
                Sudah punya akun perangkat desa? Masuk di sini
              </button>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  &larr; Beranda Platform SIDesa
                </button>
              )}
              <button
                type="button"
                onClick={() => onBackToPortal(auth?.village?.slug || 'sugihwaras')}
                className="text-xs text-slate-500 hover:text-[#0069b6] font-medium ml-auto"
              >
                Lihat Website Desa &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeSlug = village?.slug || auth?.village?.slug || 'sugihwaras';

  return (
    <div className="min-h-screen w-full bg-[#F6F6F6] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="no-print lg:w-64 bg-[#0B2A57] text-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <ReneoSidesaLogo className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-white truncate">{village?.name || 'Reneo SIDesa'}</div>
            <div className="text-[11px] font-mono text-emerald-300 truncate">/desa/{activeSlug}</div>
          </div>
        </div>

        <nav className="p-2.5 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto flex-1">
          {MENU.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => void loadTab(m.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2.5 shrink-0 transition-colors ${
                  tab === m.id ? 'bg-[#0069b6] text-white shadow-xs' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex lg:flex-col gap-2">
          <button
            type="button"
            onClick={() => onBackToPortal(activeSlug)}
            className="flex-1 h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-slate-950 inline-flex items-center justify-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Buka /desa/{activeSlug}</span>
          </button>
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex-1 h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5"
            >
              <span>Beranda Platform SaaS</span>
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await api.logout();
              await checkAuth();
            }}
            className="h-9 px-3 rounded-xl border border-white/15 hover:bg-white/10 text-xs text-slate-300 inline-flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar ({auth.user?.name})</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
        {/* Print Letter Modal */}
        {printLetter && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setPrintLetter(null)}
          >
            <div
              className="bg-white max-w-2xl w-full rounded-2xl p-8 space-y-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <div className="text-xs font-semibold uppercase">Pemerintah Kabupaten {village?.regency}</div>
                <div className="text-xs font-semibold uppercase">Kecamatan {village?.district}</div>
                <div className="text-lg font-bold uppercase">{village?.name}</div>
                <div className="text-[11px] text-slate-600">{village?.address}</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold underline uppercase">
                  SURAT KETERANGAN ({printLetter.letterType})
                </div>
                <div className="text-xs font-mono">Nomor: {printLetter.letterNumber || 'Belum bernomor'}</div>
              </div>
              <div className="text-sm leading-relaxed space-y-2">
                <p>
                  Yang bertanda tangan di bawah ini, {village?.headTitle || 'Kepala Desa'} {village?.name}, menerangkan
                  dengan sebenarnya bahwa:
                </p>
                <div className="pl-4 space-y-1 text-xs">
                  <div>
                    Nama Lengkap : <strong>{printLetter.applicantName}</strong>
                  </div>
                  <div>
                    NIK : <span className="font-mono">{printLetter.applicantNik}</span>
                  </div>
                  <div>Keperluan : {printLetter.purpose}</div>
                </div>
                <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
              </div>
              <div className="flex justify-end pt-4 text-xs text-center">
                <div className="w-48 space-y-12">
                  <div>
                    <div>
                      {village?.name},{' '}
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="font-semibold">{village?.headTitle || 'Kepala Desa'}</div>
                  </div>
                  <div className="font-bold underline">{village?.headName}</div>
                </div>
              </div>
              <div className="no-print pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPrintLetter(null)}
                  className="h-9 px-4 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-9 px-4 rounded-lg bg-[#0069b6] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. DASHBOARD */}
        {tab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase text-[#0069b6]">CMS &amp; Back-Office Pemerintahan Desa</div>
                <h1 className="text-2xl font-extrabold text-slate-900">{village?.name}</h1>
                <p className="text-xs text-slate-500">
                  Path Website Resmi Desa: <strong className="font-mono text-[#0069b6]">/desa/{activeSlug}</strong> ·
                  Seluruh data yang Anda input di bawah langsung tampil di portal publik desa.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadTab('news')}
                  className="h-10 px-4 rounded-xl bg-[#0069b6] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Newspaper className="w-4 h-4" />
                  <span>+ Tulis Artikel / Berita</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBackToPortal(activeSlug)}
                  className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4 text-[#0069b6]" />
                  <span>Lihat Website Desa</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-2xs">
                <div className="text-xs text-slate-500">Penduduk Terdata</div>
                <div className="text-2xl font-extrabold font-mono mt-1">{dashboard.demographics.totalResidents}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-2xs">
                <div className="text-xs text-slate-500">Permohonan Surat Baru</div>
                <div className="text-2xl font-extrabold font-mono text-amber-600 mt-1">{dashboard.pendingLetters}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-2xs">
                <div className="text-xs text-slate-500">Pengaduan Aktif</div>
                <div className="text-2xl font-extrabold font-mono text-rose-600 mt-1">{dashboard.openComplaints}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-2xs">
                <div className="text-xs text-slate-500">Realisasi PBB-P2</div>
                <div className="text-base font-extrabold font-mono text-emerald-700 mt-1">
                  {formatRp(dashboard.pbb.paidAmount)} / {formatRp(dashboard.pbb.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFIL, SEJARAH, BATAS WILAYAH & BANNER DESA */}
        {tab === 'profile' && village && (
          <div className="space-y-4 max-w-4xl">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Profil, Sejarah &amp; Visual Desa</h1>
              <p className="text-xs text-slate-500">
                Ubah identitas desa, slug URL (<span className="font-mono">/desa/{village.slug}</span>), sambutan Kepala
                Desa, sejarah, batas wilayah, hingga foto banner hero.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const updated = await api.updateVillageProfile(village);
                setVillage({
                  ...updated,
                  boundaries: village.boundaries,
                });
                alert('Profil dan tampilan desa berhasil diperbarui!');
              }}
              className="bg-white rounded-2xl shadow-2xs p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nama Desa *</label>
                  <input
                    required
                    value={village.name || ''}
                    onChange={(e) => setVillage({ ...village, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Slug Path URL (/desa/:slug) *</label>
                  <input
                    required
                    value={village.slug || ''}
                    onChange={(e) => setVillage({ ...village, slug: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kode Wilayah Kemendagri</label>
                  <input
                    value={village.kodeDesa || ''}
                    onChange={(e) => setVillage({ ...village, kodeDesa: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kecamatan</label>
                  <input
                    value={village.district || ''}
                    onChange={(e) => setVillage({ ...village, district: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kabupaten / Kota</label>
                  <input
                    value={village.regency || ''}
                    onChange={(e) => setVillage({ ...village, regency: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Provinsi</label>
                  <input
                    value={village.province || ''}
                    onChange={(e) => setVillage({ ...village, province: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Nama Kepala Desa</label>
                  <input
                    value={village.headName || ''}
                    onChange={(e) => setVillage({ ...village, headName: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telepon / WhatsApp Balai Desa</label>
                  <input
                    value={village.phone || ''}
                    onChange={(e) => setVillage({ ...village, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Luas Wilayah (km²)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={village.areaKm2 ?? 0}
                    onChange={(e) => setVillage({ ...village, areaKm2: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">URL Lambang Kabupaten / Logo Desa (opsional)</label>
                  <input
                    placeholder="https://..."
                    value={village.logoUrl || ''}
                    onChange={(e) => setVillage({ ...village, logoUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">URL Foto Banner Hero Utama (opsional)</label>
                  <input
                    placeholder="https://..."
                    value={village.heroImageUrl || ''}
                    onChange={(e) => setVillage({ ...village, heroImageUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Alamat Lengkap Kantor Balai Desa</label>
                <input
                  value={village.address || ''}
                  onChange={(e) => setVillage({ ...village, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold mb-1">Batas Utara</label>
                  <input
                    value={village.boundaries?.north || ''}
                    onChange={(e) =>
                      setVillage({ ...village, boundaries: { ...village.boundaries, north: e.target.value } })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Batas Timur</label>
                  <input
                    value={village.boundaries?.east || ''}
                    onChange={(e) =>
                      setVillage({ ...village, boundaries: { ...village.boundaries, east: e.target.value } })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Batas Selatan</label>
                  <input
                    value={village.boundaries?.south || ''}
                    onChange={(e) =>
                      setVillage({ ...village, boundaries: { ...village.boundaries, south: e.target.value } })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Batas Barat</label>
                  <input
                    value={village.boundaries?.west || ''}
                    onChange={(e) =>
                      setVillage({ ...village, boundaries: { ...village.boundaries, west: e.target.value } })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Sambutan Kepala Desa</label>
                <textarea
                  rows={3}
                  value={village.headGreeting || ''}
                  onChange={(e) => setVillage({ ...village, headGreeting: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Visi Desa</label>
                <textarea
                  rows={2}
                  value={village.vision || ''}
                  onChange={(e) => setVillage({ ...village, vision: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Misi Desa (pisahkan baris per poin)</label>
                <textarea
                  rows={4}
                  value={village.mission || ''}
                  onChange={(e) => setVillage({ ...village, mission: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Sejarah Desa</label>
                <textarea
                  rows={4}
                  value={village.history || ''}
                  onChange={(e) => setVillage({ ...village, history: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold"
              >
                Simpan Perubahan Profil Desa
              </button>
            </form>
          </div>
        )}

        {/* 3. ARTIKEL, BERITA & BLOG DESA (DENGAN FOTO SAMPUL & EDIT) */}
        {tab === 'news' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Artikel, Berita &amp; Blog Desa</h1>
              <p className="text-xs text-slate-500">
                Artikel yang diterbitkan otomatis muncul di Hero Carousel Beranda serta halaman Berita Website Desa.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingNewsId) {
                  await api.updateNews(editingNewsId, newNews);
                  setEditingNewsId(null);
                } else {
                  await api.createNews(newNews);
                }
                setNewNews({ title: '', category: 'Kegiatan Desa', excerpt: '', coverUrl: '', content: '' });
                setNews(await api.getNewsAdmin());
              }}
              className="bg-white rounded-2xl shadow-2xs p-6 space-y-3 text-xs"
            >
              <div className="text-sm font-extrabold text-[#0069b6]">
                {editingNewsId ? 'Edit Artikel / Berita Desa' : 'Tulis Artikel / Berita Baru'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Judul Artikel / Berita *"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  className="sm:col-span-2 h-10 px-3 rounded-xl border border-slate-300 text-sm"
                />
                <input
                  placeholder="Kategori (mis. Kegiatan Desa / Pertanian / Pengumuman)"
                  value={newNews.category}
                  onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="URL Foto Sampul / Thumbnail Artikel (https://...)"
                  value={newNews.coverUrl}
                  onChange={(e) => setNewNews({ ...newNews, coverUrl: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <input
                  placeholder="Ringkasan singkat (opsional, otomatis diambil dari paragraf awal)"
                  value={newNews.excerpt}
                  onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>
              <textarea
                required
                rows={6}
                placeholder="Tulis isi lengkap artikel atau berita kegiatan desa di sini *"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm leading-relaxed"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#0069b6] hover:bg-[#005a9e] text-white text-sm font-bold"
                >
                  {editingNewsId ? 'Simpan Perubahan Artikel' : 'Terbitkan Artikel'}
                </button>
                {editingNewsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewNews({ title: '', category: 'Kegiatan Desa', excerpt: '', coverUrl: '', content: '' });
                    }}
                    className="h-10 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {news.map((n) => (
                <div key={n.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900">{n.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0069b6] font-bold mr-2">{n.category}</span>
                      {new Date(n.publishedAt).toLocaleDateString('id-ID')} · Oleh {n.authorName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNewsId(n.id);
                        setNewNews({
                          title: n.title,
                          category: n.category,
                          excerpt: n.excerpt || '',
                          coverUrl: n.coverUrl || '',
                          content: n.content || '',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.deleteNews(n.id);
                        setNews(await api.getNewsAdmin());
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PELAYANAN SURAT */}
        {tab === 'letters' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Pelayanan &amp; Persuratan Desa</h1>
            <div className="bg-white rounded-2xl shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Kode / Nomor Surat</th>
                    <th className="py-3 px-4">Pemohon</th>
                    <th className="py-3 px-4">Jenis &amp; Keperluan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {letters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Belum ada pengajuan surat warga.
                      </td>
                    </tr>
                  ) : (
                    letters.map((l) => (
                      <tr key={l.id}>
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold">{l.trackingCode}</div>
                          {l.letterNumber && <div className="text-[11px] text-[#0069b6]">{l.letterNumber}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold">{l.applicantName}</div>
                          <div className="font-mono text-slate-500">{l.applicantNik}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold">{l.letterType}</div>
                          <div className="text-slate-600">{l.purpose}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">{l.status}</td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {l.status !== 'SELESAI' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await api.updateLetter(l.id, { status: 'SELESAI' });
                                setLetters(await api.getLetters());
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Setujui &amp; Terbitkan Nomor
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrintLetter(l)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold"
                          >
                            Cetak
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DATA PENDUDUK */}
        {tab === 'residents' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Administrasi Kependudukan (Permendagri 47/2016)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createResident(newResident);
                setNewResident({
                  nik: '',
                  kkNumber: '',
                  fullName: '',
                  gender: 'L',
                  dusun: 'Dusun Krajan',
                  rt: '001',
                  rw: '001',
                  education: 'SLTA/Sederajat',
                  occupation: 'Petani/Pekebun',
                });
                setResidents(await api.getResidents());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs"
            >
              <input
                required
                placeholder="NIK *"
                value={newResident.nik}
                onChange={(e) => setNewResident({ ...newResident, nik: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                required
                placeholder="No. KK *"
                value={newResident.kkNumber}
                onChange={(e) => setNewResident({ ...newResident, kkNumber: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                required
                placeholder="Nama Lengkap *"
                value={newResident.fullName}
                onChange={(e) => setNewResident({ ...newResident, fullName: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <select
                value={newResident.gender}
                onChange={(e) => setNewResident({ ...newResident, gender: e.target.value })}
                className="h-10 px-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <input
                placeholder="Dusun"
                value={newResident.dusun}
                onChange={(e) => setNewResident({ ...newResident, dusun: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                placeholder="Pendidikan"
                value={newResident.education}
                onChange={(e) => setNewResident({ ...newResident, education: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                placeholder="Pekerjaan"
                value={newResident.occupation}
                onChange={(e) => setNewResident({ ...newResident, occupation: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <button
                type="submit"
                className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold inline-flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">NIK / KK</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">L/P</th>
                    <th className="py-3 px-4">Dusun / RT-RW</th>
                    <th className="py-3 px-4">Pendidikan &amp; Pekerjaan</th>
                    <th className="py-3 px-4 text-right">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {residents.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-4 font-mono">
                        {r.nik}
                        <div className="text-[10px] text-slate-400">KK {r.kkNumber}</div>
                      </td>
                      <td className="py-2.5 px-4 font-bold">{r.fullName}</td>
                      <td className="py-2.5 px-4">{r.gender}</td>
                      <td className="py-2.5 px-4">
                        {r.dusun} RT {r.rt}/{r.rw}
                      </td>
                      <td className="py-2.5 px-4">
                        {r.education} · {r.occupation}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            await api.deleteResident(r.id);
                            setResidents(await api.getResidents());
                          }}
                          className="text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. APBDES */}
        {tab === 'apbdes' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Pengelolaan Anggaran APBDes</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createApbdes(newApbdes);
                setNewApbdes({ ...newApbdes, label: '', budgetAmount: 0, realizedAmount: 0 });
                setApbdes(await api.getApbdes());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs"
            >
              <input
                type="number"
                value={newApbdes.fiscalYear}
                onChange={(e) => setNewApbdes({ ...newApbdes, fiscalYear: Number(e.target.value) })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <select
                value={newApbdes.category}
                onChange={(e) => setNewApbdes({ ...newApbdes, category: e.target.value })}
                className="h-10 px-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="PENDAPATAN">PENDAPATAN</option>
                <option value="BELANJA">BELANJA</option>
                <option value="PEMBIAYAAN">PEMBIAYAAN</option>
              </select>
              <input
                required
                placeholder="Uraian Pos Anggaran *"
                value={newApbdes.label}
                onChange={(e) => setNewApbdes({ ...newApbdes, label: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                type="number"
                placeholder="Pagu Anggaran"
                value={newApbdes.budgetAmount}
                onChange={(e) => setNewApbdes({ ...newApbdes, budgetAmount: Number(e.target.value) })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                type="number"
                placeholder="Realisasi"
                value={newApbdes.realizedAmount}
                onChange={(e) => setNewApbdes({ ...newApbdes, realizedAmount: Number(e.target.value) })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <button type="submit" className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold">
                Tambah Pos
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tahun</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Uraian</th>
                    <th className="py-3 px-4 text-right">Anggaran</th>
                    <th className="py-3 px-4 text-right">Realisasi</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apbdes.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2.5 px-4 font-mono">{a.fiscalYear}</td>
                      <td className="py-2.5 px-4 font-bold">{a.category}</td>
                      <td className="py-2.5 px-4">{a.label}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatRp(a.budgetAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-bold">
                        {formatRp(a.realizedAmount)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            await api.deleteApbdes(a.id);
                            setApbdes(await api.getApbdes());
                          }}
                          className="text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. BANSOS */}
        {tab === 'bansos' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Penerima Bantuan Sosial (Bansos)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createBansos(newBansos);
                setNewBansos({ ...newBansos, nik: '', fullName: '' });
                setBansos(await api.getBansos());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs"
            >
              <input
                required
                placeholder="NIK *"
                value={newBansos.nik}
                onChange={(e) => setNewBansos({ ...newBansos, nik: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                required
                placeholder="Nama Penerima *"
                value={newBansos.fullName}
                onChange={(e) => setNewBansos({ ...newBansos, fullName: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <select
                value={newBansos.program}
                onChange={(e) => setNewBansos({ ...newBansos, program: e.target.value })}
                className="h-10 px-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="BLT-DD">BLT-DD</option>
                <option value="PKH">PKH</option>
                <option value="BPNT">BPNT</option>
                <option value="PBI-JK">PBI-JK</option>
              </select>
              <input
                placeholder="Dusun"
                value={newBansos.dusun}
                onChange={(e) => setNewBansos({ ...newBansos, dusun: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                type="number"
                placeholder="Nominal"
                value={newBansos.amount}
                onChange={(e) => setNewBansos({ ...newBansos, amount: Number(e.target.value) })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <button type="submit" className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold">
                Tambah Penerima
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {bansos.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      {b.fullName} <span className="font-mono text-slate-500">({b.nik})</span>
                    </div>
                    <div className="text-slate-500">
                      {b.program} · {b.dusun} · {b.period} · {formatRp(b.amount)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deleteBansos(b.id);
                      setBansos(await api.getBansos());
                    }}
                    className="text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PAJAK PBB-P2 */}
        {tab === 'pbb' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Pelacakan Pajak PBB-P2 Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createPbb(newPbb);
                setNewPbb({ ...newPbb, nop: '', taxpayerName: '' });
                setPbb(await api.getPbb());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs"
            >
              <input
                required
                placeholder="NOP *"
                value={newPbb.nop}
                onChange={(e) => setNewPbb({ ...newPbb, nop: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                required
                placeholder="Nama Wajib Pajak *"
                value={newPbb.taxpayerName}
                onChange={(e) => setNewPbb({ ...newPbb, taxpayerName: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                type="number"
                placeholder="Tagihan PBB"
                value={newPbb.taxAmount}
                onChange={(e) => setNewPbb({ ...newPbb, taxAmount: Number(e.target.value) })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <button type="submit" className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold">
                Tambah Data PBB
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {pbb.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      {p.taxpayerName} <span className="font-mono text-slate-500">({p.nop})</span>
                    </div>
                    <div className="text-slate-500">
                      Tahun {p.fiscalYear} · {formatRp(p.taxAmount)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.updatePbbStatus(p.id, p.status === 'LUNAS' ? 'BELUM_BAYAR' : 'LUNAS');
                      setPbb(await api.getPbb());
                    }}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      p.status === 'LUNAS'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {p.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. PERANGKAT DESA (SOTK) */}
        {tab === 'officials' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Perangkat Desa (SOTK)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createOfficial(newOfficial);
                setNewOfficial({ name: '', position: '', nip: '', phone: '', photoUrl: '', sortOrder: 10 });
                setOfficials(await api.getOfficials());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs"
            >
              <input
                required
                placeholder="Nama Lengkap & Gelar *"
                value={newOfficial.name}
                onChange={(e) => setNewOfficial({ ...newOfficial, name: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                required
                placeholder="Jabatan (mis. Sekretaris Desa) *"
                value={newOfficial.position}
                onChange={(e) => setNewOfficial({ ...newOfficial, position: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                placeholder="NIP / NIAP (opsional)"
                value={newOfficial.nip}
                onChange={(e) => setNewOfficial({ ...newOfficial, nip: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <input
                placeholder="URL Foto Pejabat (opsional)"
                value={newOfficial.photoUrl}
                onChange={(e) => setNewOfficial({ ...newOfficial, photoUrl: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
              <button type="submit" className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold">
                Tambah Perangkat
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {officials.map((o) => (
                <div key={o.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">{o.name}</div>
                    <div className="text-slate-500">
                      {o.position} {o.nip ? `· NIP. ${o.nip}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deleteOfficial(o.id);
                      setOfficials(await api.getOfficials());
                    }}
                    className="text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. PRODUK UMKM / BELI DARI DESA */}
        {tab === 'umkm' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Katalog UMKM — Beli Dari Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createUmkm(newUmkm);
                setNewUmkm({
                  name: '',
                  category: 'Kuliner',
                  price: 25000,
                  unit: 'pcs',
                  sellerName: '',
                  sellerPhone: '',
                  imageUrl: '',
                  description: '',
                });
                setUmkm(await api.getUmkmAdmin());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  required
                  placeholder="Nama Produk UMKM *"
                  value={newUmkm.name}
                  onChange={(e) => setNewUmkm({ ...newUmkm, name: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  placeholder="Kategori (Kuliner / Pertanian / Kerajinan)"
                  value={newUmkm.category}
                  onChange={(e) => setNewUmkm({ ...newUmkm, category: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  type="number"
                  placeholder="Harga (Rp)"
                  value={newUmkm.price}
                  onChange={(e) => setNewUmkm({ ...newUmkm, price: Number(e.target.value) })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <input
                  placeholder="Satuan (pcs / kg / bungkus)"
                  value={newUmkm.unit}
                  onChange={(e) => setNewUmkm({ ...newUmkm, unit: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  required
                  placeholder="Nama Penjual / UMKM *"
                  value={newUmkm.sellerName}
                  onChange={(e) => setNewUmkm({ ...newUmkm, sellerName: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  required
                  placeholder="Nomor WhatsApp Penjual *"
                  value={newUmkm.sellerPhone}
                  onChange={(e) => setNewUmkm({ ...newUmkm, sellerPhone: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <input
                  placeholder="URL Foto Produk (https://...)"
                  value={newUmkm.imageUrl}
                  onChange={(e) => setNewUmkm({ ...newUmkm, imageUrl: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div className="flex gap-2.5">
                <input
                  placeholder="Deskripsi singkat produk..."
                  value={newUmkm.description}
                  onChange={(e) => setNewUmkm({ ...newUmkm, description: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-300"
                />
                <button type="submit" className="h-10 px-5 rounded-xl bg-[#0069b6] text-white font-bold">
                  Tambah Produk
                </button>
              </div>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {umkm.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      {u.name} · {formatRp(u.price)}/{u.unit}
                    </div>
                    <div className="text-slate-500">
                      {u.category} · Penjual: {u.sellerName} ({u.sellerPhone})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deleteUmkm(u.id);
                      setUmkm(await api.getUmkmAdmin());
                    }}
                    className="text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. PETA (POI), POTENSI, WISATA & GALERI DESA */}
        {tab === 'places' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Peta Lokasi (POI), Potensi, Wisata &amp; Galeri</h1>
              <p className="text-xs text-slate-500">
                Tambahkan titik fasilitas peta desa (POI), potensi ekonomi/pertanian, destinasi wisata, maupun foto
                galeri kegiatan desa.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createPlace(newPlace);
                setNewPlace({
                  kind: 'POI',
                  title: '',
                  category: 'Fasilitas Umum',
                  address: '',
                  lat: '-7.2010',
                  lng: '112.0220',
                  imageUrl: '',
                  description: '',
                });
                setPlaces(await api.getPlacesAdmin());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <select
                  value={newPlace.kind}
                  onChange={(e) => setNewPlace({ ...newPlace, kind: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="POI">POI / Titik Fasilitas Peta</option>
                  <option value="POTENSI">Potensi Unggulan Desa</option>
                  <option value="WISATA">Destinasi Wisata Desa</option>
                  <option value="GALERI">Foto Galeri Kegiatan Desa</option>
                </select>
                <input
                  required
                  placeholder="Nama Lokasi / Potensi / Judul Galeri *"
                  value={newPlace.title}
                  onChange={(e) => setNewPlace({ ...newPlace, title: e.target.value })}
                  className="sm:col-span-2 h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  placeholder="Kategori (mis. Pertanian / Kesehatan)"
                  value={newPlace.category}
                  onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  placeholder="Alamat / Dusun"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  placeholder="Latitude (mis. -7.2010)"
                  value={newPlace.lat}
                  onChange={(e) => setNewPlace({ ...newPlace, lat: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <input
                  placeholder="Longitude (mis. 112.0220)"
                  value={newPlace.lng}
                  onChange={(e) => setNewPlace({ ...newPlace, lng: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
                <input
                  placeholder="URL Foto (https://...)"
                  value={newPlace.imageUrl}
                  onChange={(e) => setNewPlace({ ...newPlace, imageUrl: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div className="flex gap-2.5">
                <input
                  placeholder="Keterangan / deskripsi..."
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-300"
                />
                <button type="submit" className="h-10 px-5 rounded-xl bg-[#0069b6] text-white font-bold">
                  Simpan Data
                </button>
              </div>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {places.map((pl) => (
                <div key={pl.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0069b6] mr-2">{pl.kind}</span>
                      {pl.title}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {pl.category} · {pl.address} {pl.lat && pl.lng ? `(${pl.lat}, ${pl.lng})` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deletePlace(pl.id);
                      setPlaces(await api.getPlacesAdmin());
                    }}
                    className="text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. INDEKS DESA (IDM, SDGs & STUNTING) */}
        {tab === 'indicators' && (
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-2xl font-extrabold text-slate-900">Indeks Desa Membangun (IDM), SDGs &amp; Stunting</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.saveIndicator(indicatorForm);
                alert('Data Indeks Desa, SDGs, dan Stunting berhasil disimpan.');
              }}
              className="bg-white rounded-2xl shadow-2xs p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Tahun Penilaian</label>
                  <input
                    type="number"
                    value={indicatorForm.year}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, year: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Status IDM Desa</label>
                  <select
                    value={indicatorForm.idmStatus}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, idmStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="MANDIRI">MANDIRI</option>
                    <option value="MAJU">MAJU</option>
                    <option value="BERKEMBANG">BERKEMBANG</option>
                    <option value="TERTINGGAL">TERTINGGAL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Skor IDM (0.0000 – 1.0000)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={indicatorForm.idmScore}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, idmScore: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Skor SDGs Desa (0 – 100)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={indicatorForm.sdgsScore}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, sdgsScore: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Jumlah Kasus Stunting Tercatat</label>
                  <input
                    type="number"
                    value={indicatorForm.stuntingCases}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, stuntingCases: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Prevalensi Stunting (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={indicatorForm.stuntingRate}
                    onChange={(e) => setIndicatorForm({ ...indicatorForm, stuntingRate: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>
              <button type="submit" className="h-10 px-6 rounded-xl bg-[#0069b6] text-white text-sm font-bold">
                Simpan Skor IDM &amp; SDGs
              </button>
            </form>
          </div>
        )}

        {/* 13. PPID & PERMOHONAN INFORMASI PUBLIK */}
        {tab === 'ppid' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Dokumen PPID &amp; Permohonan Informasi (UU KIP)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createPpidDoc(newPpidDoc);
                setNewPpidDoc({
                  category: 'BERKALA',
                  title: '',
                  documentNumber: '',
                  year: new Date().getFullYear(),
                  fileUrl: '',
                  summary: '',
                });
                setPpidData(await api.getPpidAdmin());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <select
                  value={newPpidDoc.category}
                  onChange={(e) => setNewPpidDoc({ ...newPpidDoc, category: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="BERKALA">Informasi Berkala</option>
                  <option value="SERTA_MERTA">Informasi Serta-Merta</option>
                  <option value="SETIAP_SAAT">Informasi Setiap Saat</option>
                  <option value="DASAR_HUKUM">Dasar Hukum / Perdes</option>
                </select>
                <input
                  required
                  placeholder="Judul Dokumen Publik *"
                  value={newPpidDoc.title}
                  onChange={(e) => setNewPpidDoc({ ...newPpidDoc, title: e.target.value })}
                  className="sm:col-span-2 h-10 px-3 rounded-xl border border-slate-300"
                />
                <input
                  placeholder="Nomor Perdes / SK"
                  value={newPpidDoc.documentNumber}
                  onChange={(e) => setNewPpidDoc({ ...newPpidDoc, documentNumber: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div className="flex gap-2.5">
                <input
                  placeholder="Ringkasan isi dokumen..."
                  value={newPpidDoc.summary}
                  onChange={(e) => setNewPpidDoc({ ...newPpidDoc, summary: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-300"
                />
                <button type="submit" className="h-10 px-5 rounded-xl bg-[#0069b6] text-white font-bold">
                  Tambah Dokumen PPID
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {(ppidData.documents || []).map((d) => (
                <div key={d.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0069b6] mr-2">{d.category}</span>
                      {d.title}
                    </div>
                    <div className="text-slate-500 mt-0.5">{d.summary}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.deletePpidDoc(d.id);
                      setPpidData(await api.getPpidAdmin());
                    }}
                    className="text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. PENGADUAN WARGA */}
        {tab === 'complaints' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Pengaduan Masyarakat</h1>
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-500">
                  Belum ada pengaduan warga.
                </div>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl shadow-2xs p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0069b6]">
                        {c.ticketCode} · {c.category}
                      </span>
                      <span className="font-mono font-bold">{c.status}</span>
                    </div>
                    <div className="font-bold">
                      {c.reporterName} ({c.reporterPhone}) — {c.location}
                    </div>
                    <p className="text-slate-700">{c.description}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await api.updateComplaint(c.id, {
                            status: 'DITINDAKLANJUTI',
                            responseText: 'Laporan sedang ditinjau oleh perangkat desa terkait.',
                          });
                          setComplaints(await api.getComplaints());
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                      >
                        Tindak Lanjuti
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.updateComplaint(c.id, {
                            status: 'SELESAI',
                            responseText: 'Laporan telah ditangani oleh Pemerintah Desa.',
                          });
                          setComplaints(await api.getComplaints());
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                      >
                        Tandai Selesai
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 15. ABSENSI & BUKU TAMU */}
        {tab === 'attendance' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Absensi Aparatur &amp; Buku Tamu</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createAttendance(newAttendance);
                setNewAttendance({ kind: 'APARATUR', personName: '', roleOrOrigin: '', purpose: '' });
                setAttendance(await api.getAttendance());
              }}
              className="bg-white rounded-2xl shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs"
            >
              <select
                value={newAttendance.kind}
                onChange={(e) => setNewAttendance({ ...newAttendance, kind: e.target.value })}
                className="h-10 px-2.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="APARATUR">Absensi Aparatur</option>
                <option value="TAMU">Buku Tamu</option>
              </select>
              <input
                required
                placeholder="Nama *"
                value={newAttendance.personName}
                onChange={(e) => setNewAttendance({ ...newAttendance, personName: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                placeholder="Jabatan / Instansi"
                value={newAttendance.roleOrOrigin}
                onChange={(e) => setNewAttendance({ ...newAttendance, roleOrOrigin: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <input
                placeholder="Keperluan"
                value={newAttendance.purpose}
                onChange={(e) => setNewAttendance({ ...newAttendance, purpose: e.target.value })}
                className="h-10 px-3 rounded-xl border border-slate-300"
              />
              <button type="submit" className="h-10 px-3 rounded-xl bg-[#0069b6] text-white font-bold">
                Catat Kehadiran
              </button>
            </form>
            <div className="bg-white rounded-2xl shadow-2xs divide-y divide-slate-100 text-xs">
              {attendance.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold mr-2">{a.kind}</span>
                    <strong>{a.personName}</strong> <span className="text-slate-500">· {a.roleOrOrigin}</span>
                    {a.purpose && <div className="text-slate-500 mt-0.5">{a.purpose}</div>}
                  </div>
                  <span className="font-mono text-slate-500">{new Date(a.checkInAt).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

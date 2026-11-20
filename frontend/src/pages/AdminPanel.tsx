import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  HeartHandshake,
  MessageSquareWarning,
  Newspaper,
  ShoppingBag,
  Building2,
  ClipboardCheck,
  LogOut,
  Globe,
  Printer,
  Trash2,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { ReneoSidesaLogo } from '../components/ReneoSidesaLogo';

type AdminTab =
  | 'dashboard'
  | 'letters'
  | 'residents'
  | 'apbdes'
  | 'bansos'
  | 'pbb'
  | 'complaints'
  | 'news'
  | 'umkm'
  | 'officials'
  | 'attendance'
  | 'profile';

const MENU: Array<{ id: AdminTab; label: string; icon: React.ComponentType<any> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'letters', label: 'Pelayanan Surat', icon: FileText },
  { id: 'residents', label: 'Kependudukan', icon: Users },
  { id: 'apbdes', label: 'Keuangan APBDes', icon: Wallet },
  { id: 'bansos', label: 'Bansos', icon: HeartHandshake },
  { id: 'pbb', label: 'Pajak PBB-P2', icon: Wallet },
  { id: 'complaints', label: 'Pengaduan Warga', icon: MessageSquareWarning },
  { id: 'news', label: 'Berita Desa', icon: Newspaper },
  { id: 'umkm', label: 'UMKM / Belanja', icon: ShoppingBag },
  { id: 'officials', label: 'Perangkat (SOTK)', icon: Building2 },
  { id: 'attendance', label: 'Absensi & Tamu', icon: ClipboardCheck },
  { id: 'profile', label: 'Profil Desa', icon: Building2 },
];

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

export const AdminPanel: React.FC<{
  onBackToPortal: () => void;
  onBackToLanding?: () => void;
}> = ({ onBackToPortal, onBackToLanding }) => {
  const [auth, setAuth] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', villageName: '' });
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
  const [umkm, setUmkm] = useState<any[]>([]);
  const [officials, setOfficials] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [village, setVillage] = useState<any>(null);
  const [printLetter, setPrintLetter] = useState<any | null>(null);

  // Quick create forms
  const [newResident, setNewResident] = useState({ nik: '', kkNumber: '', fullName: '', gender: 'L', dusun: 'Dusun Krajan', rt: '001', rw: '001', occupation: 'Petani/Pekebun' });
  const [newApbdes, setNewApbdes] = useState({ fiscalYear: new Date().getFullYear(), category: 'BELANJA', subCategory: 'Pembangunan', label: '', budgetAmount: 0, realizedAmount: 0 });
  const [newBansos, setNewBansos] = useState({ nik: '', fullName: '', program: 'BLT-DD', period: `Tahun ${new Date().getFullYear()}`, amount: 900000, dusun: 'Dusun Krajan' });
  const [newPbb, setNewPbb] = useState({ nop: '', taxpayerName: '', dusun: 'Dusun Krajan', fiscalYear: new Date().getFullYear(), taxAmount: 100000 });
  const [newNews, setNewNews] = useState({ title: '', category: 'Kegiatan Desa', content: '' });
  const [newUmkm, setNewUmkm] = useState({ name: '', category: 'Kuliner', price: 15000, unit: 'pcs', sellerName: '', sellerPhone: '', description: '' });
  const [newOfficial, setNewOfficial] = useState({ name: '', position: '', nip: '', sortOrder: 10 });
  const [newAttendance, setNewAttendance] = useState({ kind: 'APARATUR', personName: '', roleOrOrigin: '', purpose: '' });

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
    else if (t === 'attendance') setAttendance(await api.getAttendance());
    else if (t === 'profile') setVillage(await api.getVillageProfile());
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr(null);
    try {
      if (!auth?.initialized) {
        await api.setupAdmin(authForm);
      } else {
        await api.login({ email: authForm.email, password: authForm.password });
      }
      await checkAuth();
    } catch (err: any) {
      setAuthErr(err?.response?.data?.error || 'Autentikasi gagal.');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">Memuat Back-Office Desa...</div>;
  }

  if (!auth?.authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <ReneoSidesaLogo className="w-10 h-10 shrink-0" />
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {auth?.initialized ? 'Masuk Back-Office Desa' : 'Setup Awal Admin Reneo SIDesa'}
              </h1>
              <p className="text-xs text-slate-500">Pengelolaan Administrasi &amp; Layanan Publik Desa</p>
            </div>
          </div>
          {authErr && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">{authErr}</div>}
          <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
            {!auth?.initialized && (
              <>
                <input type="text" required placeholder="Nama Desa (mis. Desa Sugihwaras)" value={authForm.villageName} onChange={(e) => setAuthForm({ ...authForm, villageName: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                <input type="text" required placeholder="Nama Admin / Perangkat Desa" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
              </>
            )}
            <input type="email" required placeholder="Email Perangkat Desa" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            <input type="password" required placeholder="Kata Sandi" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
            <button type="submit" className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
              {auth?.initialized ? 'Masuk ke Back-Office' : 'Buat Akun Admin Desa'}
            </button>
          </form>
          <div className="flex items-center justify-between gap-2 pt-1">
            {onBackToLanding && (
              <button type="button" onClick={onBackToLanding} className="text-xs text-slate-600 font-semibold hover:underline">
                &larr; Beranda Platform SIDesa
              </button>
            )}
            <button type="button" onClick={onBackToPortal} className="text-xs text-emerald-700 font-semibold hover:underline ml-auto">
              Lihat Website Desa &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="no-print lg:w-60 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2.5">
          <ReneoSidesaLogo className="w-8 h-8 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{village?.name || 'Reneo SIDesa'}</div>
            <div className="text-[11px] text-slate-400 truncate">{auth.user?.name}</div>
          </div>
        </div>
        <nav className="p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto flex-1">
          {MENU.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => void loadTab(m.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-2 shrink-0 transition-colors ${
                  tab === m.id ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800 flex lg:flex-col gap-2">
          <button
            type="button"
            onClick={onBackToPortal}
            className="flex-1 h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Lihat Website Desa</span>
          </button>
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex-1 h-9 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 inline-flex items-center justify-center gap-1.5"
            >
              <span>Beranda Platform</span>
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await api.logout();
              await checkAuth();
            }}
            className="h-9 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 inline-flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
        {/* Print Letter Modal */}
        {printLetter && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPrintLetter(null)}>
            <div className="bg-white max-w-2xl w-full rounded-xl p-8 space-y-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <div className="text-xs font-semibold uppercase">Pemerintah Kabupaten {village?.regency}</div>
                <div className="text-xs font-semibold uppercase">Kecamatan {village?.district}</div>
                <div className="text-lg font-bold uppercase">{village?.name}</div>
                <div className="text-[11px] text-slate-600">{village?.address}</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold underline uppercase">SURAT KETERANGAN ({printLetter.letterType})</div>
                <div className="text-xs font-mono">Nomor: {printLetter.letterNumber || 'Belum bernomor'}</div>
              </div>
              <div className="text-sm leading-relaxed space-y-2">
                <p>Yang bertanda tangan di bawah ini, {village?.headTitle || 'Kepala Desa'} {village?.name}, menerangkan dengan sebenarnya bahwa:</p>
                <div className="pl-4 space-y-1 text-xs">
                  <div>Nama Lengkap : <strong>{printLetter.applicantName}</strong></div>
                  <div>NIK : <span className="font-mono">{printLetter.applicantNik}</span></div>
                  <div>Keperluan : {printLetter.purpose}</div>
                </div>
                <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
              </div>
              <div className="flex justify-end pt-4 text-xs text-center">
                <div className="w-48 space-y-12">
                  <div>
                    <div>{village?.name}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="font-semibold">{village?.headTitle || 'Kepala Desa'}</div>
                  </div>
                  <div className="font-bold underline">{village?.headName}</div>
                </div>
              </div>
              <div className="no-print pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setPrintLetter(null)} className="h-9 px-4 rounded-lg border border-slate-300 text-xs font-semibold">Tutup</button>
                <button type="button" onClick={() => window.print()} className="h-9 px-4 rounded-lg bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'dashboard' && dashboard && (
          <div className="space-y-5">
            <h1 className="text-xl font-bold text-slate-900">Dashboard Pemerintahan Desa</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Penduduk Aktif</div>
                <div className="text-2xl font-bold font-mono">{dashboard.demographics.totalResidents}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Surat Menunggu</div>
                <div className="text-2xl font-bold font-mono text-amber-700">{dashboard.pendingLetters}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">Pengaduan Aktif</div>
                <div className="text-2xl font-bold font-mono text-rose-700">{dashboard.openComplaints}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs text-slate-500">PBB-P2 Lunas</div>
                <div className="text-base font-bold font-mono text-emerald-700">
                  {formatRp(dashboard.pbb.paidAmount)} / {formatRp(dashboard.pbb.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'letters' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pelayanan &amp; Persuratan Desa</h1>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kode / Nomor</th>
                    <th className="py-2.5 px-3">Pemohon</th>
                    <th className="py-2.5 px-3">Jenis &amp; Keperluan</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {letters.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">Belum ada pengajuan surat warga.</td></tr>
                  ) : (
                    letters.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-semibold">{l.trackingCode}</div>
                          {l.letterNumber && <div className="text-[11px] text-emerald-700">{l.letterNumber}</div>}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold">{l.applicantName}</div>
                          <div className="font-mono text-slate-500">{l.applicantNik}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold">{l.letterType}</div>
                          <div className="text-slate-600">{l.purpose}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold">{l.status}</td>
                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {l.status !== 'SELESAI' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await api.updateLetter(l.id, { status: 'SELESAI' });
                                setLetters(await api.getLetters());
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold"
                            >
                              Selesaikan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrintLetter(l)}
                            className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 font-semibold"
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

        {tab === 'residents' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Administrasi Kependudukan (Permendagri 47/2016)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createResident(newResident);
                setNewResident({ nik: '', kkNumber: '', fullName: '', gender: 'L', dusun: 'Dusun Krajan', rt: '001', rw: '001', occupation: 'Petani/Pekebun' });
                setResidents(await api.getResidents());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs"
            >
              <input required placeholder="NIK *" value={newResident.nik} onChange={(e) => setNewResident({ ...newResident, nik: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input required placeholder="No. KK *" value={newResident.kkNumber} onChange={(e) => setNewResident({ ...newResident, kkNumber: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input required placeholder="Nama Lengkap *" value={newResident.fullName} onChange={(e) => setNewResident({ ...newResident, fullName: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <select value={newResident.gender} onChange={(e) => setNewResident({ ...newResident, gender: e.target.value })} className="h-9 px-2 rounded border border-slate-300 bg-white">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <input placeholder="Dusun" value={newResident.dusun} onChange={(e) => setNewResident({ ...newResident, dusun: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">NIK / KK</th>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">L/P</th>
                    <th className="py-2 px-3">Dusun / RT-RW</th>
                    <th className="py-2 px-3">Pekerjaan</th>
                    <th className="py-2 px-3 text-right">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {residents.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3 font-mono">{r.nik}<div className="text-[10px] text-slate-400">KK {r.kkNumber}</div></td>
                      <td className="py-2 px-3 font-semibold">{r.fullName}</td>
                      <td className="py-2 px-3">{r.gender}</td>
                      <td className="py-2 px-3">{r.dusun} RT {r.rt}/{r.rw}</td>
                      <td className="py-2 px-3">{r.occupation}</td>
                      <td className="py-2 px-3 text-right">
                        <button type="button" onClick={async () => { await api.deleteResident(r.id); setResidents(await api.getResidents()); }} className="text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'apbdes' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pengelolaan APBDes</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createApbdes(newApbdes);
                setNewApbdes({ ...newApbdes, label: '', budgetAmount: 0, realizedAmount: 0 });
                setApbdes(await api.getApbdes());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs"
            >
              <input type="number" value={newApbdes.fiscalYear} onChange={(e) => setNewApbdes({ ...newApbdes, fiscalYear: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <select value={newApbdes.category} onChange={(e) => setNewApbdes({ ...newApbdes, category: e.target.value })} className="h-9 px-2 rounded border border-slate-300 bg-white">
                <option value="PENDAPATAN">PENDAPATAN</option>
                <option value="BELANJA">BELANJA</option>
                <option value="PEMBIAYAAN">PEMBIAYAAN</option>
              </select>
              <input required placeholder="Uraian Pos *" value={newApbdes.label} onChange={(e) => setNewApbdes({ ...newApbdes, label: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input type="number" placeholder="Anggaran" value={newApbdes.budgetAmount} onChange={(e) => setNewApbdes({ ...newApbdes, budgetAmount: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input type="number" placeholder="Realisasi" value={newApbdes.realizedAmount} onChange={(e) => setNewApbdes({ ...newApbdes, realizedAmount: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Tambah Pos</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr><th className="py-2 px-3">Tahun</th><th className="py-2 px-3">Kategori</th><th className="py-2 px-3">Uraian</th><th className="py-2 px-3 text-right">Anggaran</th><th className="py-2 px-3 text-right">Realisasi</th><th className="py-2 px-3"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apbdes.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2 px-3 font-mono">{a.fiscalYear}</td>
                      <td className="py-2 px-3 font-semibold">{a.category}</td>
                      <td className="py-2 px-3">{a.label}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatRp(a.budgetAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatRp(a.realizedAmount)}</td>
                      <td className="py-2 px-3 text-right">
                        <button type="button" onClick={async () => { await api.deleteApbdes(a.id); setApbdes(await api.getApbdes()); }} className="text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'bansos' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Penerima Bantuan Sosial</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createBansos(newBansos);
                setNewBansos({ ...newBansos, nik: '', fullName: '' });
                setBansos(await api.getBansos());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs"
            >
              <input required placeholder="NIK *" value={newBansos.nik} onChange={(e) => setNewBansos({ ...newBansos, nik: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input required placeholder="Nama Penerima *" value={newBansos.fullName} onChange={(e) => setNewBansos({ ...newBansos, fullName: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <select value={newBansos.program} onChange={(e) => setNewBansos({ ...newBansos, program: e.target.value })} className="h-9 px-2 rounded border border-slate-300 bg-white">
                <option value="BLT-DD">BLT-DD</option>
                <option value="PKH">PKH</option>
                <option value="BPNT">BPNT</option>
                <option value="PBI-JK">PBI-JK</option>
              </select>
              <input type="number" placeholder="Nominal" value={newBansos.amount} onChange={(e) => setNewBansos({ ...newBansos, amount: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Tambah Penerima</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {bansos.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{b.fullName} <span className="font-mono text-slate-500">({b.nik})</span></div>
                    <div className="text-slate-500">{b.program} · {b.period} · {formatRp(b.amount)}</div>
                  </div>
                  <button type="button" onClick={async () => { await api.deleteBansos(b.id); setBansos(await api.getBansos()); }} className="text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pbb' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pelacakan Pajak PBB-P2 Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createPbb(newPbb);
                setNewPbb({ ...newPbb, nop: '', taxpayerName: '' });
                setPbb(await api.getPbb());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input required placeholder="NOP *" value={newPbb.nop} onChange={(e) => setNewPbb({ ...newPbb, nop: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input required placeholder="Nama Wajib Pajak *" value={newPbb.taxpayerName} onChange={(e) => setNewPbb({ ...newPbb, taxpayerName: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input type="number" placeholder="Tagihan PBB" value={newPbb.taxAmount} onChange={(e) => setNewPbb({ ...newPbb, taxAmount: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Tambah Data PBB</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {pbb.map((p) => (
                <div key={p.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.taxpayerName} <span className="font-mono text-slate-500">({p.nop})</span></div>
                    <div className="text-slate-500">Tahun {p.fiscalYear} · {formatRp(p.taxAmount)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.updatePbbStatus(p.id, p.status === 'LUNAS' ? 'BELUM_BAYAR' : 'LUNAS');
                      setPbb(await api.getPbb());
                    }}
                    className={`px-3 py-1 rounded font-semibold ${
                      p.status === 'LUNAS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {p.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'complaints' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pengaduan Masyarakat</h1>
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">Belum ada pengaduan warga.</div>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700">{c.ticketCode} · {c.category}</span>
                      <span className="font-mono font-semibold">{c.status}</span>
                    </div>
                    <div className="font-semibold">{c.reporterName} ({c.reporterPhone}) — {c.location}</div>
                    <p className="text-slate-700">{c.description}</p>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={async () => { await api.updateComplaint(c.id, { status: 'DITINDAKLANJUTI', responseText: 'Laporan sedang ditinjau oleh perangkat desa terkait.' }); setComplaints(await api.getComplaints()); }} className="px-3 py-1 rounded border border-slate-300 font-semibold">Tindak Lanjuti</button>
                      <button type="button" onClick={async () => { await api.updateComplaint(c.id, { status: 'SELESAI', responseText: 'Laporan telah ditangani oleh Pemerintah Desa.' }); setComplaints(await api.getComplaints()); }} className="px-3 py-1 rounded bg-emerald-700 text-white font-semibold">Tandai Selesai</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'news' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Berita &amp; Kegiatan Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createNews(newNews);
                setNewNews({ title: '', category: 'Kegiatan Desa', content: '' });
                setNews(await api.getNewsAdmin());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input required placeholder="Judul Berita *" value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} className="sm:col-span-2 h-9 px-3 rounded border border-slate-300" />
                <input placeholder="Kategori" value={newNews.category} onChange={(e) => setNewNews({ ...newNews, category: e.target.value })} className="h-9 px-3 rounded border border-slate-300" />
              </div>
              <textarea required rows={3} placeholder="Isi berita desa *" value={newNews.content} onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} className="w-full p-3 rounded border border-slate-300" />
              <button type="submit" className="h-9 px-4 rounded bg-emerald-700 text-white font-semibold">Terbitkan Berita</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {news.map((n) => (
                <div key={n.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-slate-500">{n.category} · {new Date(n.publishedAt).toLocaleDateString('id-ID')}</div>
                  </div>
                  <button type="button" onClick={async () => { await api.deleteNews(n.id); setNews(await api.getNewsAdmin()); }} className="text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'umkm' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Produk UMKM / Beli Dari Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createUmkm(newUmkm);
                setNewUmkm({ name: '', category: 'Kuliner', price: 15000, unit: 'pcs', sellerName: '', sellerPhone: '', description: '' });
                setUmkm(await api.getUmkmAdmin());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs"
            >
              <input required placeholder="Nama Produk *" value={newUmkm.name} onChange={(e) => setNewUmkm({ ...newUmkm, name: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input required placeholder="Nama Penjual *" value={newUmkm.sellerName} onChange={(e) => setNewUmkm({ ...newUmkm, sellerName: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input required placeholder="No. WA Penjual *" value={newUmkm.sellerPhone} onChange={(e) => setNewUmkm({ ...newUmkm, sellerPhone: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input type="number" placeholder="Harga" value={newUmkm.price} onChange={(e) => setNewUmkm({ ...newUmkm, price: Number(e.target.value) })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <input placeholder="Satuan (pcs / kg)" value={newUmkm.unit} onChange={(e) => setNewUmkm({ ...newUmkm, unit: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Tambah Produk</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {umkm.map((u) => (
                <div key={u.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{u.name} · {formatRp(u.price)}/{u.unit}</div>
                    <div className="text-slate-500">{u.sellerName} ({u.sellerPhone})</div>
                  </div>
                  <button type="button" onClick={async () => { await api.deleteUmkm(u.id); setUmkm(await api.getUmkmAdmin()); }} className="text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'officials' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Perangkat Desa (SOTK)</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createOfficial(newOfficial);
                setNewOfficial({ name: '', position: '', nip: '', sortOrder: 10 });
                setOfficials(await api.getOfficials());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input required placeholder="Nama Lengkap *" value={newOfficial.name} onChange={(e) => setNewOfficial({ ...newOfficial, name: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input required placeholder="Jabatan *" value={newOfficial.position} onChange={(e) => setNewOfficial({ ...newOfficial, position: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input placeholder="NIP (opsional)" value={newOfficial.nip} onChange={(e) => setNewOfficial({ ...newOfficial, nip: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300 font-mono" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Tambah Perangkat</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {officials.map((o) => (
                <div key={o.id} className="p-3 flex items-center justify-between gap-2">
                  <div><div className="font-semibold">{o.name}</div><div className="text-slate-500">{o.position}</div></div>
                  <button type="button" onClick={async () => { await api.deleteOfficial(o.id); setOfficials(await api.getOfficials()); }} className="text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'attendance' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Absensi Aparatur &amp; Buku Tamu</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createAttendance(newAttendance);
                setNewAttendance({ kind: 'APARATUR', personName: '', roleOrOrigin: '', purpose: '' });
                setAttendance(await api.getAttendance());
              }}
              className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs"
            >
              <select value={newAttendance.kind} onChange={(e) => setNewAttendance({ ...newAttendance, kind: e.target.value })} className="h-9 px-2 rounded border border-slate-300 bg-white">
                <option value="APARATUR">Absensi Aparatur</option>
                <option value="TAMU">Buku Tamu</option>
              </select>
              <input required placeholder="Nama *" value={newAttendance.personName} onChange={(e) => setNewAttendance({ ...newAttendance, personName: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input placeholder="Jabatan / Instansi" value={newAttendance.roleOrOrigin} onChange={(e) => setNewAttendance({ ...newAttendance, roleOrOrigin: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <input placeholder="Keperluan" value={newAttendance.purpose} onChange={(e) => setNewAttendance({ ...newAttendance, purpose: e.target.value })} className="h-9 px-2.5 rounded border border-slate-300" />
              <button type="submit" className="h-9 px-3 rounded bg-emerald-700 text-white font-semibold">Catat Hadir</button>
            </form>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {attendance.map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold mr-2">{a.kind}</span>
                    <strong>{a.personName}</strong> <span className="text-slate-500">· {a.roleOrOrigin}</span>
                    {a.purpose && <div className="text-slate-500 mt-0.5">{a.purpose}</div>}
                  </div>
                  <span className="font-mono text-slate-500">{new Date(a.checkInAt).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && village && (
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-xl font-bold text-slate-900">Profil &amp; Identitas Desa</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const updated = await api.updateVillageProfile(village);
                setVillage(updated);
                alert('Profil desa berhasil disimpan.');
              }}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Desa</label>
                  <input value={village.name || ''} onChange={(e) => setVillage({ ...village, name: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kode Desa (Kemendagri)</label>
                  <input value={village.kodeDesa || ''} onChange={(e) => setVillage({ ...village, kodeDesa: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kecamatan</label>
                  <input value={village.district || ''} onChange={(e) => setVillage({ ...village, district: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kabupaten / Kota</label>
                  <input value={village.regency || ''} onChange={(e) => setVillage({ ...village, regency: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Kepala Desa</label>
                  <input value={village.headName || ''} onChange={(e) => setVillage({ ...village, headName: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nomor Telepon / WA Kantor</label>
                  <input value={village.phone || ''} onChange={(e) => setVillage({ ...village, phone: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300 font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Alamat Balai Desa</label>
                <input value={village.address || ''} onChange={(e) => setVillage({ ...village, address: e.target.value })} className="w-full h-9 px-3 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sambutan Kepala Desa</label>
                <textarea rows={3} value={village.headGreeting || ''} onChange={(e) => setVillage({ ...village, headGreeting: e.target.value })} className="w-full p-3 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Visi Desa</label>
                <textarea rows={2} value={village.vision || ''} onChange={(e) => setVillage({ ...village, vision: e.target.value })} className="w-full p-3 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Misi Desa</label>
                <textarea rows={3} value={village.mission || ''} onChange={(e) => setVillage({ ...village, mission: e.target.value })} className="w-full p-3 rounded border border-slate-300" />
              </div>
              <button type="submit" className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                Simpan Profil Desa
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Edit3,
  ExternalLink,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { ReneoSidesaLogo } from './ReneoSidesaLogo';
import { WilayahSearchPicker } from './WilayahSearchPicker';
import { ImageUploadField } from './ImageUploadField';

type SuperTab = 'overview' | 'villages' | 'invoices' | 'plans';

function formatRp(n: number): string {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

function formatDate(d?: string | null): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
}

export const SuperadminDashboard: React.FC<{
  user: { name: string; email: string };
  initialTab?: string;
  onTabChange?: (tab: SuperTab) => void;
  onLogout: () => void;
  onOpenVillagePortal: (slug: string) => void;
  onManageVillage: (village: any) => void;
  onBackToLanding?: () => void;
}> = ({ user, initialTab, onTabChange, onLogout, onOpenVillagePortal, onManageVillage, onBackToLanding }) => {
  const validSuperTabs: SuperTab[] = ['overview', 'villages', 'invoices', 'plans'];
  const [tab, setTabState] = useState<SuperTab>(() =>
    validSuperTabs.includes(initialTab as SuperTab) ? (initialTab as SuperTab) : 'overview'
  );
  const setTab = (next: SuperTab) => {
    setTabState(next);
    onTabChange?.(next);
  };
  useEffect(() => {
    if (initialTab && validSuperTabs.includes(initialTab as SuperTab)) {
      setTabState(initialTab as SuperTab);
    }
  }, [initialTab]);
  const [overview, setOverview] = useState<any>(null);
  const [villages, setVillages] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<Record<string, any>>({});
  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const [showCreateVillage, setShowCreateVillage] = useState(false);
  const [newVillage, setNewVillage] = useState({
    name: '',
    slug: '',
    district: '',
    regency: '',
    province: 'Jawa Timur',
    kodeDesa: '',
    headName: '',
    logoUrl: '',
    heroImageUrl: '',
    publishNow: true,
  });

  const loadAll = async () => {
    const [ov, v, inv, pl, cfg] = await Promise.all([
      api.getSuperadminOverview(),
      api.getSuperadminVillages(),
      api.getSuperadminInvoices(),
      api.getSuperadminPlans(),
      api.getSuperadminPaymentConfig(),
    ]);
    setOverview(ov);
    setVillages(v || []);
    setInvoices(inv || []);
    setPlans(pl || []);
    setPaymentConfig(cfg || {});
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const flash = (msg: string) => {
    setSavingMsg(msg);
    window.setTimeout(() => setSavingMsg(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar Superadmin Platform (Compact Sticky Top Bar on Mobile) */}
      <aside className="sticky top-0 z-30 lg:static w-full lg:w-64 bg-[#0B2A57] text-white flex flex-col shrink-0 shadow-sm lg:shadow-none">
        <div className="px-3.5 py-2.5 lg:p-4 border-b border-white/10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <ReneoSidesaLogo className="w-8 h-8 lg:w-9 lg:h-9 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-extrabold truncate">Reneo SIDesa</div>
              <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Superadmin Platform</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu Superadmin"
            className="lg:hidden h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="px-2.5 py-2 lg:p-3 flex lg:flex-col gap-1 overflow-x-auto scrollbar-none flex-1 text-xs font-bold">
          {(
            [
              ['overview', 'Ringkasan Platform', LayoutDashboard],
              ['villages', 'Desa Terdaftar', Building2],
              ['invoices', 'Tagihan & Pembayaran', CreditCard],
              ['plans', 'Paket & Rekening', Settings],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setTab(id);
              }}
              className={`lg:w-full flex items-center gap-2 px-3 py-2 lg:py-2.5 rounded-lg text-left shrink-0 whitespace-nowrap transition-colors ${
                tab === id ? 'bg-[#0069b6] text-white' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {id === 'invoices' && overview?.waitingVerificationInvoices > 0 && (
                <span className="ml-1 lg:ml-auto px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-mono">
                  {overview.waitingVerificationInvoices}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block p-3 border-t border-white/10 space-y-2 text-xs bg-[#082147] lg:bg-transparent`}
        >
          <div className="px-2">
            <div className="font-bold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-slate-300 font-mono truncate">{user.email}</div>
          </div>
          {onBackToLanding && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onBackToLanding();
              }}
              className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-left"
            >
              &larr; Beranda Platform
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full py-2 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Superadmin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-x-auto">
        {savingMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            {savingMsg}
          </div>
        )}

        {tab === 'overview' && overview && (
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Ringkasan Platform Reneo SIDesa</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Pantau seluruh desa terdaftar, status langganan, dan verifikasi tagihan pembayaran.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-bold text-slate-500 uppercase">Desa Aktif</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">{overview.activeVillages}</div>
                <div className="text-xs text-slate-500 mt-1">dari {overview.totalVillages} desa terdaftar</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-bold text-slate-500 uppercase">Menunggu Pembayaran</div>
                <div className="text-3xl font-extrabold font-mono text-amber-600 mt-1">{overview.pendingVillages}</div>
                <div className="text-xs text-slate-500 mt-1">desa baru belum aktif</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-bold text-slate-500 uppercase">Perlu Verifikasi Bayar</div>
                <div className="text-3xl font-extrabold font-mono text-[#0069b6] mt-1">
                  {overview.waitingVerificationInvoices}
                </div>
                <div className="text-xs text-slate-500 mt-1">{overview.unpaidInvoices} tagihan belum dibayar</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Pendapatan Lunas</div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                  {formatRp(overview.totalRevenuePaid)}
                </div>
                <div className="text-xs text-slate-500 mt-1">akumulasi langganan desa</div>
              </div>
            </div>
          </section>
        )}

        {tab === 'villages' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Desa Terdaftar &amp; Direktori ({villages.length})</h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Buat desa baru, isi data melalui CMS, publikasikan secara publik, dan biarkan perangkat desa mengklaimnya dengan berlangganan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateVillage((v) => !v)}
                className="h-9 px-4 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{showCreateVillage ? 'Tutup Form' : 'Buat Desa Baru'}</span>
              </button>
            </div>

            {showCreateVillage && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await api.createSuperadminVillage(newVillage);
                  setNewVillage({
                    name: '',
                    slug: '',
                    district: '',
                    regency: '',
                    province: 'Jawa Timur',
                    kodeDesa: '',
                    headName: '',
                    logoUrl: '',
                    heroImageUrl: '',
                    publishNow: true,
                  });
                  setShowCreateVillage(false);
                  await loadAll();
                  flash('Desa baru berhasil dibuat. Klik "Kelola Data (CMS)" untuk melengkapi profil, berita, penduduk, dan APBDes.');
                }}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs"
              >
                <div className="text-sm font-extrabold text-slate-900">Buat Profil Desa Baru (Bisa Diklaim Perangkat Desa)</div>
                <WilayahSearchPicker
                  onSelect={(w) =>
                    setNewVillage((prev) => ({
                      ...prev,
                      name: w.name,
                      slug: w.slug,
                      kodeDesa: w.kode,
                      district: w.district || prev.district,
                      regency: w.regency || prev.regency,
                      province: w.province || prev.province,
                    }))
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Desa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Desa Sukamaju"
                      value={newVillage.name}
                      onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug URL (/desa/...)</label>
                    <input
                      type="text"
                      placeholder="sukamaju (otomatis jika kosong)"
                      value={newVillage.slug}
                      onChange={(e) => setNewVillage({ ...newVillage, slug: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kode Kemendagri</label>
                    <input
                      type="text"
                      placeholder="35.22.01.2001"
                      value={newVillage.kodeDesa}
                      onChange={(e) => setNewVillage({ ...newVillage, kodeDesa: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      placeholder="Kecamatan"
                      value={newVillage.district}
                      onChange={(e) => setNewVillage({ ...newVillage, district: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kabupaten</label>
                    <input
                      type="text"
                      placeholder="Kabupaten"
                      value={newVillage.regency}
                      onChange={(e) => setNewVillage({ ...newVillage, regency: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kepala Desa</label>
                    <input
                      type="text"
                      placeholder="Nama Kepala Desa"
                      value={newVillage.headName}
                      onChange={(e) => setNewVillage({ ...newVillage, headName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <ImageUploadField
                      label="Logo / Lambang Desa (Opsional)"
                      value={newVillage.logoUrl}
                      onChange={(url) => setNewVillage({ ...newVillage, logoUrl: url })}
                      placeholder="Pilih PNG transparan lambang kabupaten / desa"
                      preserveTransparency
                      compact
                    />
                    <ImageUploadField
                      label="Foto Banner Hero (Opsional)"
                      value={newVillage.heroImageUrl}
                      onChange={(url) => setNewVillage({ ...newVillage, heroImageUrl: url })}
                      placeholder="Pilih foto balai desa atau pemandangan desa"
                      compact
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVillage.publishNow}
                        onChange={(e) => setNewVillage({ ...newVillage, publishNow: e.target.checked })}
                      />
                      <span>Publikasikan langsung secara publik</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateVillage(false)}
                    className="h-9 px-4 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-5 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white font-bold"
                  >
                    Simpan &amp; Buat Desa
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-4 font-bold">Desa &amp; URL</th>
                    <th className="py-3 px-4 font-bold">Klaim &amp; Admin</th>
                    <th className="py-3 px-4 font-bold">Paket &amp; Masa Aktif</th>
                    <th className="py-3 px-4 font-bold">Publikasi / Status</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {villages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Belum ada desa yang dibuat atau terdaftar di platform ini.
                      </td>
                    </tr>
                  ) : (
                    villages.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{v.name}</div>
                          <div className="font-mono text-[11px] text-[#0069b6]">/desa/{v.slug}</div>
                        </td>
                        <td className="py-3 px-4">
                          {v.isClaimed === false ? (
                            <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0069b6] font-bold text-[11px]">
                              Belum Diklaim (Bisa Diklaim)
                            </span>
                          ) : (
                            <>
                              <div className="font-semibold text-slate-800">{v.adminName}</div>
                              <div className="font-mono text-[11px] text-slate-500">{v.adminEmail}</div>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">{v.licensePlan}</div>
                          <div className="font-mono text-[11px] text-slate-500">{formatDate(v.licenseExpiresAt)}</div>
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                v.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {v.status === 'ACTIVE' ? 'PUBLIK' : v.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">{v.licenseStatus}</div>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onManageVillage(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white font-semibold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Kelola Data (CMS)</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const nextPub = v.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
                              await api.updateSuperadminVillage(v.id, { status: nextPub });
                              await loadAll();
                              flash(
                                nextPub === 'ACTIVE'
                                  ? `${v.name} dipublikasikan secara publik.`
                                  : `${v.name} disembunyikan (Draft).`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{v.status === 'ACTIVE' ? 'Sembunyikan' : 'Publikasikan'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenVillagePortal(v.slug)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await api.updateSuperadminVillage(v.id, {
                                status: 'ACTIVE',
                                licenseStatus: 'ACTIVE',
                                extendMonths: 12,
                              });
                              await loadAll();
                              flash(`${v.name} diaktifkan dan diperpanjang +12 bulan.`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            +1 Thn
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm(`Hapus permanen ${v.name} beserta seluruh datanya?`)) return;
                              await api.deleteSuperadminVillage(v.id);
                              await loadAll();
                              flash(`${v.name} telah dihapus.`);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 inline-flex items-center"
                            title="Hapus Desa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'invoices' && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Tagihan &amp; Verifikasi Pembayaran Desa</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Klik <strong>Konfirmasi Lunas</strong> untuk mengaktifkan website desa dan menambah durasi langganan secara otomatis.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-4 font-bold">No. Invoice</th>
                    <th className="py-3 px-4 font-bold">Desa</th>
                    <th className="py-3 px-4 font-bold">Paket &amp; Durasi</th>
                    <th className="py-3 px-4 font-bold">Total</th>
                    <th className="py-3 px-4 font-bold">Konfirmasi / Ref</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Belum ada tagihan langganan desa.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{inv.villageName}</div>
                          <div className="font-mono text-[11px] text-slate-500">/desa/{inv.villageSlug}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold">{inv.planName}</div>
                          <div className="text-slate-500">{inv.durationMonths} Bulan</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0069b6]">{formatRp(inv.amount)}</td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 space-y-1">
                          <div>{inv.paymentMethod}</div>
                          {inv.paymentReference && <div className="font-mono">Ref: {inv.paymentReference}</div>}
                          {inv.paymentNote && <div className="text-slate-500">{inv.paymentNote}</div>}
                          {inv.studentIdentityJson &&
                            (() => {
                              try {
                                const st = JSON.parse(inv.studentIdentityJson);
                                return (
                                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-0.5">
                                    <div className="font-bold">
                                      KKN: {st.studentName} ({st.nim})
                                    </div>
                                    <div>
                                      {st.university} {st.studyProgram ? `· ${st.studyProgram}` : ''}
                                    </div>
                                    <div className="font-mono text-[10px]">
                                      PDDikti: {st.verification?.status || 'MANUAL_REVIEW'}
                                    </div>
                                  </div>
                                );
                              } catch {
                                return null;
                              }
                            })()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : inv.status === 'WAITING_VERIFICATION'
                                  ? 'bg-sky-50 text-[#0069b6]'
                                  : inv.status === 'UNPAID'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  await api.approveSuperadminInvoice(inv.id);
                                  await loadAll();
                                  flash(`Invoice ${inv.invoiceNumber} lunas! ${inv.villageName} otomatis aktif.`);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Konfirmasi Lunas</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await api.cancelSuperadminInvoice(inv.id);
                                  await loadAll();
                                  flash(`Invoice ${inv.invoiceNumber} dibatalkan.`);
                                }}
                                className="px-2 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold inline-flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Batal</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'plans' && (
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Paket Berlangganan &amp; Rekening Pembayaran</h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Atur harga paket langganan bulanan/tahunan desa serta rekening transfer / QRIS yang tampil saat desa mendaftar.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                  <div className="font-mono text-[11px] font-bold text-[#0069b6]">{p.code}</div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Paket</label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        setPlans((prev) => prev.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harga / Bulan (Rp)</label>
                      <input
                        type="number"
                        value={p.priceMonthly}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((x) => (x.id === p.id ? { ...x, priceMonthly: Number(e.target.value) } : x))
                          )
                        }
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harga / Tahun (Rp)</label>
                      <input
                        type="number"
                        value={p.priceYearly}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((x) => (x.id === p.id ? { ...x, priceYearly: Number(e.target.value) } : x))
                          )
                        }
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.updateSuperadminPlan(p.id, {
                        name: p.name,
                        priceMonthly: p.priceMonthly,
                        priceYearly: p.priceYearly,
                      });
                      flash(`Harga ${p.name} disimpan.`);
                    }}
                    className="w-full h-9 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white font-bold"
                  >
                    Simpan Paket
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 max-w-2xl text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Rekening &amp; Instruksi Pembayaran Platform</h2>
                {Array.isArray(paymentConfig.reneoPaymentMethods) && paymentConfig.reneoPaymentMethods.length > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-sky-50 text-[#0069b6] font-bold text-[11px]">
                    Tersinkron Otomatis dari Panel Reneo
                  </span>
                )}
              </div>

              {Array.isArray(paymentConfig.reneoPaymentMethods) && paymentConfig.reneoPaymentMethods.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-slate-600">
                    Daftar rekening di bawah ini diambil langsung dari pengaturan pembayaran di <strong>Panel Reneo</strong> sehingga selalu seragam dengan seluruh aplikasi ekosistem Reneo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentConfig.reneoPaymentMethods.map((m: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <div className="font-extrabold text-slate-900">{m.label || m.bankName || m.type}</div>
                        {m.accountNumber && (
                          <div className="font-mono text-sm font-extrabold text-[#0069b6]">{m.accountNumber}</div>
                        )}
                        {m.accountName && <div className="text-slate-600">a.n. {m.accountName}</div>}
                        {m.instructions && <div className="text-[11px] text-slate-500 pt-1">{m.instructions}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={paymentConfig.bankName || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, bankName: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={paymentConfig.bankAccountNumber || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, bankAccountNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Atas Nama</label>
                  <input
                    type="text"
                    value={paymentConfig.bankAccountHolder || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, bankAccountHolder: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Konfirmasi (628...)</label>
                  <input
                    type="text"
                    value={paymentConfig.whatsappSupport || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, whatsappSupport: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan QRIS / Virtual Account</label>
                <textarea
                  rows={2}
                  value={paymentConfig.qrisNote || ''}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, qrisNote: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300"
                />
              </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.updateSuperadminPaymentConfig(paymentConfig);
                      flash('Pengaturan rekening pembayaran berhasil disimpan.');
                    }}
                    className="h-9 px-5 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white font-bold"
                  >
                    Simpan Pengaturan Pembayaran
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

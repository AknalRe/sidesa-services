import axios from 'axios';
import { getAppPrefix } from '../lib/assets';

const client = axios.create({
  baseURL: `${getAppPrefix()}/api`,
  withCredentials: true,
});

export function setActiveSuperadminVillage(villageId: string | null) {
  if (villageId) {
    client.defaults.headers.common['x-sidesa-village-id'] = villageId;
  } else {
    delete client.defaults.headers.common['x-sidesa-village-id'];
  }
}

export const api = {
  // Public Village Portal (supports multi-village slug e.g. /desa/nama-desa)
  getPublicVillages: async () => (await client.get('/public/villages')).data.data,
  getPublicPlans: async () => (await client.get('/public/plans')).data.data,
  verifyStudent: async (payload: {
    nim: string;
    studentName: string;
    university: string;
    studyProgram?: string;
  }) => (await client.post('/public/verify-student', payload)).data.data,
  searchWilayah: async (name: string) =>
    (await client.get('/public/wilayah/search', { params: { name } })).data.data,
  getWilayahDetail: async (code: string) =>
    (await client.get(`/public/wilayah/detail/${encodeURIComponent(code)}`)).data.data,
  getPublicVillage: async (villageSlug?: string) =>
    (await client.get('/public/village', { params: villageSlug ? { village: villageSlug } : undefined })).data.data,
  getPublicInfografis: async (year?: number, villageSlug?: string) =>
    (
      await client.get('/public/infografis', {
        params: {
          ...(year ? { year } : {}),
          ...(villageSlug ? { village: villageSlug } : {}),
        },
      })
    ).data.data,
  checkBansos: async (q: string, villageSlug?: string) =>
    (
      await client.get('/public/bansos/check', {
        params: { q, ...(villageSlug ? { village: villageSlug } : {}) },
      })
    ).data.data,
  getPublicNews: async (villageSlug?: string) =>
    (await client.get('/public/berita', { params: villageSlug ? { village: villageSlug } : undefined })).data.data,
  getPublicNewsDetail: async (slug: string, villageSlug?: string) =>
    (
      await client.get(`/public/berita/${slug}`, {
        params: villageSlug ? { village: villageSlug } : undefined,
      })
    ).data.data,
  getPublicUmkm: async (villageSlug?: string) =>
    (await client.get('/public/belanja', { params: villageSlug ? { village: villageSlug } : undefined })).data.data,
  getPublicPpid: async (category?: string, villageSlug?: string) =>
    (
      await client.get('/public/ppid', {
        params: {
          ...(category ? { category } : {}),
          ...(villageSlug ? { village: villageSlug } : {}),
        },
      })
    ).data.data,
  submitPpidRequest: async (payload: Record<string, any>) =>
    (await client.post('/public/ppid/request', payload)).data.data,
  submitComplaint: async (payload: Record<string, any>) =>
    (await client.post('/public/pengaduan', payload)).data.data,
  trackComplaint: async (code: string) => (await client.get(`/public/pengaduan/track/${code}`)).data.data,
  submitLetterRequest: async (payload: Record<string, any>) =>
    (await client.post('/public/surat/request', payload)).data.data,
  trackLetter: async (code: string) => (await client.get(`/public/surat/track/${code}`)).data.data,

  // Auth
  getAuthStatus: async () => (await client.get('/auth/status')).data.data,
  setupAdmin: async (payload: { name: string; email: string; password: string }) =>
    (await client.post('/auth/setup', payload)).data.data,
  registerVillage: async (payload: {
    villageName: string;
    slug?: string;
    district?: string;
    regency?: string;
    province?: string;
    kodeDesa?: string;
    name: string;
    email: string;
    password: string;
    planCode?: string;
    durationMonths?: number;
    paymentMethod?: string;
    studentNim?: string;
    studentName?: string;
    studentUniversity?: string;
    studentProgram?: string;
  }) => (await client.post('/auth/register-village', payload)).data.data,
  claimVillage: async (payload: {
    villageSlug: string;
    name: string;
    position?: string;
    phone?: string;
    email: string;
    password: string;
    planCode?: string;
    durationMonths?: number;
    paymentMethod?: string;
    studentNim?: string;
    studentName?: string;
    studentUniversity?: string;
    studentProgram?: string;
  }) => (await client.post('/auth/claim-village', payload)).data.data,
  login: async (payload: { email: string; password: string }) =>
    (await client.post('/auth/login', payload)).data.data,
  logout: async () => (await client.post('/auth/logout')).data,

  // Village Billing & Subscription (Hosting-style)
  getBilling: async () => (await client.get('/admin/billing')).data.data,
  createBillingInvoice: async (payload: { planCode: string; durationMonths: number; paymentMethod?: string }) =>
    (await client.post('/admin/billing/invoices', payload)).data.data,
  confirmBillingInvoice: async (
    id: string,
    payload: { paymentMethod?: string; paymentReference?: string; paymentNote?: string }
  ) => (await client.post(`/admin/billing/invoices/${id}/confirm`, payload)).data.data,
  syncBillingInvoice: async (id: string) => (await client.post(`/admin/billing/invoices/${id}/sync`)).data.data,

  // Superadmin Platform SaaS
  getSuperadminOverview: async () => (await client.get('/superadmin/overview')).data.data,
  getSuperadminVillages: async () => (await client.get('/superadmin/villages')).data.data,
  createSuperadminVillage: async (payload: Record<string, any>) =>
    (await client.post('/superadmin/villages', payload)).data.data,
  updateSuperadminVillage: async (
    id: string,
    payload: { status?: string; licenseStatus?: string; licensePlan?: string; isClaimed?: boolean; extendMonths?: number }
  ) => (await client.patch(`/superadmin/villages/${id}`, payload)).data.data,
  deleteSuperadminVillage: async (id: string) => (await client.delete(`/superadmin/villages/${id}`)).data,
  getSuperadminInvoices: async () => (await client.get('/superadmin/invoices')).data.data,
  approveSuperadminInvoice: async (id: string) =>
    (await client.patch(`/superadmin/invoices/${id}/approve`)).data.data,
  cancelSuperadminInvoice: async (id: string) =>
    (await client.patch(`/superadmin/invoices/${id}/cancel`)).data.data,
  getSuperadminPlans: async () => (await client.get('/superadmin/plans')).data.data,
  updateSuperadminPlan: async (id: string, payload: Record<string, any>) =>
    (await client.patch(`/superadmin/plans/${id}`, payload)).data.data,
  getSuperadminPaymentConfig: async () => (await client.get('/superadmin/payment-config')).data.data,
  updateSuperadminPaymentConfig: async (payload: Record<string, string>) =>
    (await client.patch('/superadmin/payment-config', payload)).data.data,

  // Admin Back-Office
  getDashboard: async () => (await client.get('/admin/dashboard')).data.data,
  getVillageProfile: async () => (await client.get('/admin/village')).data.data,
  updateVillageProfile: async (payload: Record<string, any>) =>
    (await client.patch('/admin/village', payload)).data.data,
  getResidents: async () => (await client.get('/admin/residents')).data.data,
  createResident: async (payload: Record<string, any>) =>
    (await client.post('/admin/residents', payload)).data.data,
  deleteResident: async (id: string) => (await client.delete(`/admin/residents/${id}`)).data,
  getLetters: async () => (await client.get('/admin/letters')).data.data,
  updateLetter: async (id: string, payload: { status?: string; adminNotes?: string; letterNumber?: string }) =>
    (await client.patch(`/admin/letters/${id}`, payload)).data.data,
  getApbdes: async () => (await client.get('/admin/apbdes')).data.data,
  createApbdes: async (payload: Record<string, any>) =>
    (await client.post('/admin/apbdes', payload)).data.data,
  deleteApbdes: async (id: string) => (await client.delete(`/admin/apbdes/${id}`)).data,
  getBansos: async () => (await client.get('/admin/bansos')).data.data,
  createBansos: async (payload: Record<string, any>) =>
    (await client.post('/admin/bansos', payload)).data.data,
  deleteBansos: async (id: string) => (await client.delete(`/admin/bansos/${id}`)).data,
  getPbb: async () => (await client.get('/admin/pbb')).data.data,
  createPbb: async (payload: Record<string, any>) => (await client.post('/admin/pbb', payload)).data.data,
  updatePbbStatus: async (id: string, status: string) =>
    (await client.patch(`/admin/pbb/${id}`, { status })).data.data,
  getComplaints: async () => (await client.get('/admin/complaints')).data.data,
  updateComplaint: async (id: string, payload: { status: string; responseText?: string }) =>
    (await client.patch(`/admin/complaints/${id}`, payload)).data.data,
  getNewsAdmin: async () => (await client.get('/admin/news')).data.data,
  createNews: async (payload: Record<string, any>) => (await client.post('/admin/news', payload)).data.data,
  updateNews: async (id: string, payload: Record<string, any>) =>
    (await client.patch(`/admin/news/${id}`, payload)).data.data,
  deleteNews: async (id: string) => (await client.delete(`/admin/news/${id}`)).data,
  getUmkmAdmin: async () => (await client.get('/admin/umkm')).data.data,
  createUmkm: async (payload: Record<string, any>) => (await client.post('/admin/umkm', payload)).data.data,
  deleteUmkm: async (id: string) => (await client.delete(`/admin/umkm/${id}`)).data,
  getOfficials: async () => (await client.get('/admin/officials')).data.data,
  createOfficial: async (payload: Record<string, any>) =>
    (await client.post('/admin/officials', payload)).data.data,
  deleteOfficial: async (id: string) => (await client.delete(`/admin/officials/${id}`)).data,
  getPpidAdmin: async () => (await client.get('/admin/ppid')).data.data,
  createPpidDoc: async (payload: Record<string, any>) =>
    (await client.post('/admin/ppid/documents', payload)).data.data,
  deletePpidDoc: async (id: string) => (await client.delete(`/admin/ppid/documents/${id}`)).data,
  updatePpidRequest: async (id: string, payload: { status: string; responseText?: string; responseNotes?: string }) =>
    (await client.patch(`/admin/ppid/requests/${id}`, payload)).data.data,
  getPlacesAdmin: async () => (await client.get('/admin/places')).data.data,
  createPlace: async (payload: Record<string, any>) => (await client.post('/admin/places', payload)).data.data,
  deletePlace: async (id: string) => (await client.delete(`/admin/places/${id}`)).data,
  getIndicatorsAdmin: async () => (await client.get('/admin/indicators')).data.data,
  saveIndicator: async (payload: Record<string, any>) => (await client.post('/admin/indicators', payload)).data.data,
  getAttendance: async () => (await client.get('/admin/attendance')).data.data,
  createAttendance: async (payload: Record<string, any>) =>
    (await client.post('/admin/attendance', payload)).data.data,
};

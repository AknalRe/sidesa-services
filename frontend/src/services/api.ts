import axios from 'axios';

const client = axios.create({
  baseURL: './api',
  withCredentials: true,
});

export const api = {
  // Public Village Portal
  getPublicVillage: async () => (await client.get('/public/village')).data.data,
  getPublicInfografis: async (year?: number) =>
    (await client.get('/public/infografis', { params: year ? { year } : undefined })).data.data,
  checkBansos: async (q: string) => (await client.get('/public/bansos/check', { params: { q } })).data.data,
  getPublicNews: async () => (await client.get('/public/berita')).data.data,
  getPublicNewsDetail: async (slug: string) => (await client.get(`/public/berita/${slug}`)).data.data,
  getPublicUmkm: async () => (await client.get('/public/belanja')).data.data,
  getPublicPpid: async (category?: string) =>
    (await client.get('/public/ppid', { params: category ? { category } : undefined })).data.data,
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
  setupAdmin: async (payload: { name: string; email: string; password: string; villageName?: string }) =>
    (await client.post('/auth/setup', payload)).data.data,
  login: async (payload: { email: string; password: string }) =>
    (await client.post('/auth/login', payload)).data.data,
  logout: async () => (await client.post('/auth/logout')).data,

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
  getAttendance: async () => (await client.get('/admin/attendance')).data.data,
  createAttendance: async (payload: Record<string, any>) =>
    (await client.post('/admin/attendance', payload)).data.data,
};

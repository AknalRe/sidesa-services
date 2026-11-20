const WILAYAH_API_BASE = 'https://wilayah.smartartstudio.my.id/api';

async function fetchWilayahJson(path: string, timeoutMs = 8000): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${WILAYAH_API_BASE}${path}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ReneoSIDesa-WilayahClient/1.0',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchWilayah(name: string) {
  const q = String(name || '').trim();
  if (q.length < 2) return [];
  const res = await fetchWilayahJson(`/wilayah/search?name=${encodeURIComponent(q)}`);
  const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return rows;
}

export async function getWilayahDetail(kode: string) {
  const clean = String(kode || '').trim();
  if (!clean) return null;
  const detail = await fetchWilayahJson(`/wilayah/${encodeURIComponent(clean)}`);
  if (!detail) return null;

  // Resolve parent names (province, regency, district) if available
  const parents = detail.parents || {};
  const [prov, reg, dist] = await Promise.all([
    parents.province ? fetchWilayahJson(`/provinces/${encodeURIComponent(parents.province)}`) : Promise.resolve(null),
    parents.regency ? fetchWilayahJson(`/wilayah/${encodeURIComponent(parents.regency)}`) : Promise.resolve(null),
    parents.district ? fetchWilayahJson(`/wilayah/${encodeURIComponent(parents.district)}`) : Promise.resolve(null),
  ]);

  return {
    kode: detail.kode || clean,
    nama: detail.nama || '',
    level: detail.level || '',
    kodepos: detail.kodepos || '',
    logoUrl: detail.logo_url || null,
    coordinates: detail.coordinates || null,
    boundary: detail.boundary || null,
    parents: {
      provinceCode: parents.province || '',
      provinceName: prov?.nama || prov?.data?.nama || '',
      regencyCode: parents.regency || '',
      regencyName: reg?.nama || '',
      districtCode: parents.district || '',
      districtName: dist?.nama || '',
    },
  };
}

export async function listWilayahProvinces() {
  const res = await fetchWilayahJson('/provinces');
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function listWilayahRegencies(provinceCode: string) {
  const res = await fetchWilayahJson(`/provinces/${encodeURIComponent(provinceCode)}/regencies`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function listWilayahDistricts(regencyCode: string) {
  const res = await fetchWilayahJson(`/regencies/${encodeURIComponent(regencyCode)}/districts`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function listWilayahVillages(districtCode: string) {
  const res = await fetchWilayahJson(`/districts/${encodeURIComponent(districtCode)}/villages`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

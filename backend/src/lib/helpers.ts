import crypto from 'crypto';

export const LETTER_TYPES: Array<{ code: string; label: string; regCode: string }> = [
  { code: 'SKTM', label: 'Surat Keterangan Tidak Mampu (SKTM)', regCode: '401' },
  { code: 'DOMISILI', label: 'Surat Keterangan Domisili', regCode: '470' },
  { code: 'SKU', label: 'Surat Keterangan Usaha (SKU)', regCode: '503' },
  { code: 'KELAHIRAN', label: 'Surat Keterangan Kelahiran', regCode: '472.11' },
  { code: 'KEMATIAN', label: 'Surat Keterangan Kematian', regCode: '472.12' },
  { code: 'PENGANTAR_NIKAH', label: 'Surat Pengantar Nikah (N1–N4)', regCode: '474.2' },
  { code: 'PINDAH', label: 'Surat Pengantar Pindah Domisili', regCode: '475' },
  { code: 'LAINNYA', label: 'Surat Keterangan Umum Lainnya', regCode: '470' },
];

export function generateTrackingCode(prefix: 'SRT' | 'ADU' | 'PPID'): string {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  const ym = new Date().toISOString().slice(2, 7).replace('-', '');
  return `${prefix}-${ym}-${rand}`;
}

export function formatOfficialLetterNumber(
  letterType: string,
  sequence: number,
  kodeDesa?: string | null,
  date: Date = new Date()
): string {
  const meta = LETTER_TYPES.find((t) => t.code === letterType) || LETTER_TYPES[LETTER_TYPES.length - 1];
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const seqStr = String(Math.max(1, sequence)).padStart(3, '0');
  const monthRoman = romanMonths[date.getMonth()] || 'I';
  const year = date.getFullYear();
  const code = (kodeDesa || 'DESA').replace(/\s+/g, '');
  return `${meta.regCode}/${seqStr}/${code}/${monthRoman}/${year}`;
}

export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || `berita-${Date.now()}`
  );
}

export function aggregateDemographics(
  rows: Array<{
    kkNumber: string;
    gender: string;
    birthDate?: string | null;
    dusun: string;
    education?: string | null;
    occupation?: string | null;
    religion?: string | null;
    maritalStatus?: string | null;
    isVoter: boolean;
    status: string;
  }>
) {
  const active = rows.filter((r) => r.status === 'AKTIF');
  const kkSet = new Set(active.map((r) => r.kkNumber).filter(Boolean));
  const male = active.filter((r) => r.gender === 'L').length;
  const female = active.filter((r) => r.gender === 'P').length;
  const voters = active.filter((r) => r.isVoter).length;

  const countBy = (getter: (r: (typeof active)[number]) => string) => {
    const map = new Map<string, number>();
    for (const r of active) {
      const k = getter(r) || 'Lainnya';
      map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  };

  const nowYear = new Date().getFullYear();
  const ageBuckets: Record<string, number> = {
    '0–14 Tahun': 0,
    '15–24 Tahun': 0,
    '25–44 Tahun': 0,
    '45–64 Tahun': 0,
    '65+ Tahun': 0,
  };
  for (const r of active) {
    if (!r.birthDate) continue;
    const birthYear = parseInt(r.birthDate.slice(0, 4), 10);
    if (!Number.isFinite(birthYear)) continue;
    const age = nowYear - birthYear;
    if (age <= 14) ageBuckets['0–14 Tahun']++;
    else if (age <= 24) ageBuckets['15–24 Tahun']++;
    else if (age <= 44) ageBuckets['25–44 Tahun']++;
    else if (age <= 64) ageBuckets['45–64 Tahun']++;
    else ageBuckets['65+ Tahun']++;
  }

  return {
    totalResidents: active.length,
    totalHouseholds: kkSet.size,
    male,
    female,
    voters,
    byDusun: countBy((r) => r.dusun),
    byEducation: countBy((r) => r.education || 'Tidak Tercatat'),
    byOccupation: countBy((r) => r.occupation || 'Lainnya'),
    byReligion: countBy((r) => r.religion || 'Lainnya'),
    byMaritalStatus: countBy((r) => r.maritalStatus || 'Lainnya'),
    byAgeGroup: Object.entries(ageBuckets).map(([label, total]) => ({ label, total })),
  };
}

export function summarizeApbdes(
  items: Array<{
    fiscalYear: number;
    category: string;
    subCategory: string;
    label: string;
    budgetAmount: number;
    realizedAmount: number;
  }>,
  year?: number
) {
  const years = Array.from(new Set(items.map((i) => i.fiscalYear))).sort((a, b) => b - a);
  const selectedYear = year && years.includes(year) ? year : years[0] || new Date().getFullYear();
  const filtered = items.filter((i) => i.fiscalYear === selectedYear);

  const sumCat = (cat: string) => {
    const list = filtered.filter((i) => i.category === cat);
    return {
      budget: list.reduce((s, i) => s + Number(i.budgetAmount || 0), 0),
      realized: list.reduce((s, i) => s + Number(i.realizedAmount || 0), 0),
      items: list,
    };
  };

  const pendapatan = sumCat('PENDAPATAN');
  const belanja = sumCat('BELANJA');
  const pembiayaan = sumCat('PEMBIAYAAN');

  return {
    fiscalYear: selectedYear,
    availableYears: years,
    pendapatan,
    belanja,
    pembiayaan,
    surplusDeficit: pendapatan.realized - belanja.realized,
  };
}

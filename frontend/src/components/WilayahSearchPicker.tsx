import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../services/api';

export interface SelectedWilayah {
  kode: string;
  name: string;
  slug: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

export const WilayahSearchPicker: React.FC<{
  onSelect: (w: SelectedWilayah) => void;
}> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolvingCode, setResolvingCode] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const rows = await api.searchWilayah(query.trim());
      setResults((rows || []).filter((r: any) => r.level_code === 4 || String(r.kode || '').length >= 13).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePick = async (item: any) => {
    setResolvingCode(item.kode);
    try {
      const detail = await api.getWilayahDetail(item.kode);
      const rawName = String(detail?.nama || item.nama || '').trim();
      const villageName = /^desa\s|^kelurahan\s/i.test(rawName) ? rawName : `Desa ${rawName}`;
      const slug = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const regName = String(detail?.parents?.regencyName || '')
        .replace(/^KAB\.\s*|^KABUPATEN\s*|^KOTA\s*/i, '')
        .trim();
      const distName = String(detail?.parents?.districtName || '').trim();
      const provName = String(detail?.parents?.provinceName || 'Jawa Timur').trim();

      onSelect({
        kode: item.kode,
        name: villageName,
        slug,
        district: distName,
        regency: regName,
        province: provName,
        postalCode: String(detail?.kodepos || item.kodepos || ''),
        lat: detail?.coordinates?.lat,
        lng: detail?.coordinates?.lng,
      });
      setSelectedLabel(`${villageName} (${item.kode})${distName ? ` · Kec. ${distName}` : ''}${regName ? `, ${regName}` : ''}`);
      setResults([]);
    } finally {
      setResolvingCode(null);
    }
  };

  return (
    <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200 space-y-2 text-xs">
      <div className="font-bold text-[#0B2A57] flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-[#0069b6]" />
        <span>Cari &amp; Mapping Wilayah Resmi Kemendagri (Otomatis Isi Kode &amp; Peta Polygon)</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSearch();
            }
          }}
          placeholder="Ketik nama desa (mis. Pohjejer, Gondang)..."
          className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
        />
        <button
          type="button"
          disabled={searching}
          onClick={() => void handleSearch()}
          className="h-9 px-3.5 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] text-white font-bold inline-flex items-center gap-1.5 shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{searching ? 'Mencari...' : 'Cari Desa'}</span>
        </button>
      </div>
      {selectedLabel && (
        <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-md">
          Wilayah terpilih: {selectedLabel}
        </div>
      )}
      {results.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.kode}
              type="button"
              disabled={resolvingCode === r.kode}
              onClick={() => void handlePick(r)}
              className="w-full px-3 py-2 text-left hover:bg-sky-50 flex items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-slate-900">{r.nama}</div>
                <div className="font-mono text-[10px] text-slate-500">
                  Kode: {r.kode} {r.kodepos ? `· Kode Pos ${r.kodepos}` : ''}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#0069b6]">
                {resolvingCode === r.kode ? 'Memuat...' : 'Pilih'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

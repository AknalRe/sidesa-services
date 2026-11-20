import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { api } from '../services/api';
import { resolveAssetUrl } from '../lib/assets';

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (nextUrl: string) => void;
  placeholder?: string;
  preserveTransparency?: boolean;
  compact?: boolean;
}

async function readAndOptimizeImage(file: File, preserveTransparency = false): Promise<string> {
  if (file.type === 'image/svg+xml' || (preserveTransparency && file.type === 'image/png' && file.size <= 2 * 1024 * 1024)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new window.Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        const maxSide = preserveTransparency ? 800 : 1600;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outType = preserveTransparency || file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const outDataUrl = canvas.toDataURL(outType, outType === 'image/jpeg' ? 0.85 : undefined);
        resolve(outDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Belum ada foto dipilih',
  preserveTransparency = false,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = value ? resolveAssetUrl(value, '') : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG, WEBP, atau SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran foto maksimal 10 MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readAndOptimizeImage(file, preserveTransparency);
      const uploaded = await api.uploadImage(dataUrl, file.name);
      if (uploaded?.url) {
        onChange(uploaded.url);
      } else {
        setError('Upload berhasil tetapi URL foto tidak dikembalikan server.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block font-bold text-slate-700">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        className={`flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/70 ${
          compact ? 'p-2' : 'p-2.5'
        }`}
      >
        <div
          className={`${
            compact ? 'w-10 h-10' : 'w-14 h-14'
          } rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className={`w-full h-full ${preserveTransparency ? 'object-contain p-1' : 'object-cover'}`}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-[#0069b6] hover:bg-[#005a9e] disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploading ? 'Memproses...' : previewUrl ? 'Ganti Foto' : 'Pilih / Upload Foto'}</span>
            </button>
            {previewUrl && !uploading && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="h-8 px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
          {!previewUrl && <div className="text-[11px] text-slate-500 truncate">{placeholder}</div>}
          {error && <div className="text-[11px] font-semibold text-rose-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

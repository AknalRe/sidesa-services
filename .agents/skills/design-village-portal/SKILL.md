---
name: design-village-portal
description: >-
  Standar desain UI/UX full-width untuk Portal Resmi Pemerintahan Desa (sugihwaras.digitaldesa.id)
  dan Platform SaaS Sistem Informasi Desa (digitaldesa.id / Reneo SIDesa). Melarang kotak-kotak
  SaaS AI slop sempit; mewajibkan layout full-width (w-full), tipografi Outfit, lambang kabupaten,
  hero fotografi desa full-bleed, dan struktur seksi autentik desa Indonesia.
---

# Design Village Portal (Reneo SIDesa)

Gunakan skill ini setiap kali merancang atau memperbarui halaman Website Resmi Desa (`PublicPortal.tsx`) maupun Beranda Platform SaaS SIDesa (`LandingPage.tsx`).

## 1. Aturan Utama: Full-Width & Anti-SaaS-Box-Slop

1. **Wajib Full-Width (`w-full`, padding horizontal `px-4 sm:px-8 lg:px-14 xl:px-20`)**:
   - **DILARANG** mengurung seluruh halaman di dalam `max-w-7xl` yang menyisakan ruang kosong lebar di kiri-kanan layar desktop.
   - Navbar, Hero Jumbotron/Carousel, dan Footer wajib membentang 100% lebar viewport (`w-full`).
2. **DILARANG Gaya "AI Slop SaaS Kit"**:
   - Hindari deretan kotak kecil kaku `border border-slate-200 rounded-xl p-4` dengan pill badge kecil dan teks monospace di setiap sudut.
   - Gunakan kanvas terang `#F6F6F6` khas portal desa (`sugihwaras.digitaldesa.id`), tipografi **Outfit** yang ramah dan tegas (`text-3xl lg:text-[42px] font-extrabold text-[#099cff] uppercase`), serta fotografi/ilustrasi kegiatan desa nyata.

## 2. Struktur Wajib Website Resmi Desa (`PublicPortal.tsx` — Benchmark `sugihwaras.digitaldesa.id`)

- **Navbar Full-Width (`bg-[#0069b6]`)**: Lambang Kabupaten (`300_bojonegorokab.png`) + Nama Desa & Kabupaten di kiri; menu putih tegas (`Home`, `Profil Desa`, `SOTK`, `Infografis`, `Listing`, `Layanan Surat`, `Berita`, `Belanja`, `PPID`, `Pengaduan`) di kanan.
- **Hero Full-Screen / Full-Width Carousel (`h-[520px] lg:h-[640px]`)**: Foto lanskap/kegiatan desa full-bleed dengan judul besar di tengah (*"Selamat Datang — Website Resmi Desa Sugihwaras"*).
- **11 Seksi Beranda Desa Full-Width**:
  1. **JELAJAHI DESA**: Grid 50/50 (teks pengantar besar di kiri, 8 kartu ikon SVG besar di kanan: *Profil Desa, Infografis, IDM, PPID, Berita, Belanja, Bansos, Layanan Surat*).
  2. **Sambutan Kepala Desa**: Podium lambang kabupaten/foto Kades bulat besar di kiri + teks sambutan hangat di kanan.
  3. **PETA DESA**: Peta interaktif OpenStreetMap full-width (`h-[460px]`).
  4. **SOTK**: 4 kartu potret vertikal perangkat desa (`bg-[#099cff]`) dengan bar nama & jabatan di bawah.
  5. **Administrasi Penduduk**: Grid 2×3 bar horizontal besar dengan blok angka biru gradient di kiri (`4.115 | Penduduk`, `Laki-Laki`, `Kepala Keluarga`, `Perempuan`, `Wajib Pilih`, `Wilayah Dusun`).
  6. **APB Desa**: Ilustrasi di kiri + kartu angka besar Pendapatan, Belanja, dan Pembiayaan di kanan.
  7. **Berita Desa**: 3 kartu berita fotografi besar dengan badge tanggal di sudut kanan bawah.
  8. **Potensi & Wisata Desa**: Banner fotografi gelap full-width dengan kartu destinasi/potensi desa.
  9. **Beli Dari Desa**: Katalog foto produk UMKM warga dengan harga & tombol pesan WhatsApp.
  10. **Galeri Desa**: Grid foto dokumentasi kegiatan warga.
  11. **Floating Quick Widgets & Footer (`bg-[#003865]`)**: Tombol mengambang `Kunjungan Website` (kiri bawah) dan `Pengaduan Warga` (kanan bawah).

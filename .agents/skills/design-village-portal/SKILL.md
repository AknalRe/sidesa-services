---
name: design-village-portal
description: >-
  Standar desain UI/UX untuk Portal Resmi Pemerintahan Desa (Website Profil Desa)
  dan SaaS Sistem Informasi Desa (Reneo SIDesa / DIGIDES benchmark). Menggabungkan
  prinsip Dieter Rams (design-is), UI Design Audit (design-ui-audit), dan Anti-Slop Reneo.
---

# Design Village Portal (Reneo SIDesa)

Gunakan skill ini saat merancang atau memperbarui halaman Portal Resmi Desa (`PublicPortal.tsx`), Beranda SaaS SIDesa (`LandingPage.tsx`), maupun Back-Office Desa (`AdminPanel.tsx`).

## 1. Karakter Visual Website Resmi Desa (Benchmark `sugihwaras.digitaldesa.id`)

Website desa yang baik **bukan** dashboard admin kaku yang hanya berisi kotak angka, melainkan **wajah resmi pemerintahan dan kehidupan warga desa**:
1. **Identitas Resmi Pemerintahan (Civic Authority)**:
   - Selalu tampilkan strip identitas pemerintah di bagian atas: `Pemerintah Kabupaten · Kecamatan · Nama Desa`, Kode Kemendagri (`35.xx.xx.xxxx`), dan jam layanan kantor desa.
2. **Alur Cerita Beranda Desa (Vertical Civic Storytelling)**:
   - **Hero Desa + Sorotan Berita Utama**: Menampilkan sambutan resmi desa, status Indeks Desa Membangun (IDM), tombol layanan cepat warga, serta sorotan berita kegiatan terbaru.
   - **Menu Cepat "Jelajahi Desa"**: 8 kartu ikon navigasi cepat ke modul utama (*Profil Desa, Pemerintahan/SOTK, Infografis Penduduk, APBDes, Cek Bansos, Layanan Surat, Beli dari Desa/UMKM, PPID & Pengaduan*).
   - **Sambutan Kepala Desa**: Menampilkan profil Kepala Desa, kutipan sambutan yang hangat dan membumi, serta Visi Desa.
   - **Aparatur Pemerintah Desa (SOTK)**: Menampilkan jajaran perangkat desa dengan hierarki jelas (Kepala Desa, Sekretaris Desa, Kasi/Kaur, Kepala Dusun).
   - **Infografis Ringkas (Penduduk & APBDes)**:Dilengkapi progress bar penyerapan anggaran dan grafik distribusi dusun agar warga awam langsung memahami data tanpa membaca tabel rumit.
   - **WebGIS / Peta Wilayah & Fasilitas Desa**: Menampilkan peta lokasi desa, batas wilayah 4 arah mata angin, serta titik lokasi penting (Balai Desa, Polindes, Sekolah, Pasar/UMKM, Wisata/Pertanian).
   - **Berita Kegiatan, Potensi Desa & Lapak UMKM ("Beli dari Desa")**: Menghidupkan aktivitas sosial dan ekonomi warga desa.

## 2. Aturan Kualitas Visual (Dieter Rams + UI Audit + Anti-Slop)

- **Hirarki 1 Detik**: Setiap halaman memiliki header seksi dengan breadcrumb (`Beranda / Nama Modul`), judul tegas, dan subjudul penjelas.
- **Palet Warna**:
  - **Reneo Navy (`#0B2A57`)** untuk strip otoritas pemerintahan, header formal, dan footer resmi.
  - **Reneo Emerald (`#047857` / `#10B981`)** untuk identitas kemakmuran desa, status aktif, dan progress bar anggaran/demografi.
  - **Slate Neutrals (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#475569`)** untuk keterbacaan tinggi (kontras ≥ 4.5:1).
- **Tipografi**:
  - Data teknis (NIK, Nomor Surat, Kode Lacak, Kode Desa, Nominal Rupiah APBDes, Koordinat Peta, Skor IDM/SDGs) **wajib** memakai font monospace (`font-mono`).
- **Bebas Slop**:
  - Dilarang bulatan traffic-light macOS.
  - Dilarang ikon `Sparkles`, `Sparkle`, `WandSparkles`, atau klaim palsu.
  - Dilarang menyembunyikan empty/loading/error state.

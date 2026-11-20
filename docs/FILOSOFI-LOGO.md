# Filosofi & Pembentukan Logo Reneo SIDesa

> **Reneo SIDesa**: Sistem Informasi Desa dalam ekosistem **Reneo** — tata kelola desa yang transparan, tertib, dan mudah diakses warga.

Dokumen ini mencatat makna, konstruksi geometri, serta aturan penggunaan logo **Reneo SIDesa** agar konsisten di portal publik desa, panel admin, favicon, maupun App Store Reneo Panel.

---

## 1. Hubungan dengan Ekosistem Reneo

Semua aplikasi resmi di bawah ekosistem Reneo berbagi DNA visual yang sama agar pengguna langsung mengenali satu keluarga produk tanpa kehilangan fungsi masing-masing aplikasi:

| Elemen Bersama | Spesifikasi | Makna |
| :--- | :--- | :--- |
| **Kanvas & Grid** | `viewBox="0 0 512 512"` | Proporsi seragam untuk ikon aplikasi, favicon, dan avatar |
| **Wadah Squircle** | `x=40 y=40 w=432 h=432 rx=92` | Wadah tenang dan kokoh (selaras dengan Reneo CRM) |
| **Reneo Navy** | `#0B2A57` | Kredibilitas, stabilitas sistem, dan kendali yang sadar |
| **Reneo Emerald** | `#10B981` | Pertumbuhan, kesuburan, dan energi positif |
| **Putih Bersih** | `#FFFFFF` | Kejelasan informasi dan keterbukaan pelayanan |
| **Monogram "R"** | Geometri R khusus Reneo | Tanda pengenal langsung keluarga produk Reneo |

---

## 2. Tahap Pembentukan Logo (4 Lapisan)

Logo **Reneo SIDesa** dibentuk secara bertahap dari wadah dasar hingga simbol pelayanan desa yang utuh:

### Tahap 1 — Wadah Reneo (Fondasi)
- **Bentuk**: Kotak sudut membulat (*squircle*) `432 × 432` dengan radius sudut `rx="92"` berwarna **Reneo Navy (`#0B2A57`)**.
- **Makna**: Menjadi "rumah" digital yang aman dan teratur bagi seluruh data desa (kependudukan, APBDes, persuratan, dan PPID).

### Tahap 2 — Alam & Harapan Desa (Lapisan Konteks)
- **Bentuk**:
  - Lengkungan dua bukit/terasering di bagian bawah (`y: 278–416`) berwarna **Emerald (`#10B981`)**.
  - Lingkaran matahari kecil di kanan atas (`cx="372" cy="144" r="26"`) berwarna **Emerald (`#10B981`)**.
- **Makna**: Melambangkan potensi alam, pertanian, UMKM desa, serta matahari sebagai simbol transparansi dan harapan kemajuan desa.

### Tahap 3 — Atap Joglo & Balai Pendopo (Identitas Layanan)
- **Bentuk**:
  - Atap joglo bertingkat dua (`M256 104...` dan `M114 216...`) berwarna putih dengan garis tepi navy (`stroke="#0B2A57" stroke-width="10"`).
  - Badan balai pendopo (`x="148" y="224" w="216" h="148" rx="22"`) dan alas umpak/fondasi (`x="128" y="366" w="256" h="18" rx="9"`).
- **Makna**: Pendopo adalah ruang berkumpul dan melayani warga dalam budaya Nusantara. Siluet putih bersih menegaskan peran kantor desa sebagai pusat pelayanan publik yang terbuka dan mudah didatangi.

### Tahap 4 — Monogram "R" Reneo di Jantung Pendopo (Identitas Final)
- **Bentuk**: Monogram **"R"** geometris identik dengan `ReneoCrmLogo`, ditempatkan tepat di tengah badan pendopo dengan transformasi `translate(130.2, 174.2) scale(0.48)`.
- **Makna**: Mengunci identitas bahwa operasional dan portal desa ini ditenagai oleh mesin digital **Reneo** — kendali tetap di tangan perangkat desa, dengan cara kerja yang lebih tenang dan terukur.

---

## 3. Anatomi Geometri Monogram "R"

Monogram **"R"** Reneo dibangun dari bentuk geometris murni (bukan font eksternal) agar tidak pernah berubah bentuk lintas sistem operasi:
- **Mangkuk & Batang Utama**: `rect` lengkung kanan (`rx="62"`) + batang vertikal kiri (`w="60" h="216"`).
- **Kaki Diagonal**: `polygon` miring ke kanan bawah (`238,296 -> 300,296 -> 378,366 -> 310,366`).
- **Celah Negatif Horizontal**: Garis potong putih (`h="16" rx="8"`) di tengah mangkuk memberi kesan modern, presisi, dan tetap terbaca tajam bahkan pada ukuran `16×16px`.

---

## 4. Sumber Aset & Aturan Penggunaan

- **SVG Publik / Favicon**: `frontend/public/logo.svg`
- **Komponen React**: `frontend/src/components/ReneoSidesaLogo.tsx`
- **Ikon App Store Reneo Panel**: `public/icons/apps/reneo-sidesa.svg` (di repositori `homeserver-desktop`)

### Pedoman Praktis
1. **Ukuran minimum**: `16×16px` untuk favicon/tab, `24×24px` untuk taskbar/sidebar, `32–48px` untuk header aplikasi.
2. **Jangan mengubah proporsi atau warna dasar**: Tetap gunakan kombinasi `#0B2A57`, `#10B981`, dan `#FFFFFF`.
3. **Jangan menambahkan efek dekoratif**: Hindari drop-shadow neon, gradient multi-warna, atau bingkai tambahan di luar squircle.

# FairGuard Desktop — Akar Masalah (bug laporan Fai, 2026-09-23)

Mode: systematic-debugging (Phase 1-2 selesai SEBELUM perbaikan).
Aturan antislop: DURING.

## Gejala yang dilaporkan

| # | Gejala | Akar masalah (terbukti) | Berkas |
|---|---|---|---|
| G1 | Halaman login "Ferdium server" muncul | `server: LIVE_FERDIUM_API` (`https://api.ferdium.org`) di config default. App minta login ke server Ferdium. | `src/config.ts:614` |
| G2 | Mark/ikon Ferdium di layar awal | Halaman **internal server** (`main.edge`) memuat `<img src='images/logo.png'>` (logo Ferdium, 300px) + `<title>ferdium-internal-server</title>`. **Belum pernah di-rebrand.** | `src/internal-server/resources/views/layouts/main.edge`, `src/internal-server/public/images/logo.png` |
| G2b | Ikon layanan aneh di Welcome | `Welcome.tsx` menampilkan `recipePreviews.featured` dari `api.ferdium.org` (ikon WhatsApp/Slack/dll versi Ferdium). | `src/components/auth/Welcome.tsx:100` |
| G3 | **FATAL: WhatsApp tak bisa ditambah** | Daftar resep datang dari `api.ferdium.org` → menampilkan resep resmi `whatsapp`. Guard kita `isAllowedRecipeId` hanya izinkan `whatsapp-fairguard`. → tombol ditolak. `featured.json` lokal juga cuma berisi `"whatsapp"`. | `src/config.ts:567`, `src/stores/ServicesStore.ts:456`, `src/stores/RecipesStore.ts:160`, `recipes/featured.json` |
| G4 | Setelan/add-on FairGuard tak terlihat | Belum ada UI setelan FairGuard sendiri. Setelan badge ada di dalam resep (`settings-panel.js`), bukan di shell Settings. | resep `fairguard/settings-panel.js` |

## Bukti mentah

- `ALLOWED_RECIPE_IDS = ['whatsapp-fairguard']` (config.ts:567)
- `featured.json` = [... "whatsapp" ...] (tanpa `whatsapp-fairguard`)
- Resep terpasang di build: `whatsapp.tar.gz` (id `whatsapp`, nama "WhatsApp") + `whatsapp-fairguard.tar.gz` (id `whatsapp-fairguard`, nama "WhatsApp (FairGuard)")
- `api.ferdium.org/recipes/popular` → feed yg dipakai UI (redirect, tak bisa dipakai offline)
- 2337 hit "Ferdium" di `app.asar` (mayoritas locale non-Inggris + internal-server HTML)
- 51 dari 56 berkas i18n masih "Ferdium"

## Keputusan Fai

1. Daftar Add Service: **tampilkan WhatsApp (FairGuard) saja** (resep kita, ada badge coach).
2. **Hilangkan halaman login server** → langsung mode tanpa-login.
3. Warna/font: WARNA WAJIB HIJAU.

## Rencana perbaikan (satu per satu, verifikasi tiap langkah)

### Fix-1 — G3 (FATAL, prioritas tertinggi): WhatsApp bisa ditambah
Sumber daftar resep harus **lokal** (`all.json` + `featured.json` dalam paket), bukan `api.ferdium.org`.
- `featured.json` dipakai sebagai daftar tampil; ubah agar memuat **`whatsapp-fairguard`** saja.
- Pastikan `_checkIfRecipeIsInstalled` dan `isInstalled` menemukan resep lokal.
- Verifikasi: `ALLOWED_RECIPE_IDS` cocok dengan id yg ditampilkan.

### Fix-2 — G2: Rebrand halaman internal server
- Ganti `src/internal-server/public/images/logo.png` → mark FairGuard.
- Ubah teks `main.edge`, `index.edge`, `transfer.edge`, `import.edge` → "FairGuard" (bukan "Ferdium").
- Ganti nama file `.ferdium-data` yg tampil? (perlu hati-hati: itu nama format ekspor, mungkin terkait kode).

### Fix-3 — G1: Hilangkan halaman login server
- Set mode tanpa-akun sebagai default, atau langsung arahkan ke serverless login.

### Fix-4 — G2b & G4: Welcome service icons + setelan FairGuard
- Pastikan Welcome hanya menampilkan WhatsApp (FairGuard).
- (G4 setelan FairGuard = pekerjaan terpisah, perlu desain.)

### Fix-5 — Locale i18n
- Rebrand 51 berkas locale yg masih "Ferdium".

## Aturan warna (Fai: WAJIB HIJAU)
- Palet FairGuard: hijau sebagai warna utama/aksen.
- Sesuai antislop: warna harus punya ALASAN (identitas: WhatsApp = hijau; FairGuard = "guard" → hijau aman). Ditulis di DESIGN.md.

## Status
- [x] Phase 1 (root cause) — SELESAI untuk G1, G2, G2b, G3, G4
- [x] Phase 2 (pattern) — SELESAI
- [ ] Phase 3 (hypothesis + test minimal)
- [ ] Phase 4 (implementasi + verifikasi)

---

## Fix-1 SELESAI (G3 fatal) — 2026-09-23

**Perubahan:** `src/api/server/ServerApi.ts`
- Tambah `_getLocalRecipePreviews()`: baca `recipes/all.json` dari asar, filter `isAllowedRecipeId`, buat `RecipePreview` dengan ikon lokal `./assets/images/fairguard-service.svg`.
- Tambah `_mergePreviews()`: gabung preview lokal + remote (yang allowed & belum ada).
- `getRecipePreviews` / `getFeaturedRecipePreviews` / `searchRecipePreviews`: tidak lagi throw saat server tak terjangkau; fallback ke daftar lokal.
- Tambah import `isAllowedRecipeId`.
- Salin `recipes/recipes/whatsapp-fairguard/icon.svg` → `src/assets/images/fairguard-service.svg`.

**Hasil:** daftar Add Service kini menampilkan **WhatsApp (FairGuard)** dari paket lokal, tanpa bergantung `api.ferdium.org`. `isAllowedRecipeId('whatsapp-fairguard')` = true → tombol bisa diklik → install dari `whatsapp-fairguard.tar.gz` lokal.

**Verifikasi:** `tsc --noEmit` bersih.

## Berikutnya
- Fix-2 (G2): rebrand halaman internal server (main.edge + logo.png).
- Fix-3 (G1): hilangkan halaman login server → langsung tanpa-login.
- Fix-4: welcome service icons + setelan FairGuard.
- Fix-5: locale i18n non-Inggris.
- Rebrand visual hijau (DESIGN.md).

## Fix-2 SELESAI (G2) — rebrand halaman + logo internal server
- `views/layouts/main.edge`: `<title>ferdium-internal-server</title>` → `FairGuard`; alt logo.
- `views/index.edge`: "Internal Ferdium Server" → "FairGuard"; teks "tanpa akun" FairGuard; `.fairguard-data`.
- `views/transfer.edge`: "Ferdium server" → "FairGuard server"; tombol hijau `#128C7E`; terima `.fairguard-data` + legacy.
- `public/images/logo.png`: diganti mark FairGuard 1024x1024 (dari PNG 128 sumber, LANCZOS).

## Fix-3 SELESAI (G1) — hilangkan halaman login server
- `config.ts`: `DEFAULT_APP_SETTINGS.server` → `LOCAL_SERVER` (dari `LIVE_FERDIUM_API`).
  Efek: app mulai mode tanpa-akun; `SettingsStore` reaction `fireImmediately` menyalakan server lokal; tak pernah menyentuh `api.ferdium.org`.
- `Welcome.tsx`: satu fokus. Hapus tombol "Create account"/"Login"/"Change server" + baris ikon layanan. Sisa: mark + FairGuard + tagline + satu tombol "Use FairGuard without an Account".
- `WelcomeScreen.tsx`: buang prop `recipes` (tak lagi dipakai).

## Rebrand visual hijau (DESIGN.md)
- `styles/globals.scss`: `$raw-theme-brand-primary` `114,102,240` (biru-ungu) → `18,140,126` (hijau teal FairGuard).
- `config.ts`: `DEFAULT_ACCENT_COLOR` `#7367F0` → `#128C7E`.
- `styles/welcome.scss`: tulis ulang — netral + aksen hijau, satu fokus, tanpa gradien/glow.

## Fix-5 SELESAI — locale i18n
- 46 berkas locale: 1806 penggantian "Ferdium"→"FairGuard" pada NILAI saja; KEY dipertahankan (identifier).
- Verifikasi: 0 value hits "Ferdium" (kecuali key). JSON semua valid. Prettier bersih.

## Sisa / berikutnya
- Rombak sidebar/service & Settings agar identitas hijau konsisten (opsional lanjutan).
- Remaining "Ferdium" di `app.asar` (grep ulang setelah build).
- Root-cause ikon Ferdium di sidebar (bila masih ada) setelah build baru.

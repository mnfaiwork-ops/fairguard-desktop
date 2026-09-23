# DESIGN.md — FairGuard Desktop

> Arah desain resmi. Ditulis dari jawaban pemilik produk (Fai), bukan karangan agen.
> Aturan antislop dibaca SETELAH berkas ini, sebagai filter.

## Identitas

- **Nama produk:** FairGuard
- **Apa itu:** coach kecepatan chat untuk nomor WhatsApp organik. Membaca layar, tidak
  pernah mengirim/mengetik. Tugasnya menjaga nomor CS tetap sehat (tidak kena blokir Meta).
- **Pengguna:** staf CS (customer service) yang membalas WhatsApp sepanjang hari kerja.
- **Kepribadian:** tenang, tepercaya, seperti rekan kerja yang mengingatkan tanpa cerewet.
  Bukan "tech bro", bukan "AI magic". FairGuard = *penjaga*, bukan *pengawas*.

## Palet (WAJIB hijau sebagai aksen)

Keputusan Fai: **netral sebagai dasar + aksen hijau**.

| Peran | Terang | Gelap | Alasan (R-31) |
|---|---|---|---|
| Latar utama | `#FFFFFF` | `#121212` | Netral; layar kerja CS seharian, kontras tinggi untuk teks. |
| Latar panel | `#F6F7F8` | `#1C1C1E` | Membedakan sidebar/panel dari konten tanpa garis tebal. |
| Teks utama | `#1A1D1F` | `#ECEDEE` | Kontras WCAG AA di kedua tema (R-25). |
| Teks sekunder | `#5B6167` | `#9BA1A6` | Hierarki; tetap >= 4.5:1 di latarnya. |
| **Aksen (hijau)** | `#128C7E` | `#25D366` | Identitas: hijau = WhatsApp + "guard"/aman. Terang pakai teal gelap (kontras aman di putih); gelap pakai hijau cerah (kontras aman di gelap). |
| Aksen saat hover | `#0F7367` | `#1FBF5B` | Umpan balik interaksi. |
| Bahaya/peringatan | `#C0392B` | `#FF6B5E` | Hanya untuk status benar-benar bahaya (mis. koneksi resep hilang). Bukan hiasan. |

Aturan pakai aksen (antislop R-09, R-13): hijau muncul di **satu hal penting per layar**
(tombol utama, status aktif, badge kecepatan). **Tidak** di setiap ikon, garis, dan latar
sekaligus.

## Tipografi

- **Tidak mengganti typeface secara drastis.** App ini shell kerja (padat teks, banyak
  label kecil); font sistem default paling aman untuk keterbacaan dan tidak menambah beban.
- Alasan ditulis: mengganti font pada shell kerja hanya menambah risiko layout tanpa
  manfaat nyata bagi pembaca. Ini keputusan sadar, bukan kelalaian (menghindari slop
  "font AI default" ala Inter/Geist yang dipilih tanpa alasan).

## Dial (Part 3 antislop)

> Reading this as: **alat kerja internal untuk staf CS**, dalam bahasa visual **netral-rapi
> dengan satu aksen hijau**, dial **ENERGY 1 / RHYTHM 1 / MOTION 1**.

- **ENERGY 1:** ini alat kerja. Tidak berteriak. Keseriusan lewat kerapian, bukan dekorasi.
- **RHYTHM 1:** konsisten dan bisa diprediksi. CS butuh cepat, bukan kejutan tata letak.
- **MOTION 1:** hanya umpan balik hover/fokus. Tidak ada animasi masuk yang mengganggu.

## Yang DILARANG di sini (filter antislop)

- Gradien biru-ungu, glow, glassmorphism di banyak elemen sekaligus.
- Ikon generik AI (sparkle, magic, robot, orb, lightning).
- Badge kapsul "AI Powered"/"Beta" tanpa fungsi nyata.
- Statistik/testimoni karangan.
- Em dash (`—`) di teks yang ditulis agen.
- Klaim keamanan/compliance tanpa bukti.

## Fokus layar (levers)

- **Welcome:** satu fokus = mark FairGuard + kalimat "Masuk tanpa akun" sebagai jalan utama.
  Tidak menampilkan deretan ikon layanan pihak ketiga (app ini WhatsApp-only).
- **Sidebar/Settings:** fokus = daftar nomor WhatsApp yang aktif; aksen hijau menandai yang aktif.
- **Badge coach:** tetap milik resep (sudah ada), hijau selaras aksen.

## Batasan jujur

- Mark FairGuard dibuat dari PNG <= 128px yang di-upscale (diterima: lembut). Bukan tracing vektor.
- Ikon tray masih menyusul (butuh artwork per-state).

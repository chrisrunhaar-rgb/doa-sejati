"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const PRIVACY_ID = `
KEBIJAKAN PRIVASI — DOA SEJATI
Versi: 1.0 | Berlaku mulai: 27 April 2026
Pengontrol Data: Yayasan Jala Transformasi Indonesia (JATI)
Alamat: Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net

---

1. PENDAHULUAN

Doa Sejati adalah platform gerakan doa harian yang dioperasikan oleh Yayasan Jala Transformasi Indonesia (JATI). Kami berkomitmen untuk melindungi privasi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi Indonesia (UU PDP No. 27 Tahun 2022).

Kebijakan Privasi ini menjelaskan data apa yang kami kumpulkan, mengapa, dan bagaimana kami menggunakannya.

---

2. DATA YANG KAMI KUMPULKAN

a. Data yang Anda berikan secara sukarela
- Alamat email (opsional): Digunakan untuk mengirim rekap doa bulanan. Anda dapat menggunakan Doa Sejati tanpa memberikan email.
- Pilihan bahasa (Indonesia atau Inggris)
- Waktu pengingat harian yang Anda pilih
- Zona waktu (terdeteksi otomatis dari browser Anda)

b. Data yang dibuat oleh sistem
- Token notifikasi push: Sebuah kode unik yang memungkinkan kami mengirim notifikasi ke perangkat Anda. Ini bukan data pribadi — tidak terhubung ke identitas Anda kecuali Anda mendaftarkan email.
- Catatan doa: Grup suku yang Anda doakan dan waktu doa. Digunakan untuk menghitung streak doa dan rekap pribadi Anda. Tidak dibagikan secara publik.
- Streak doa: Jumlah hari berturut-turut Anda berdoa.

c. Data lokasi agregat (untuk peta doa)
Ketika Anda menekan tombol "Saya Sudah Berdoa", sistem kami menerima alamat IP Anda. Kami menggunakan alamat IP ini untuk menentukan provinsi asal doa (menggunakan database geolokasi lokal MaxMind GeoLite2). Alamat IP Anda TIDAK PERNAH disimpan. Yang tersimpan hanya: nama provinsi + jumlah doa + tanggal. Ini adalah data agregat, bukan data pribadi.

---

3. DASAR HUKUM PEMROSESAN DATA

Sesuai UU PDP, kami memproses data berdasarkan:
- Persetujuan (consent): Data email dan token notifikasi
- Kepentingan yang sah (legitimate interest): Catatan doa untuk fitur streak dan rekap pribadi; lokasi provinsi agregat untuk peta doa
- Pelaksanaan perjanjian: Data yang diperlukan untuk menjalankan layanan yang Anda minta

---

4. PENGGUNAAN DATA

Kami menggunakan data Anda untuk:
- Mengirim notifikasi doa harian sesuai waktu yang Anda pilih
- Menampilkan streak doa dan riwayat doa pribadi Anda
- Menghasilkan rekap doa bulanan (jika email diberikan)
- Memperbarui peta doa interaktif Indonesia dengan data agregat provinsi

---

5. BERBAGI DATA

Kami TIDAK menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial.

Data yang dibagikan secara terbatas:
- Penyedia infrastruktur teknis (Supabase — PostgreSQL terkelola, data disimpan di region Asia Tenggara; Vercel — hosting frontend)
- Semua penyedia layanan wajib menandatangani perjanjian pemrosesan data dan berkomitmen tidak menggunakan data Anda untuk tujuan lain.

Data yang bersifat publik:
- Hanya angka agregat yang ditampilkan secara publik (contoh: "1.247 orang berdoa hari ini", "22 provinsi aktif"). Data individu tidak pernah ditampilkan.

---

6. PENYIMPANAN DAN PENGHAPUSAN DATA

- Data akun disimpan selama akun Anda aktif
- Catatan doa individual: disimpan selama 2 tahun dari tanggal doa
- Token notifikasi: dihapus jika tidak aktif selama 12 bulan
- Data agregat provinsi: disimpan selamanya (ini bukan data pribadi)
- Jika Anda menghapus akun: semua data pribadi Anda dihapus dalam 30 hari kerja

---

7. HAK ANDA SESUAI UU PDP

Anda memiliki hak untuk:
a. Mengakses data pribadi yang kami simpan tentang Anda
b. Memperbaiki data yang tidak akurat
c. Menghapus data Anda (hak untuk dilupakan)
d. Membatasi atau menolak pemrosesan data tertentu
e. Portabilitas data — mendapatkan salinan data Anda dalam format terstruktur
f. Mengajukan pengaduan kepada Badan Perlindungan Data Pribadi (BPDP) Indonesia

Untuk menggunakan hak-hak ini, hubungi kami di: info@jala-transformasi.net
Kami akan merespons dalam 14 hari kerja.

---

8. KEAMANAN DATA

Kami melindungi data Anda dengan:
- Enkripsi HTTPS untuk semua komunikasi
- Row-Level Security (RLS) di database — setiap pengguna hanya dapat mengakses datanya sendiri
- Tidak ada data pribadi yang dicatat di log server
- Akses admin terbatas dan terdokumentasi
- Penghapusan otomatis token yang tidak aktif

---

9. ANAK-ANAK

Layanan ini tidak ditujukan untuk anak-anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan data dari anak-anak. Jika Anda menduga anak di bawah umur telah mendaftarkan akun, hubungi kami segera.

---

10. PERUBAHAN KEBIJAKAN

Jika kami mengubah kebijakan ini secara material, kami akan memberi tahu Anda melalui notifikasi push atau email (jika tersedia) setidaknya 7 hari sebelum perubahan berlaku.

---

11. HUBUNGI KAMI

Yayasan Jala Transformasi Indonesia (JATI)
Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net
WhatsApp: +62 853 3727 1106
`;

const PRIVACY_EN = `
PRIVACY POLICY — DOA SEJATI
Version: 1.0 | Effective: 27 April 2026
Data Controller: Yayasan Jala Transformasi Indonesia (JATI)
Address: Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net

---

1. INTRODUCTION

Doa Sejati is a daily prayer movement platform operated by Yayasan Jala Transformasi Indonesia (JATI). We are committed to protecting your privacy in accordance with Indonesia's Personal Data Protection Law (UU PDP No. 27 of 2022).

This Privacy Policy explains what data we collect, why, and how we use it.

---

2. DATA WE COLLECT

a. Data you provide voluntarily
- Email address (optional): Used to send monthly prayer recaps. You can use Doa Sejati without providing an email.
- Language preference (Indonesian or English)
- Your chosen daily reminder time
- Timezone (automatically detected from your browser)

b. System-generated data
- Push notification token: A unique code that allows us to send notifications to your device. This is not personal data — it is not linked to your identity unless you register an email.
- Prayer logs: The people groups you prayed for and the time of each prayer. Used to calculate your streak and personal recap. Not shared publicly.
- Prayer streak: Number of consecutive days you have prayed.

c. Aggregate location data (for the prayer map)
When you tap "I Have Prayed", our system receives your IP address. We use this to determine the province your prayer came from (using the local MaxMind GeoLite2 geolocation database). Your IP address is NEVER stored. What is stored: province name + prayer count + date. This is aggregate data, not personal data.

---

3. LEGAL BASIS FOR PROCESSING

Under Indonesia's UU PDP, we process data based on:
- Consent: Email data and notification tokens
- Legitimate interest: Prayer logs for streak and personal recap features; aggregate province data for the prayer map
- Contract performance: Data required to provide the service you requested

---

4. HOW WE USE YOUR DATA

We use your data to:
- Send your daily prayer notification at your chosen time
- Display your prayer streak and personal prayer history
- Generate monthly prayer recaps (if you provided an email)
- Update Indonesia's interactive prayer map with aggregate province data

---

5. DATA SHARING

We do NOT sell, rent, or share your personal data with third parties for commercial purposes.

Limited data sharing:
- Technical infrastructure providers (Supabase — managed PostgreSQL, data stored in Southeast Asia; Vercel — frontend hosting)
- All service providers are bound by data processing agreements and may not use your data for other purposes.

Publicly visible data:
- Only aggregate figures are displayed publicly (e.g., "1,247 people praying today", "22 active provinces"). Individual data is never displayed.

---

6. DATA RETENTION AND DELETION

- Account data: retained while your account is active
- Individual prayer logs: retained for 2 years from the date of prayer
- Notification tokens: deleted after 12 months of inactivity
- Aggregate province data: retained indefinitely (this is not personal data)
- If you delete your account: all your personal data is deleted within 30 business days

---

7. YOUR RIGHTS UNDER UU PDP

You have the right to:
a. Access the personal data we hold about you
b. Correct inaccurate data
c. Delete your data (right to erasure)
d. Restrict or object to certain data processing
e. Data portability — receive a copy of your data in a structured format
f. Lodge a complaint with Indonesia's Personal Data Protection Agency (BPDP)

To exercise these rights, contact us at: info@jala-transformasi.net
We will respond within 14 business days.

---

8. DATA SECURITY

We protect your data through:
- HTTPS encryption for all communications
- Row-Level Security (RLS) in the database — each user can only access their own data
- No personal data logged in server logs
- Limited and documented admin access
- Automatic deletion of inactive tokens

---

9. CHILDREN

This service is not intended for children under 13. We do not knowingly collect data from children. If you believe a minor has registered an account, please contact us immediately.

---

10. POLICY CHANGES

If we make material changes to this policy, we will notify you via push notification or email (if available) at least 7 days before the changes take effect.

---

11. CONTACT US

Yayasan Jala Transformasi Indonesia (JATI)
Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net
WhatsApp: +62 853 3727 1106
`;

export default function PrivacyPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <div className="bg-[var(--color-navy-deep)] px-5 pt-safe pt-4 pb-5">
        <div className="flex items-center justify-between mb-2">
          <Link href="/profile" className="text-white/60 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <LanguageToggle variant="white" />
        </div>
        <h1 className="font-display text-xl font-bold text-white">
          {lang === "id" ? "Kebijakan Privasi" : "Privacy Policy"}
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-5">
          <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--color-ink)] leading-relaxed">
            {lang === "id" ? PRIVACY_ID : PRIVACY_EN}
          </pre>
        </div>
      </div>
    </div>
  );
}

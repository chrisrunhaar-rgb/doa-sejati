"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const TERMS_ID = `
SYARAT DAN KETENTUAN PENGGUNAAN — DOA SEJATI
Versi: 1.0 | Berlaku mulai: 27 April 2026
Dioperasikan oleh: Yayasan Jala Transformasi Indonesia (JATI)

---

1. PENERIMAAN SYARAT

Dengan menggunakan Doa Sejati ("Layanan"), Anda menyetujui Syarat dan Ketentuan ini. Jika Anda tidak setuju, jangan gunakan Layanan ini.

---

2. TENTANG LAYANAN

Doa Sejati adalah platform gerakan doa digital yang memungkinkan pengguna untuk:
- Menerima doa harian untuk suku-suku yang belum terjangkau di Indonesia
- Mencatat doa harian dan melihat streak doa
- Melihat peta doa Indonesia yang diperbarui secara langsung
- Berbagi doa dengan orang lain

Layanan ini dioperasikan oleh JATI (Yayasan Jala Transformasi Indonesia), yayasan yang terdaftar secara hukum di Indonesia (SK AHU-0037468.AH.01.12.TAHUN 2025).

---

3. KETENTUAN PENGGUNAAN

Anda boleh menggunakan Layanan ini untuk:
- Berdoa secara pribadi dan bersama orang lain
- Berbagi konten doa kepada keluarga, teman, dan komunitas gereja
- Menggunakan Layanan untuk kegiatan rohani, edukasi, dan pelayanan non-komersial

Anda TIDAK boleh:
- Menggunakan Layanan untuk tujuan komersial tanpa izin tertulis dari JATI
- Mencoba mengakses, merusak, atau mengganggu sistem teknis Layanan
- Menyebarkan konten yang menyesatkan, cabul, atau berbahaya
- Menggunakan Layanan untuk menyerang, menghina, atau mendiskreditkan kelompok masyarakat manapun
- Mengumpulkan atau menyalin data pengguna lain
- Mengirimkan pesan spam atau konten otomatis yang tidak sah

---

4. KONTEN DOA

Konten doa (termasuk informasi tentang suku-suku yang belum terjangkau) disusun berdasarkan data dari Joshua Project (joshuaproject.net) dan sumber misi terpercaya. Konten ini dimaksudkan untuk:
- Mendorong doa syafaat yang penuh kasih untuk semua suku bangsa
- Memberikan informasi akurat tentang kebutuhan rohani masyarakat
- Menghormati martabat dan budaya setiap kelompok masyarakat

Konten ini BUKAN:
- Serangan terhadap agama Islam atau agama apapun
- Ajakan untuk proselitisme yang memaksa atau manipulatif
- Pernyataan negatif tentang kelompok masyarakat manapun

Kami berdoa untuk manusia, bukan melawan mereka.

---

5. NOTIFIKASI PUSH

Dengan mengizinkan notifikasi, Anda menyetujui:
- Menerima maksimal 1 notifikasi doa per hari pada waktu yang Anda pilih
- Notifikasi re-engagement jika Anda tidak aktif selama 7 hari (maksimal 2 kali sebelum berhenti)
- Anda dapat mencabut izin notifikasi kapan saja melalui pengaturan perangkat Anda

---

6. KONTEN DONASI

Doa Sejati menampilkan tautan donasi yang diarahkan ke proyek pelayanan JATI di antara suku-suku tertentu. Donasi:
- Bersifat sukarela sepenuhnya
- Dikelola oleh JATI sesuai hukum yayasan Indonesia
- Laporan keuangan tahunan tersedia atas permintaan

---

7. PRIVASI

Penggunaan data pribadi Anda diatur oleh Kebijakan Privasi kami yang merupakan bagian tidak terpisahkan dari Syarat ini. Lihat: doasejati.net/privacy

---

8. PENGHENTIAN LAYANAN

JATI berhak untuk:
- Menangguhkan atau menghapus akun yang melanggar Syarat ini
- Mengubah atau menghentikan Layanan dengan pemberitahuan yang wajar (minimal 30 hari untuk penghentian penuh)

Anda berhak untuk berhenti menggunakan Layanan kapan saja dengan menghapus akun Anda.

---

9. BATASAN TANGGUNG JAWAB

Doa Sejati disediakan "sebagaimana adanya". JATI tidak bertanggung jawab atas:
- Gangguan atau ketidaktersediaan Layanan yang bersifat sementara
- Keputusan yang dibuat berdasarkan konten doa
- Kerugian tidak langsung yang timbul dari penggunaan Layanan

---

10. HUKUM YANG BERLAKU

Syarat ini diatur oleh hukum Republik Indonesia. Setiap sengketa diselesaikan melalui musyawarah terlebih dahulu, dan jika tidak berhasil, melalui pengadilan yang berwenang di Indonesia.

---

11. PERUBAHAN SYARAT

Jika kami mengubah Syarat ini secara material, kami akan memberi tahu Anda setidaknya 7 hari sebelumnya melalui notifikasi atau email.

---

12. HUBUNGI KAMI

Yayasan Jala Transformasi Indonesia (JATI)
Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net
WhatsApp: +62 853 3727 1106
`;

const TERMS_EN = `
TERMS OF USE — DOA SEJATI
Version: 1.0 | Effective: 27 April 2026
Operated by: Yayasan Jala Transformasi Indonesia (JATI)

---

1. ACCEPTANCE OF TERMS

By using Doa Sejati ("Service"), you agree to these Terms of Use. If you do not agree, do not use this Service.

---

2. ABOUT THE SERVICE

Doa Sejati is a digital prayer movement platform that enables users to:
- Receive daily prayers for unreached peoples in Indonesia
- Record daily prayers and track their prayer streak
- View a live-updated prayer map of Indonesia
- Share prayers with others

The Service is operated by JATI (Yayasan Jala Transformasi Indonesia), a legally registered foundation in Indonesia (SK AHU-0037468.AH.01.12.TAHUN 2025).

---

3. PERMITTED AND PROHIBITED USE

You may use this Service for:
- Personal and communal prayer
- Sharing prayer content with family, friends, and church communities
- Non-commercial spiritual, educational, and ministry activities

You may NOT:
- Use the Service for commercial purposes without written permission from JATI
- Attempt to access, damage, or disrupt the Service's technical systems
- Distribute misleading, obscene, or harmful content
- Use the Service to attack, insult, or discredit any people group
- Collect or copy other users' data
- Send spam or unauthorised automated content

---

4. PRAYER CONTENT

Prayer content (including information about unreached peoples) is compiled from Joshua Project data (joshuaproject.net) and trusted mission sources. This content is intended to:
- Encourage compassionate intercession for all people groups
- Provide accurate information about the spiritual needs of communities
- Honour the dignity and culture of every people group

This content is NOT:
- An attack on Islam or any other religion
- A call to coercive or manipulative proselytism
- A negative statement about any people group

We pray for people, not against them.

---

5. PUSH NOTIFICATIONS

By enabling notifications, you agree to:
- Receive a maximum of 1 prayer notification per day at your chosen time
- Re-engagement notifications if you are inactive for 7 days (maximum 2 before stopping)
- You may revoke notification permission at any time through your device settings

---

6. DONATION CONTENT

Doa Sejati displays donation links directed to JATI ministry projects among specific peoples. Donations are:
- Entirely voluntary
- Managed by JATI in accordance with Indonesian foundation law
- Annual financial reports available upon request

---

7. PRIVACY

Your personal data is governed by our Privacy Policy, which forms part of these Terms. See: doasejati.net/privacy

---

8. TERMINATION

JATI reserves the right to:
- Suspend or delete accounts that violate these Terms
- Modify or discontinue the Service with reasonable notice (minimum 30 days for full discontinuation)

You may stop using the Service at any time by deleting your account.

---

9. LIMITATION OF LIABILITY

Doa Sejati is provided "as is". JATI is not liable for:
- Temporary interruptions or unavailability of the Service
- Decisions made based on prayer content
- Indirect losses arising from use of the Service

---

10. GOVERNING LAW

These Terms are governed by the laws of the Republic of Indonesia. Any disputes shall first be resolved through deliberation, and if unsuccessful, through competent Indonesian courts.

---

11. CHANGES TO TERMS

If we make material changes to these Terms, we will notify you at least 7 days in advance via notification or email.

---

12. CONTACT US

Yayasan Jala Transformasi Indonesia (JATI)
Jalan Bypass Ngurah Rai No. 291, Sanur, Denpasar, Bali, Indonesia
Email: info@jala-transformasi.net
WhatsApp: +62 853 3727 1106
`;

export default function TermsPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
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
          {lang === "id" ? "Syarat Penggunaan" : "Terms of Use"}
        </h1>
      </div>

      <div className="px-5 py-6 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-5">
          <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--color-ink)] leading-relaxed">
            {lang === "id" ? TERMS_ID : TERMS_EN}
          </pre>
        </div>
      </div>
    </div>
  );
}

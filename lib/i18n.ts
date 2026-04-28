export type Lang = "id" | "en";

export const t = {
  // Navigation
  nav: {
    home: { id: "Beranda", en: "Home" },
    today: { id: "Hari Ini", en: "Today" },
    history: { id: "Riwayat", en: "History" },
    profile: { id: "Profil", en: "Profile" },
  },

  // Landing page
  landing: {
    tagline: {
      id: "Doa Sejati — Berdoa untuk Indonesia",
      en: "Doa Sejati — Praying for Indonesia",
    },
    subtitle: {
      id: "Bergabunglah dengan ribuan orang Indonesia yang berdoa setiap hari\nuntuk suku-suku yang belum mengenal Yesus.",
      en: "Join thousands of Indonesians praying daily\nfor peoples who have never heard of Jesus.",
    },
    prayingNow: {
      id: "orang berdoa hari ini",
      en: "people praying today",
    },
    provinces: {
      id: "provinsi aktif",
      en: "active provinces",
    },
    joinCTA: {
      id: "Ikut Berdoa",
      en: "Join the Prayer",
    },
    seeToday: {
      id: "Lihat doa hari ini →",
      en: "See today's prayer →",
    },
    aboutMovement: {
      id: "Tentang Gerakan Ini",
      en: "About This Movement",
    },
    mission: {
      id: "Indonesia memiliki 234 suku yang belum terjangkau. Gereja Indonesia ada. Gerakan doa ini ada.\nSatu doa. Satu ketukan. Satu bangsa yang dimobilisasi.",
      en: "Indonesia has 234 unreached peoples. The Indonesian church exists. This prayer movement exists.\nOne prayer. One tap. One nation mobilised.",
    },
    poweredBy: {
      id: "Sebuah proyek dari JATI — Yayasan Jala Transformasi Indonesia",
      en: "A project of JATI — Yayasan Jala Transformasi Indonesia",
    },
  },

  // Prayer page
  prayer: {
    todayPrayer: { id: "DOA HARI INI", en: "TODAY'S PRAYER" },
    population: { id: "jiwa", en: "people" },
    prayPoints: { id: "Pokok Doa", en: "Prayer Points" },
    prayedBtn: { id: "Saya Sudah Berdoa", en: "I Have Prayed" },
    prayedConfirm: { id: "Sudah Berdoa", en: "Prayed" },
    prayingToday: { id: "orang berdoa hari ini", en: "people praying today" },
    joinCounter: { id: "Bergabung dengan", en: "Join" },
    streakDays: { id: "hari berturut-turut", en: "days in a row" },
    streakLabel: { id: "Kamu sudah berdoa", en: "You have prayed" },
    share: { id: "Bagikan", en: "Share" },
    give: { id: "Ingin berbuat lebih? Dukung pelayanan di antara suku ini.", en: "Want to go further? Support ministry among this people." },
    learnMore: { id: "Pelajari lebih lanjut di Joshua Project →", en: "Learn more at Joshua Project →" },
    bibleAccess: { id: "Alkitab tersedia", en: "Bible access" },
    believers: { id: "Jumlah orang percaya", en: "Known believers" },
    progress: { id: "Status kemajuan", en: "Progress status" },
  },

  // Share sheet
  share: {
    title: { id: "Bagikan Doa", en: "Share Prayer" },
    whatsapp: { id: "WhatsApp", en: "WhatsApp" },
    instagram: { id: "Instagram", en: "Instagram" },
    copy: { id: "Salin tautan", en: "Copy link" },
    copied: { id: "Tersalin!", en: "Copied!" },
    message: {
      id: (group: string) =>
        `Hari ini saya berdoa untuk ${group}. Bergabunglah bersama saya di doasejati.net`,
      en: (group: string) =>
        `Today I prayed for the ${group}. Join me at doasejati.net`,
    },
  },

  // Signup
  signup: {
    welcome: { id: "Selamat Datang", en: "Welcome" },
    chooseLanguage: { id: "Pilih bahasa kamu", en: "Choose your language" },
    emailStep: { id: "Email kamu (opsional)", en: "Your email (optional)" },
    emailHint: {
      id: "Untuk rekap doa bulanan. Kamu bisa melanjutkan tanpa email.",
      en: "For monthly prayer recaps. You can continue without one.",
    },
    skipEmail: { id: "Lewati, tanpa email", en: "Skip, no email" },
    continueBtn: { id: "Lanjutkan", en: "Continue" },
    reminderTime: {
      id: "Kapan kamu ingin diingatkan untuk berdoa?",
      en: "When would you like your daily prayer reminder?",
    },
    morning: { id: "Pagi (07:00)", en: "Morning (07:00)" },
    noon: { id: "Siang (12:00)", en: "Noon (12:00)" },
    evening: { id: "Malam (20:00)", en: "Evening (20:00)" },
    enableNotif: {
      id: "Aktifkan pengingat doa harian",
      en: "Enable daily prayer reminders",
    },
    notifHint: {
      id: "Kami hanya mengirim 1 notifikasi per hari — berisi doa hari itu.",
      en: "We only send 1 notification per day — with that day's prayer.",
    },
    allowNotif: { id: "Izinkan Notifikasi", en: "Allow Notifications" },
    installApp: {
      id: "Pasang Doa Sejati di layar utama",
      en: "Install Doa Sejati on your home screen",
    },
    installHint: {
      id: "Akses lebih cepat. Terasa seperti aplikasi sungguhan.",
      en: "Faster access. Feels like a real app.",
    },
    installBtn: { id: "Pasang Aplikasi", en: "Install App" },
    laterBtn: { id: "Nanti saja", en: "Maybe later" },
    consent: {
      id: 'Saya menyetujui ',
      en: "I agree to the ",
    },
    privacyLink: { id: "Kebijakan Privasi", en: "Privacy Policy" },
    andWord: { id: " dan ", en: " and " },
    termsLink: { id: "Syarat Penggunaan", en: "Terms of Use" },
    startPraying: { id: "Mulai Berdoa", en: "Start Praying" },
    step: { id: "Langkah", en: "Step" },
    of: { id: "dari", en: "of" },
  },

  // Profile
  profile: {
    title: { id: "Profil & Pengaturan", en: "Profile & Settings" },
    prayerStreak: { id: "Streak Doa", en: "Prayer Streak" },
    daysLabel: { id: "hari", en: "days" },
    totalPrayed: { id: "Total doa", en: "Total prayers" },
    notifTime: { id: "Waktu pengingat", en: "Reminder time" },
    language: { id: "Bahasa", en: "Language" },
    deleteAccount: { id: "Hapus akun", en: "Delete account" },
    deleteConfirm: {
      id: "Ini akan menghapus semua data kamu. Tidak bisa dibatalkan.",
      en: "This will permanently delete all your data. Cannot be undone.",
    },
  },

  // Common
  common: {
    loading: { id: "Memuat...", en: "Loading..." },
    error: { id: "Terjadi kesalahan", en: "Something went wrong" },
    retry: { id: "Coba lagi", en: "Try again" },
    close: { id: "Tutup", en: "Close" },
    save: { id: "Simpan", en: "Save" },
    cancel: { id: "Batal", en: "Cancel" },
    confirm: { id: "Konfirmasi", en: "Confirm" },
    back: { id: "Kembali", en: "Back" },
  },
} as const;

export function tr<T extends { id: string; en: string }>(
  entry: T,
  lang: Lang
): string {
  return entry[lang];
}

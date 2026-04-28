import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://miegjduhwekszuaestzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZWdqZHVod2Vrc3p1YWVzdHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2MDgxOCwiZXhwIjoyMDkyMTM2ODE4fQ.5XBGwjaA-AaMWSa4KWxLD--pNcWzD-SWk_OkSCnPgKY"
);

const people_groups = [
  {
    id: "aceh-aceh",
    name_id: "Orang Aceh",
    name_en: "The Acehnese",
    province: "Aceh",
    island: "Sumatera",
    population: 4100000,
    religion: "Islam",
    progress_scale: 2,
    bible_access: "partial",
    jp_profile_url: "https://joshuaproject.net/people_groups/10087/ID",
  },
  {
    id: "sunda-java",
    name_id: "Orang Sunda",
    name_en: "The Sundanese",
    province: "Jawa Barat",
    island: "Jawa",
    population: 36700000,
    religion: "Islam",
    progress_scale: 2,
    bible_access: "full",
    jp_profile_url: "https://joshuaproject.net/people_groups/14966/ID",
  },
  {
    id: "java-java",
    name_id: "Orang Jawa",
    name_en: "The Javanese",
    province: "Jawa Tengah",
    island: "Jawa",
    population: 98500000,
    religion: "Islam",
    progress_scale: 2,
    bible_access: "full",
    jp_profile_url: "https://joshuaproject.net/people_groups/11665/ID",
  },
  {
    id: "minang-west-sumatra",
    name_id: "Orang Minangkabau",
    name_en: "The Minangkabau",
    province: "Sumatera Barat",
    island: "Sumatera",
    population: 8200000,
    religion: "Islam",
    progress_scale: 1,
    bible_access: "partial",
    jp_profile_url: "https://joshuaproject.net/people_groups/12367/ID",
  },
  {
    id: "bugis-sulawesi",
    name_id: "Orang Bugis",
    name_en: "The Bugis",
    province: "Sulawesi Selatan",
    island: "Sulawesi",
    population: 6900000,
    religion: "Islam",
    progress_scale: 2,
    bible_access: "none",
    jp_profile_url: "https://joshuaproject.net/people_groups/11093/ID",
  },
];

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

const prayer_content = [
  {
    people_group_id: "aceh-aceh",
    scheduled_date: today,
    push_title_id: "Doakan Orang Aceh hari ini",
    push_title_en: "Pray for the Acehnese today",
    push_body_id: "4 juta jiwa. Hampir tidak ada yang mengenal Yesus. Doa kamu bisa mengubah ini.",
    push_body_en: "4 million souls. Almost none who know Jesus. Your prayer can change this.",
    prayer_text_id: "Orang Aceh adalah salah satu suku terbesar di Indonesia dengan sekitar 4,1 juta jiwa yang tinggal di ujung barat Sumatera. Hampir seluruhnya beragama Islam, dan hampir tidak ada orang percaya di antara mereka.",
    prayer_text_en: "The Acehnese are one of Indonesia's largest people groups, with around 4.1 million people living at the western tip of Sumatra. They are almost entirely Muslim, with very few known believers.",
    prayer_points_id: [
      "Doakan agar orang Aceh yang mencari kedamaian sejati dapat berjumpa dengan Yesus melalui mimpi atau kesaksian yang nyata.",
      "Doakan agar Alkitab dalam bahasa Aceh dapat dibaca dan disebarluaskan di antara orang-orang yang rindu kebenaran.",
      "Doakan agar para pelayan dan pekerja yang tinggal di tengah orang Aceh dapat hidup dengan integritas, kasih, dan keberanian.",
    ],
    prayer_points_en: [
      "Pray that Acehnese seeking true peace would encounter Jesus through dreams or a genuine witness.",
      "Pray that the Acehnese New Testament would be read and distributed among those who hunger for truth.",
      "Pray for workers and servants living among the Acehnese to live with integrity, love, and courage.",
    ],
  },
  {
    people_group_id: "sunda-java",
    scheduled_date: tomorrow,
    push_title_id: "Orang Sunda menunggu doamu",
    push_title_en: "The Sundanese are waiting for your prayer",
    push_body_id: "36 juta jiwa — suku terbesar kedua di Indonesia. Mereka membutuhkan doamu.",
    push_body_en: "36 million people — Indonesia's second largest group. They need your prayer.",
    prayer_text_id: "Orang Sunda berjumlah sekitar 36,7 juta jiwa dan tinggal di Jawa Barat. Mereka dikenal dengan budaya yang halus dan ketaatan Islam yang kuat. Jumlah orang percaya di kalangan mereka sangat kecil.",
    prayer_text_en: "The Sundanese number around 36.7 million and live in West Java. They are known for refined culture and strong Islamic devotion. The number of known believers among them is very small.",
    prayer_points_id: [
      "Doakan agar jiwa-jiwa Sunda yang mencari kebenaran dapat menemukan jalan menuju Kristus.",
      "Doakan agar gereja-gereja di Jawa Barat dapat menjangkau tetangga Sunda mereka dengan kasih.",
      "Doakan agar lebih banyak orang percaya Sunda berani bersaksi kepada keluarga dan komunitas mereka.",
    ],
    prayer_points_en: [
      "Pray that Sundanese souls seeking truth would find their way to Christ.",
      "Pray that churches in West Java would reach their Sundanese neighbours with love.",
      "Pray for more Sundanese believers to share their faith boldly with family and community.",
    ],
  },
  {
    people_group_id: "bugis-sulawesi",
    scheduled_date: dayAfter,
    push_title_id: "Hari ini: Berdoa untuk Orang Bugis",
    push_title_en: "Today: Pray for the Bugis",
    push_body_id: "Suku pelaut yang berani. 6,9 juta jiwa. Doa sejati satu orang bisa menggerakkan sejarah.",
    push_body_en: "A brave seafaring people. 6.9 million souls. One genuine prayer can move history.",
    prayer_text_id: "Orang Bugis adalah suku pelaut terkenal dari Sulawesi Selatan. Dengan populasi sekitar 6,9 juta jiwa yang tersebar di seluruh Nusantara, mereka belum terjangkau Injil secara signifikan.",
    prayer_text_en: "The Bugis are a renowned seafaring people from South Sulawesi. With around 6.9 million people spread across the archipelago, they remain largely unreached by the Gospel.",
    prayer_points_id: [
      "Doakan agar Alkitab dalam bahasa Bugis dapat diterjemahkan dan disebarluaskan ke seluruh penjuru.",
      "Doakan agar orang-orang Bugis yang merantau di kota-kota besar dapat mendengar Injil dan percaya.",
      "Doakan agar gereja lokal dapat membina hubungan yang penuh kepercayaan dengan komunitas Bugis.",
    ],
    prayer_points_en: [
      "Pray that the Bible in the Bugis language would be translated and distributed throughout the archipelago.",
      "Pray that migrant Bugis in major cities would hear the Gospel and believe.",
      "Pray that local churches would build trusting relationships with Bugis communities.",
    ],
  },
];

// Insert people groups
const { error: pgError } = await supabase
  .from("ds_people_groups")
  .upsert(people_groups, { onConflict: "id" });

if (pgError) {
  console.error("People groups error:", pgError.message);
} else {
  console.log("✓ People groups inserted:", people_groups.length);
}

// Insert prayer content
const { error: pcError } = await supabase
  .from("ds_prayer_content")
  .upsert(prayer_content, { onConflict: "scheduled_date" });

if (pcError) {
  console.error("Prayer content error:", pcError.message);
} else {
  console.log("✓ Prayer content inserted:", prayer_content.length, "days");
}

// Seed mock province counts for the map
const provinces = [
  "Aceh", "Sumatera Utara", "Jawa Barat", "DKI Jakarta",
  "Jawa Tengah", "Jawa Timur", "Bali", "Sulawesi Selatan",
  "Kalimantan Barat", "Kalimantan Timur", "Maluku", "Papua",
  "Sumatera Barat", "Riau", "Sulawesi Tengah", "Nusa Tenggara Barat",
];

const provinceCounts = provinces.map((p, i) => ({
  province_name: p,
  date: today,
  prayer_count: Math.floor(Math.random() * 400) + 20 + (i < 6 ? 200 : 0),
}));

const { error: prError } = await supabase
  .from("ds_province_daily_counts")
  .upsert(provinceCounts, { onConflict: "province_name,date" });

if (prError) {
  console.error("Province counts error:", prError.message);
} else {
  console.log("✓ Province counts seeded:", provinceCounts.length);
}

console.log("\nSeed complete ✓");

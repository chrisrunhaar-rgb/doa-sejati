"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number;
  todayNewUsers: number;
  usersWithPushToken: number;
  totalPrayers: number;
  todayPrayers: number;
  thirtyDayPrayers: number;
  avgStreak: number;
  usersWithStreakOver7: number;
  usersWithStreakOver30: number;
}

interface VolumeEntry {
  date: string;
  count: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  language: string | null;
  province: string | null;
  streak_count: number | null;
  created_at: string;
  last_prayed_at: string | null;
}

interface ProvinceEntry {
  province: string;
  warrior_count: number;
}

interface UpcomingContent {
  date: string;
  nameId: string;
  nameEn: string;
  titleId: string;
  titleEn: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function fmtDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hari ini";
  if (days === 1) return "kemarin";
  return `${days}h lalu`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className ?? ""}`}
      style={{ animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
    />
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  loading,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2"
      style={{
        background: "white",
        boxShadow: "0 1px 4px rgba(13,30,61,0.08)",
        borderLeft: accent ? "3px solid var(--color-terra)" : "3px solid transparent",
      }}
    >
      <span
        className="text-xs uppercase tracking-widest font-semibold"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </span>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 rounded" />
          {sub !== undefined && <Skeleton className="h-3 w-16 rounded" />}
        </>
      ) : (
        <>
          <span
            className="text-3xl font-bold font-display"
            style={{ color: "var(--color-navy)" }}
          >
            {typeof value === "number" ? fmt(value) : value}
          </span>
          {sub && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {sub}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart({ volume, loading }: { volume: VolumeEntry[]; loading: boolean }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const max = volume.length > 0 ? Math.max(...volume.map((v) => v.count), 1) : 1;

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "white", boxShadow: "0 1px 4px rgba(13,30,61,0.08)" }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Volume Doa — 30 Hari Terakhir
      </h2>

      {loading ? (
        <div className="flex items-end gap-1" style={{ height: 200 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${20 + Math.random() * 60}%`,
                background: "#e5e7eb",
                animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <div
            className="flex items-end"
            style={{ height: 200, gap: 3 }}
          >
            {volume.map((entry) => {
              const isToday = entry.date === todayStr;
              const heightPct = max > 0 ? (entry.count / max) * 100 : 0;
              return (
                <div
                  key={entry.date}
                  className="flex-1 rounded-t transition-all duration-200 cursor-default"
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                    background: isToday
                      ? "var(--color-terra)"
                      : "oklch(20% 0.09 258)",
                    borderRadius: "2px 2px 0 0",
                    opacity: entry.count === 0 ? 0.2 : 1,
                  }}
                  title={`${fmtDate(entry.date)}: ${fmt(entry.count)} doa`}
                />
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex mt-2" style={{ gap: 3 }}>
            {volume.map((entry, i) => (
              <div key={entry.date} className="flex-1 flex justify-center">
                {i % 5 === 0 && (
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-muted)", fontSize: 10 }}
                  >
                    {fmtDate(entry.date)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "oklch(20% 0.09 258)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                Hari lalu
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "var(--color-terra)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                Hari ini
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Province Table ───────────────────────────────────────────────────────────

function ProvinceTable({
  data,
  loading,
}: {
  data: ProvinceEntry[];
  loading: boolean;
}) {
  const max = data.length > 0 ? Math.max(...data.map((p) => p.warrior_count), 1) : 1;

  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: "white", boxShadow: "0 1px 4px rgba(13,30,61,0.08)" }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Top 10 Provinsi
      </h2>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Belum ada data provinsi.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((row, i) => (
            <div key={row.province ?? i} className="flex items-center gap-3">
              {/* Rank */}
              <span
                className="text-xs font-bold w-5 text-right flex-shrink-0"
                style={{ color: i < 3 ? "var(--color-terra)" : "var(--color-muted)" }}
              >
                {i + 1}
              </span>

              {/* Province name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {row.province ?? "—"}
                  </span>
                  <span
                    className="text-xs font-bold ml-2 flex-shrink-0"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {fmt(row.warrior_count)}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ background: "var(--color-border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(row.warrior_count / max) * 100}%`,
                      background:
                        i === 0
                          ? "var(--color-terra)"
                          : "oklch(20% 0.09 258)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recent Signups Table ─────────────────────────────────────────────────────

function RecentSignupsTable({
  data,
  loading,
}: {
  data: AdminUser[];
  loading: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: "white", boxShadow: "0 1px 4px rgba(13,30,61,0.08)" }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Pengguna Terbaru (50)
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Belum ada pengguna terdaftar.
        </p>
      ) : (
        <div className="overflow-auto" style={{ maxHeight: 400 }}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-border)",
                }}
              >
                {["Nama", "Provinsi", "Bahasa", "Streak", "Bergabung"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-3 font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-muted)", fontSize: 10 }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr
                  key={user.id}
                  className="border-b"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                >
                  <td
                    className="py-2 pr-3 font-medium truncate max-w-[120px]"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {user.name ?? <span style={{ color: "var(--color-muted)" }}>—</span>}
                  </td>
                  <td
                    className="py-2 pr-3 truncate max-w-[100px]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {user.province ?? "—"}
                  </td>
                  <td className="py-2 pr-3 uppercase" style={{ color: "var(--color-muted)" }}>
                    {user.language ?? "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {(user.streak_count ?? 0) > 0 ? (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-xs font-bold"
                        style={{
                          background:
                            (user.streak_count ?? 0) >= 7
                              ? "var(--color-terra)"
                              : "var(--color-border)",
                          color:
                            (user.streak_count ?? 0) >= 7
                              ? "white"
                              : "var(--color-ink)",
                        }}
                      >
                        {user.streak_count}🔥
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="py-2" style={{ color: "var(--color-muted)" }}>
                    {timeAgo(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Content Calendar ─────────────────────────────────────────────────────────

function ContentCalendar({
  data,
  loading,
}: {
  data: UpcomingContent[];
  loading: boolean;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "white", boxShadow: "0 1px 4px rgba(13,30,61,0.08)" }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Jadwal Doa — 14 Hari Ke Depan
      </h2>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Tidak ada konten terjadwal dalam 14 hari ke depan.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                {["Tanggal", "Suku Bangsa", "Judul Doa (ID)"].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 pr-4 font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-muted)", fontSize: 10 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const isToday = row.date === todayStr;
                return (
                  <tr
                    key={row.date}
                    className="border-b"
                    style={{
                      borderColor: "var(--color-border)",
                      background: isToday
                        ? "oklch(20% 0.09 258 / 0.06)"
                        : "transparent",
                    }}
                  >
                    <td className="py-2.5 pr-4 font-mono font-semibold flex-shrink-0 whitespace-nowrap" style={{ color: isToday ? "var(--color-navy)" : "var(--color-muted)" }}>
                      {fmtDateFull(row.date)}
                      {isToday && (
                        <span
                          className="ml-2 px-1 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: "var(--color-terra)",
                            color: "white",
                            fontSize: 9,
                          }}
                        >
                          HARI INI
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: "var(--color-ink)" }}>
                      {row.nameId || "—"}
                      {row.nameEn && row.nameEn !== row.nameId && (
                        <span
                          className="ml-1"
                          style={{ color: "var(--color-muted)", fontWeight: 400 }}
                        >
                          ({row.nameEn})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5" style={{ color: "var(--color-muted)" }}>
                      {row.titleId || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pass: string) => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${pass}` },
      });

      if (res.ok) {
        sessionStorage.setItem("admin_pass", pass);
        onLogin(pass);
      } else {
        setError("Password salah. Coba lagi.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--color-navy-deep)" }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/icons/logo-ds-white.png"
            alt="Doa Sejati"
            style={{ height: 64, width: "auto", objectFit: "contain" }}
          />
          <div className="text-center">
            <h1
              className="font-display text-2xl font-bold"
              style={{ color: "white" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "oklch(70% 0.04 258)" }}>
              Doa Sejati — JATI
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-pass"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "oklch(60% 0.04 258)" }}
            >
              Password Admin
            </label>
            <input
              id="admin-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoFocus
              placeholder="Masukkan password..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "oklch(20% 0.07 258)",
                border: "1px solid oklch(30% 0.07 258)",
                color: "white",
                fontFamily: "var(--font-manrope)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-terra)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "oklch(30% 0.07 258)";
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm text-center"
              style={{ color: "oklch(65% 0.15 25)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pass.trim()}
            className="w-full rounded-xl py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading ? "oklch(40% 0.13 38)" : "var(--color-terra)",
              color: "white",
              fontFamily: "var(--font-manrope)",
            }}
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [adminPass, setAdminPass] = useState("");

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [volume, setVolume] = useState<VolumeEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [provinces, setProvinces] = useState<ProvinceEntry[]>([]);
  const [content, setContent] = useState<UpcomingContent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVolume, setLoadingVolume] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);

  // ── Auth check on mount ──
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pass");
    if (!stored) {
      setAuthed(false);
      return;
    }
    // Verify stored pass
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((res) => {
        if (res.ok) {
          setAdminPass(stored);
          setAuthed(true);
        } else {
          sessionStorage.removeItem("admin_pass");
          setAuthed(false);
        }
      })
      .catch(() => {
        setAuthed(false);
      });
  }, []);

  // ── Fetch all data ──
  const fetchAll = useCallback(
    async (pass: string) => {
      setLoadingStats(true);
      setLoadingVolume(true);
      setLoadingUsers(true);
      setLoadingContent(true);

      const headers = { Authorization: `Bearer ${pass}` };

      // Run all fetches in parallel
      const [statsRes, volumeRes, usersRes, contentRes] = await Promise.allSettled([
        fetch("/api/admin/stats", { headers }).then((r) => r.json()),
        fetch("/api/admin/prayer-volume", { headers }).then((r) => r.json()),
        fetch("/api/admin/users", { headers }).then((r) => r.json()),
        fetch("/api/admin/content", { headers }).then((r) => r.json()),
      ]);

      if (statsRes.status === "fulfilled" && !statsRes.value.error) {
        setStats(statsRes.value as Stats);
      }
      setLoadingStats(false);

      if (volumeRes.status === "fulfilled" && !volumeRes.value.error) {
        setVolume((volumeRes.value as { volume: VolumeEntry[] }).volume ?? []);
      }
      setLoadingVolume(false);

      if (usersRes.status === "fulfilled" && !usersRes.value.error) {
        const d = usersRes.value as { recent: AdminUser[]; provinceTop10: ProvinceEntry[] };
        setUsers(d.recent ?? []);
        setProvinces(d.provinceTop10 ?? []);
      }
      setLoadingUsers(false);

      if (contentRes.status === "fulfilled" && !contentRes.value.error) {
        setContent((contentRes.value as { upcoming: UpcomingContent[] }).upcoming ?? []);
      }
      setLoadingContent(false);

      setLastUpdated(new Date());
    },
    []
  );

  // Load data once authed
  useEffect(() => {
    if (authed && adminPass) {
      fetchAll(adminPass);
    }
  }, [authed, adminPass, fetchAll]);

  function handleLogin(pass: string) {
    setAdminPass(pass);
    setAuthed(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_pass");
    setAdminPass("");
    setAuthed(false);
    setStats(null);
    setVolume([]);
    setUsers([]);
    setProvinces([]);
    setContent([]);
    setLastUpdated(null);
  }

  function handleRefresh() {
    if (adminPass) fetchAll(adminPass);
  }

  // ── Auth check pending ──
  if (authed === null) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "var(--color-navy-deep)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src="/icons/logo-ds-white.png"
            alt="Doa Sejati"
            style={{ height: 48, opacity: 0.7 }}
          />
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-terra) transparent var(--color-terra) var(--color-terra)" }}
          />
        </div>
      </div>
    );
  }

  // ── Not authed ──
  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ── Dashboard ──
  return (
    <div
      className="fixed inset-0 z-50 overflow-auto"
      style={{ background: "var(--color-cream)", fontFamily: "var(--font-manrope)" }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: "var(--color-navy-deep)",
          boxShadow: "0 1px 0 oklch(30% 0.07 258)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/icons/logo-ds-white.png"
            alt="Doa Sejati"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
          />
          <div>
            <h1
              className="font-display font-bold text-base leading-tight"
              style={{ color: "white" }}
            >
              Doa Sejati
            </h1>
            <p className="text-xs" style={{ color: "oklch(60% 0.06 258)" }}>
              Admin Dashboard · JATI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{
              background: "oklch(22% 0.08 258)",
              color: "oklch(75% 0.05 258)",
              border: "1px solid oklch(30% 0.07 258)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(28% 0.09 258)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "oklch(22% 0.08 258)";
            }}
          >
            Perbarui
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{
              background: "transparent",
              color: "oklch(65% 0.13 38)",
              border: "1px solid oklch(35% 0.1 38)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(20% 0.07 38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Keluar
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="p-6 flex flex-col gap-6" style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Stat Cards ── */}
        <section
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <StatCard
            label="Total Pejuang Doa"
            value={stats?.totalUsers ?? 0}
            sub={`+${stats?.todayNewUsers ?? 0} hari ini`}
            loading={loadingStats}
          />
          <StatCard
            label="Berdoa Hari Ini"
            value={stats?.todayPrayers ?? 0}
            sub="doa dicatat"
            loading={loadingStats}
            accent
          />
          <StatCard
            label="30 Hari Terakhir"
            value={stats?.thirtyDayPrayers ?? 0}
            sub="total doa"
            loading={loadingStats}
          />
          <StatCard
            label="Push Token Aktif"
            value={stats?.usersWithPushToken ?? 0}
            sub="terima notifikasi"
            loading={loadingStats}
          />
          <StatCard
            label="Rata-rata Streak"
            value={stats ? `${stats.avgStreak}` : "—"}
            sub="hari berturut-turut"
            loading={loadingStats}
          />
          <StatCard
            label="Streak 7+ Hari"
            value={stats?.usersWithStreakOver7 ?? 0}
            sub={`${stats?.usersWithStreakOver30 ?? 0} streak 30+ hari`}
            loading={loadingStats}
            accent
          />
        </section>

        {/* ── Bar Chart ── */}
        <BarChart volume={volume} loading={loadingVolume} />

        {/* ── Province + Recent Signups ── */}
        <section
          className="grid gap-6"
          style={{ gridTemplateColumns: "1fr 1.4fr" }}
        >
          <ProvinceTable data={provinces} loading={loadingUsers} />
          <RecentSignupsTable data={users} loading={loadingUsers} />
        </section>

        {/* ── Content Calendar ── */}
        <ContentCalendar data={content} loading={loadingContent} />

        {/* ── Footer ── */}
        <footer
          className="text-center py-4 text-xs"
          style={{ color: "var(--color-muted)", borderTop: "1px solid var(--color-border)" }}
        >
          <p>
            <span className="font-semibold" style={{ color: "var(--color-ink)" }}>
              Doa Sejati — Admin
            </span>
            {" · "}
            JATI Yayasan Jala Transformasi Indonesia
            {" · "}
            Data diperbarui:{" "}
            {lastUpdated
              ? fmtDateTime(lastUpdated.toISOString())
              : "—"}
          </p>
        </footer>
      </main>
    </div>
  );
}

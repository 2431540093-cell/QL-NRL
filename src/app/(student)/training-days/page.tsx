"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function TrainingDaysContent() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [semesters, setSemesters] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data.error) {
          router.push("/login");
          return;
        }
        if (data.role !== "STUDENT") {
          router.push(["EVENT_MANAGER", "ADMIN", "SUPER_ADMIN"].includes(data.role) ? "/admin" : "/login");
          return;
        }
        setUser(data);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    fetch("/api/training-days", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
          setFilteredEvents(data.data);
        }
      })
      .catch((error) => console.error("Fetch events error:", error));

    fetch("/api/semesters", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSemesters(data.data || []));

    fetch("/api/users/me/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUserStats(data));
  }, [user]);

  useEffect(() => {
    let filtered = events;

    if (search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (semesterFilter) {
      filtered = filtered.filter((event) => event.semesterId === parseInt(semesterFilter));
    }

    setFilteredEvents(filtered);
  }, [search, semesterFilter, events]);

  const register = async (eventId: number) => {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId }),
    });

    if (res.ok) {
      fetch("/api/training-days", { credentials: "include" })
        .then((nextRes) => nextRes.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setEvents(data.data);
          }
        });
      alert("Dang ky thanh cong!");
    } else {
      const err = await res.json();
      alert(err.error || "Dang ky that bai");
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Danh sach su kien</p>
            <h1 className="text-3xl font-semibold text-slate-900">Su kien gan day</h1>
          </div>
          <div className="inline-flex items-center gap-4 rounded-3xl bg-slate-100 px-4 py-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Diem ren luyen</p>
              <p className="text-2xl font-semibold text-primary-950">{userStats?.trainingPoints || 0}</p>
            </div>
            <Link
              href="/student"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-950 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-primary-900/20 transition hover:bg-primary-900"
            >
              <span className="text-white">👤</span>
              <span className="text-white">Ca nhan</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Da dang ky</p>
          <p className="mt-4 text-3xl font-semibold text-green-600">{userStats?.registeredEvents || 0}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Da tham gia</p>
          <p className="mt-4 text-3xl font-semibold text-blue-600">{userStats?.attendedEvents || 0}</p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Diem ren luyen</p>
          <p className="mt-4 text-3xl font-semibold text-purple-600">{userStats?.trainingPoints || 0}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_180px]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Bo loc</p>
            <p className="text-base font-semibold text-slate-900">Tim kiem su kien</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Tim kiem su kien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-primary-950 focus:ring-2 focus:ring-primary-950/15"
            />
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary-950 focus:ring-2 focus:ring-primary-950/15"
            >
              <option value="">Tat ca hoc ky</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{event.title}</h3>
              <p className="mb-4 line-clamp-2 text-slate-600">{event.description}</p>

              <div className="mb-5 space-y-2 text-sm text-slate-500">
                <p>📅 {new Date(event.startTime).toLocaleDateString("vi-VN")}</p>
                <p>⏰ {new Date(event.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                <p>📍 {event.location}</p>
                <p>🎓 {event.semester?.name}</p>
                <p>
                  👥 {event._count?.registrations || 0}/{event.maxParticipants || "∞"} nguoi
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/training-days/${event.id}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-950/10 transition hover:bg-slate-800"
                >
                  <span className="text-white">Xem chi tiet</span>
                </Link>
                {event.status === "OPEN_REGISTRATION" && (
                  <button
                    onClick={() => register(event.id)}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-emerald-800/10 transition hover:bg-emerald-700"
                  >
                    <span className="text-white">Dang ky</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-500">
          Khong tim thay su kien nao
        </div>
      )}
    </div>
  );
}

export default function TrainingDaysPage() {
  return <TrainingDaysContent />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StudentContent() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
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

    fetch("/api/users/me/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStats(data));

    fetch("/api/users/me/history", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRegistrations(data.registrations || []));
  }, [user]);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ho so sinh vien</p>
            <h1 className="text-3xl font-semibold text-slate-900">Thong tin ca nhan</h1>
          </div>
          <Link
            href="/training-days"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-950 px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-primary-900/20 transition hover:bg-primary-900"
          >
            <span className="text-white">📅</span>
            <span className="text-white">Su kien</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6 space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Thong tin co ban</p>
            <h2 className="text-2xl font-semibold text-slate-900">{user.name}</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-800">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">MSSV</p>
              <p>{user.mssv || "Chua cap nhat"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">Khoa</p>
              <p>{user.faculty || "Chua cap nhat"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">Lop</p>
              <p>{user.class || "Chua cap nhat"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">Ngay tao tai khoan</p>
              <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Diem ren luyen</p>
              <p className="mt-4 text-3xl font-semibold text-purple-600">{stats?.trainingPoints || 0}</p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Su kien da dang ky</p>
              <p className="mt-4 text-3xl font-semibold text-green-600">{stats?.registeredEvents || 0}</p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Su kien da tham gia</p>
              <p className="mt-4 text-3xl font-semibold text-blue-600">{stats?.attendedEvents || 0}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Lich su dang ky</p>
              <h2 className="text-xl font-semibold text-slate-900">Hoat dong gan day</h2>
            </div>

            {registrations.length === 0 ? (
              <p className="py-10 text-center text-slate-500">Chua dang ky su kien nao</p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{reg.event.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {reg.event.location} • {reg.event.semester?.name}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reg.checkedIn ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {reg.checkedIn ? "Da tham gia" : "Da dang ky"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>📅 {new Date(reg.event.startTime).toLocaleDateString("vi-VN")}</p>
                      <p>⏰ {new Date(reg.event.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>

                    {reg.checkIns?.[0] && (
                      <div className="mt-3 text-sm text-slate-700">
                        ✅ Check-in luc {new Date(reg.checkIns[0].checkInTime).toLocaleString("vi-VN")}
                      </div>
                    )}

                    <div className="mt-4 text-right">
                      <Link href={`/training-days/${reg.event.id}`} className="text-sm font-semibold text-primary-950 hover:text-primary-900">
                        Xem chi tiet su kien →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return <StudentContent />;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Stats = {
  totalEvents: number;
  totalRegistrations: number;
  checkInRate: number | string;
};

type EventItem = {
  id: number;
  title: string;
  semester?: { name?: string };
  _count?: { registrations?: number };
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));

    fetch("/api/events", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEvents(data?.success && Array.isArray(data.data) ? data.data : []))
      .catch(() => setEvents([]));
  }, []);

  const topEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => (b._count?.registrations || 0) - (a._count?.registrations || 0))
        .slice(0, 4),
    [events],
  );

  const semesterGroups = useMemo(() => {
    const map = new Map<string, { events: number; registrations: number }>();
    events.forEach((event) => {
      const key = event.semester?.name || "Chưa phân học kì";
      const current = map.get(key) || { events: 0, registrations: 0 };
      current.events += 1;
      current.registrations += event._count?.registrations || 0;
      map.set(key, current);
    });
    return Array.from(map.entries()).slice(0, 4);
  }, [events]);

  const maxRegistrations = Math.max(...topEvents.map((event) => event._count?.registrations || 0), 1);
  const maxSemesterValue = Math.max(
    ...semesterGroups.flatMap(([, value]) => [value.events, value.registrations]),
    1,
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hiệu quả tổ chức sự kiện và mức độ tham gia sinh viên</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Tổng số sự kiện</h3>
          <strong>{stats?.totalEvents ?? "..."}</strong>
          <p className="mt-4 text-sm text-slate-500">Tất cả sự kiện đã tạo trong hệ thống</p>
          <div className="mt-6">
            <Link href="/admin/events" className="admin-btn admin-btn-secondary">
              Quản lý sự kiện
            </Link>
          </div>
        </div>

        <div className="admin-stat-card bg-[linear-gradient(180deg,#eef8ff_0%,#ffffff_100%)]">
          <h3>Tổng lượt đăng ký</h3>
          <strong>{stats?.totalRegistrations ?? "..."}</strong>
          <p className="mt-4 text-sm text-slate-500">Cập nhật tự động theo danh sách đăng ký</p>
        </div>

        <div className="admin-stat-card bg-[linear-gradient(180deg,#fff6e7_0%,#ffffff_100%)]">
          <h3>Tỷ lệ check-in</h3>
          <strong>{stats ? `${stats.checkInRate}%` : "..."}</strong>
          <p className="mt-4 text-sm font-semibold text-amber-700">Tỷ lệ tham gia trung bình</p>
          <p className="mt-3 text-sm text-slate-500">Đếm đăng ký có ít nhất một lượt check-in trên hệ thống</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="admin-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Top sự kiện nhiều lượt đăng ký</h2>
            <p className="mt-1 text-sm text-slate-500">Xếp hạng sự kiện theo tổng số sinh viên đã đăng ký</p>
          </div>

          <div className="space-y-4">
            {topEvents.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu sự kiện.</p>
            ) : (
              topEvents.map((event, index) => {
                const value = event._count?.registrations || 0;
                const colors = ["#f59e0b", "#fb923c", "#ec4899", "#94a3b8"];
                return (
                  <div key={event.id} className="grid grid-cols-[92px_minmax(0,1fr)_24px] items-center gap-3">
                    <p className="truncate text-sm text-slate-600">{event.title}</p>
                    <div className="h-14 rounded-md bg-slate-50 px-2 py-1">
                      <div
                        className="h-full rounded-md"
                        style={{
                          width: `${Math.max((value / maxRegistrations) * 100, value ? 8 : 0)}%`,
                          backgroundColor: colors[index] || colors[3],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{value}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="admin-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">So sánh học kỳ</h2>
            <p className="mt-1 text-sm text-slate-500">Đối chiếu số sự kiện và lượt đăng ký theo từng học kỳ</p>
          </div>

          <div className="flex min-h-[290px] items-end gap-7 overflow-x-auto rounded-md border border-slate-100 px-5 pb-6 pt-10">
            {semesterGroups.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu học kỳ.</p>
            ) : (
              semesterGroups.map(([name, value]) => (
                <div key={name} className="flex min-w-[140px] flex-1 flex-col items-center gap-3">
                  <div className="flex h-[220px] items-end gap-1.5">
                    <div
                      className="w-12 rounded-t-md bg-blue-500"
                      style={{ height: `${Math.max((value.events / maxSemesterValue) * 180, value.events ? 16 : 0)}px` }}
                    />
                    <div
                      className="w-12 rounded-t-md bg-emerald-500"
                      style={{
                        height: `${Math.max((value.registrations / maxSemesterValue) * 180, value.registrations ? 16 : 0)}px`,
                      }}
                    />
                  </div>
                  <p className="text-center text-xs text-slate-600">{name}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <i className="h-3 w-3 rounded-sm bg-blue-500" />
              Sự kiện
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-3 w-3 rounded-sm bg-emerald-500" />
              Đăng ký
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

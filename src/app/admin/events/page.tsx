"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiGrid, FiList, FiSearch } from "react-icons/fi";

type EventItem = {
  id: number;
  title: string;
  status: string;
  location?: string | null;
  registrationStart: string;
  registrationEnd: string;
  startTime: string;
  endTime?: string | null;
  semesterId?: number;
  semester?: { name?: string };
  _count?: { registrations?: number };
};

type Semester = { id: number; name: string };

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    fetch("/api/events", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEvents(data?.success && Array.isArray(data.data) ? data.data : []))
      .catch(() => setEvents([]));

    fetch("/api/semesters", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSemesters(data?.success && Array.isArray(data.data) ? data.data : []))
      .catch(() => setSemesters([]));
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || event.status === statusFilter;
      const matchesSemester = !semesterFilter || String(event.semesterId) === semesterFilter;
      return matchesSearch && matchesStatus && matchesSemester;
    });
  }, [events, search, statusFilter, semesterFilter]);

  const getStatusLabel = (status: string) => {
    if (status === "OPEN_REGISTRATION") return "DANG MO";
    if (status === "CLOSED") return "DA DONG";
    if (status === "DRAFT") return "NHAP";
    return status;
  };

  const getStatusClass = (status: string) => {
    if (status === "OPEN_REGISTRATION") return "admin-status admin-status-blue";
    if (status === "CLOSED") return "admin-status admin-status-red";
    return "admin-status admin-status-amber";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Danh sach su kien</h1>
        <p>Tra cuu, loc va quan ly su kien theo cung mot giao dien thong nhat</p>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <div className="admin-toolbar">
            <div className="admin-toolbar-group flex-1">
              <div className="relative min-w-[280px] flex-1">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tim kiem theo ten su kien..."
                  className="admin-input pl-10"
                />
              </div>
              <button type="button" className="admin-btn admin-btn-secondary">
                Tim kiem
              </button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select w-[170px]"
              >
                <option value="">Tat ca trang thai</option>
                <option value="DRAFT">Nhap</option>
                <option value="OPEN_REGISTRATION">Dang mo</option>
                <option value="CLOSED">Da dong</option>
              </select>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="admin-select w-[170px]"
              >
                <option value="">Tat ca hoc ki</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-toolbar-group">
              <button type="button" className="admin-btn admin-btn-accent !min-w-10 !px-0" aria-label="Bang">
                <FiGrid size={16} />
              </button>
              <button type="button" className="admin-btn admin-btn-secondary !min-w-10 !px-0" aria-label="Danh sach">
                <FiList size={16} />
              </button>
              <Link href="/admin/events/create" className="admin-btn admin-btn-primary">
                Tao su kien
              </Link>
            </div>
          </div>

          <div className="mt-5 admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Ten su kien</th>
                  <th>Hoc ki</th>
                  <th>Thoi gian dien ra</th>
                  <th>Thoi gian dang ky</th>
                  <th>Dia diem</th>
                  <th>Trang thai</th>
                  <th>SL dang ky</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-500">
                      Khong co su kien phu hop.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, index) => (
                    <tr key={event.id}>
                      <td>{index + 1}</td>
                      <td className="font-semibold text-slate-900">{event.title}</td>
                      <td>{event.semester?.name || "-"}</td>
                      <td>
                        {new Date(event.startTime).toLocaleString("vi-VN")} -{" "}
                        {event.endTime ? new Date(event.endTime).toLocaleString("vi-VN") : "-"}
                      </td>
                      <td>
                        {new Date(event.registrationStart).toLocaleString("vi-VN")} -{" "}
                        {new Date(event.registrationEnd).toLocaleString("vi-VN")}
                      </td>
                      <td>{event.location || "-"}</td>
                      <td>
                        <span className={getStatusClass(event.status)}>{getStatusLabel(event.status)}</span>
                      </td>
                      <td>{event._count?.registrations || 0} dang ky</td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/admin/events/${event.id}`} className="admin-btn admin-btn-secondary">
                            Chi tiet
                          </Link>
                          <Link href={`/admin/events/${event.id}/thong-ke`} className="admin-btn admin-btn-secondary">
                            DS dang ky
                          </Link>
                          <Link href={`/admin/check-in?eventId=${event.id}`} className="admin-btn admin-btn-secondary">
                            Check-in
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Hien thi</span>
            <select className="admin-select !w-[60px]">
              <option>10</option>
            </select>
            <span>tren tong {filteredEvents.length} su kien</span>
          </div>
        </div>
      </section>
    </div>
  );
}

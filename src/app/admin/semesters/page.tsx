"use client";

import { useEffect, useMemo, useState } from "react";

type Semester = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  _count?: { events?: number };
};

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  const loadSemesters = () => {
    fetch("/api/semesters", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSemesters(data?.success && Array.isArray(data.data) ? data.data : []))
      .catch(() => setSemesters([]));
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const filteredSemesters = useMemo(() => {
    return semesters.filter((semester) => semester.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, semesters]);

  const handleCreate = async () => {
    setError("");
    if (!form.name || !form.startDate || !form.endDate) {
      setError("Vui lòng nhập đủ thông tin học kì.");
      return;
    }

    const res = await fetch("/api/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Không thể tạo học kì.");
      return;
    }

    setForm({ name: "", startDate: "", endDate: "" });
    loadSemesters();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa học kì này?")) return;
    await fetch(`/api/semesters/${id}`, { method: "DELETE", credentials: "include" });
    loadSemesters();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Học kì - Năm học</h1>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <div className="admin-toolbar">
            <div className="admin-toolbar-group">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo năm học (VD: 2025-2026)..."
                className="admin-input !w-[280px]"
              />
              <button type="button" className="admin-btn admin-btn-secondary">
                Tìm kiếm
              </button>
            </div>

            <button type="button" onClick={handleCreate} className="admin-btn admin-btn-primary">
              Tạo học kì mới
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Tên học kì"
              className="admin-input"
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="admin-input"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="admin-input"
            />
          </div>

          <div className="mt-5 admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học kì - Năm học</th>
                  <th>Năm học</th>
                  <th>Học kì</th>
                  <th>SL sự kiện</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredSemesters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500">
                      Chưa có học kì nào.
                    </td>
                  </tr>
                ) : (
                  filteredSemesters.map((semester, index) => {
                    const parts = semester.name.split(" - ");
                    return (
                      <tr key={semester.id}>
                        <td>{index + 1}</td>
                        <td className="font-medium text-slate-900">{semester.name}</td>
                        <td>
                          <input value={parts[1] || semester.name} readOnly className="admin-input !min-h-[30px] !w-[126px] !py-1.5" />
                        </td>
                        <td>
                          <select value={parts[0] || "Học kì"} disabled className="admin-select !min-h-[30px] !w-[86px] !py-1.5">
                            <option>{parts[0] || "Học kì"}</option>
                          </select>
                        </td>
                        <td>{semester._count?.events || 0} sự kiện</td>
                        <td className="text-right">
                          <button type="button" onClick={() => handleDelete(semester.id)} className="admin-btn admin-btn-danger">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Hiển thị</span>
            <select className="admin-select !w-[60px]">
              <option>10</option>
            </select>
            <span>trên tổng {filteredSemesters.length} học kì</span>
          </div>
        </div>
      </section>
    </div>
  );
}

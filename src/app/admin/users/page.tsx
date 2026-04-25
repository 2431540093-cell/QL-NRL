"use client";

import { useEffect, useState } from "react";

type UserItem = {
  id: number;
  mssv?: string | null;
  name?: string | null;
  faculty?: string | null;
  class?: string | null;
  email: string;
  role: string;
  status: string;
  trainingPoints?: number | null;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`, {
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    setUsers(Array.isArray(data?.users) ? data.users : []);
    setTotalPages(data?.totalPages || 1);
    setTotalUsers(data?.total || 0);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const changeRole = async (userId: number, role: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const toggleStatus = async (userId: number, status: string) => {
    const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchUsers();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý người dùng</h1>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <div className="admin-toolbar">
            <div />
            <div className="admin-toolbar-group">
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Tìm theo họ tên hoặc MSSV..."
                className="admin-input !w-[342px]"
              />
              <button type="button" className="admin-btn admin-btn-secondary">
                Tìm kiếm
              </button>
              <button type="button" className="admin-btn admin-btn-secondary">
                Import từ Excel
              </button>
              <button type="button" className="admin-btn admin-btn-secondary">
                Lịch sử import
              </button>
            </div>
          </div>

          <div className="mt-5 admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th>Khoa</th>
                  <th>Lớp</th>
                  <th>Email</th>
                  <th>Tổng NRL</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-500">
                      Chưa có người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{(page - 1) * 10 + index + 1}</td>
                      <td>{user.mssv || "-"}</td>
                      <td className="font-medium text-slate-900">{user.name || "-"}</td>
                      <td>{user.faculty || "-"}</td>
                      <td>{user.class || "-"}</td>
                      <td>{user.email || "-"}</td>
                      <td>{user.trainingPoints || 0}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="admin-select !min-h-[34px] !w-[108px] !py-1.5"
                        >
                          <option value="STUDENT">Sinh viên</option>
                          <option value="EVENT_MANAGER">Quản lý sự kiện</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStatus(user.id, user.status)}
                          className="admin-select !min-h-[34px] !w-[100px] !py-1.5 text-left"
                        >
                          {user.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                        </button>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              <div className="mb-2 flex items-center gap-3">
                <span>Hiển thị</span>
                <select className="admin-select !w-[60px]">
                  <option>10</option>
                </select>
              </div>
              <p>trên tổng {totalUsers} người dùng</p>
            </div>

            <div className="admin-pagination">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="text-slate-700 disabled:opacity-40"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 ${
                    value === page ? "bg-accent-400 text-slate-900" : "text-slate-700"
                  }`}
                >
                  {value}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
                className="text-slate-700 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

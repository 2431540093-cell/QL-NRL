"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || data.role !== "STUDENT") {
          router.push("/login");
        } else {
          setUser(data);
        }
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  };

  const menuItems = [
    { href: "/training-days", label: "Sự kiện", icon: "📅" },
    { href: "/student", label: "Cá nhân", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="flex h-20 items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary-950 text-white text-lg shadow-sm">
              🎓
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Sinh viên</p>
                <p className="truncate text-base font-semibold text-slate-900">{user?.name}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "«" : "»"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {sidebarOpen && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-slate-900 font-medium">Xin chào</p>
              <p>{user?.email}</p>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-primary-950 text-white shadow-sm ring-1 ring-primary-900/20"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className={pathname === item.href ? "text-white" : "text-slate-700"}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-72" : "md:ml-20"}`}>
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100 px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Giao diện sinh viên</p>
              <h1 className="text-2xl font-semibold text-slate-900">{pathname === "/student" ? "Hồ sơ cá nhân" : "Sự kiện"}</h1>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-950 text-white">N</span>
              <span>{user?.name}</span>
            </div>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

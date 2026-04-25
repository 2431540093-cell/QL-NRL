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
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-left text-xl font-bold text-blue-600 mb-4"
          >
            {sidebarOpen ? "🎓 Student" : "🎓"}
          </button>

          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Xin chào,</p>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-2 rounded hover:bg-blue-50 transition-colors ${
                  pathname === item.href ? "bg-primary-950 text-white shadow-sm" : "text-slate-800"
                }`}
              >
                <span className={`text-lg mr-3 ${pathname === item.href ? "text-white" : "text-slate-700"}`}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="mt-8 pt-4 border-t">
              <button
                onClick={logout}
                className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-72" : "md:ml-20"}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Giao diện sinh viên</p>
              <h1 className="text-2xl font-semibold text-slate-900">{pathname === "/student" ? "Hồ sơ cá nhân" : "Sự kiện"}</h1>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-950 text-white">N</span>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

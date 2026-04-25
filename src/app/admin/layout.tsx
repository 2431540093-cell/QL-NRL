"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiBook,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUsers,
  FiX,
} from "react-icons/fi";

type User = {
  email?: string;
  name?: string;
  role?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: Array<{ href: string; label: string }>;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  {
    href: "/admin/events",
    label: "Sự kiện",
    icon: FiCalendar,
    children: [
      { href: "/admin/events/create", label: "Tạo sự kiện" },
      { href: "/admin/events", label: "Danh sách sự kiện" },
    ],
  },
  { href: "/admin/semesters", label: "Học kì - Năm học", icon: FiBook },
  { href: "/admin/users", label: "Người dùng", icon: FiUsers },
];

function getPageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/events/create")) return "Tạo sự kiện mới";
  if (pathname.startsWith("/admin/events")) return "Danh sách sự kiện";
  if (pathname.startsWith("/admin/semesters")) return "Học kì - Năm học";
  if (pathname.startsWith("/admin/users")) return "Quản lý người dùng";
  return "Quản trị";
}

type BreadcrumbItem = {
  label: string;
  href?: string;
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/admin") return [{ label: "Dashboard" }];

  const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/admin" }];

  if (pathname.startsWith("/admin/events/create")) {
    crumbs.push({ label: "Sự kiện", href: "/admin/events" });
    crumbs.push({ label: "Tạo sự kiện mới" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/events")) {
    crumbs.push({ label: "Sự kiện" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/semesters")) {
    crumbs.push({ label: "Học kì - Năm học" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/users")) {
    crumbs.push({ label: "Người dùng" });
    return crumbs;
  }

  return crumbs;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
        setUser(data);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (pathname.startsWith("/admin/events")) {
      setEventsExpanded(true);
    }
  }, [pathname]);

  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE", credentials: "include" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#edf3f9] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[216px] flex-col bg-primary-950 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[88px]"
        }`}
      >
        <div className="flex min-h-[144px] flex-col border-b border-white/10 px-3 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div className={`overflow-hidden transition-all ${sidebarOpen ? "opacity-100" : "opacity-0 md:w-0"}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-400/15 text-accent-400">
                  <FiHome size={20} />
                </div>
                {sidebarOpen && (
                  <div className="leading-tight">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent-400">
                      VAA
                    </p>
                    <p className="text-sm font-semibold text-white">Ngày Rèn Luyện</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>

          {sidebarOpen && (
            <div className="text-xs text-white/70">
              <p className="mb-2 font-semibold text-white/80">Quản trị</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isGroupActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/") ||
              item.children?.some((child) => pathname === child.href);

            if (item.children) {
              return (
                <div key={item.href} className="mb-2">
                  <button
                    type="button"
                    onClick={() => setEventsExpanded((value) => !value)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isGroupActive
                        ? "bg-accent-400 text-primary-950"
                        : "text-white hover:bg-white/8"
                    }`}
                  >
                    <Icon size={16} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 font-medium">{item.label}</span>
                        {eventsExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                      </>
                    )}
                  </button>

                  {sidebarOpen && eventsExpanded && (
                    <div className="ml-5 mt-1 border-l border-white/20 pl-2">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`mb-1 block rounded-md px-3 py-2 text-sm transition ${
                              childActive
                                ? "bg-accent-400 text-primary-950"
                                : "text-white hover:bg-white/8"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isGroupActive ? "bg-accent-400 text-primary-950" : "text-white hover:bg-white/8"
                }`}
              >
                <Icon size={16} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <Link
            href="/"
            className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/8"
          >
            <FiHome size={16} />
            {sidebarOpen && <span>Về trang chủ</span>}
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/8"
          >
            <FiLogOut size={16} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "md:ml-[216px]" : "md:ml-[88px]"}`}>
        <main className="min-h-screen p-3 md:p-5">
          <div className="min-h-[calc(100vh-24px)] rounded-2xl border border-[#d8e3ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen((value) => !value)}
                  className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Toggle sidebar"
                >
                  <FiMenu size={18} />
                </button>
                <div className="text-sm text-slate-500">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.label}>
                      {index > 0 && <span className="mx-2 text-slate-300">/</span>}
                      {"href" in crumb && crumb.href ? (
                        <Link href={crumb.href} className="hover:text-slate-700">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-slate-700">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {user && (
                <div className="text-right text-sm">
                  <p className="font-medium text-slate-900">{user.name || user.email}</p>
                  <p className="text-slate-500">{getPageTitle(pathname)}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-6 md:px-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

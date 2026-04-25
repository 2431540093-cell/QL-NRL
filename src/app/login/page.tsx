"use client";

import { useState } from "react";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", res.status);

      let data;
      try {
        const text = await res.text();
        console.log("Response text:", text);
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        setError("Server returned invalid response");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Redirect based on role
      switch (data.user.role) {
        case "STUDENT":
          window.location.href = "/student";
          break;
        case "EVENT_MANAGER":
          window.location.href = "/admin";
          break;
        case "ADMIN":
          window.location.href = "/admin";
          break;
        case "SUPER_ADMIN":
          window.location.href = "/admin";
          break;
        default:
          window.location.href = "/training-days";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading && email && password) {
      login();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !loading) {
      login();
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 flex items-center justify-center">
      <div className="absolute inset-x-0 top-0 h-80 bg-accent-400/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-primary-950/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-[32px] bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-950 to-primary-900 px-8 py-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-sm">
              <span className="text-2xl">✈️</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Ngày Rèn Luyện</h1>
            <p className="mt-2 text-sm text-white/85">Hệ thống quản lý sự kiện đào tạo</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-semibold text-red-800 mb-1">Đăng nhập thất bại</div>
                <div>{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-14 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-primary-950 focus:ring-2 focus:ring-primary-950/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-14 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-primary-950 focus:ring-2 focus:ring-primary-950/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-950 to-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-primary-900 hover:to-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={20} />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-2">Tài khoản demo</p>
              <p className="text-slate-600">Email: admin@example.com</p>
              <p className="text-slate-600">Password: password123</p>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 text-center text-xs text-slate-500">
            Học Viện Hàng Không Việt Nam © 2026
          </div>
        </div>
      </div>
    </div>
  );
}

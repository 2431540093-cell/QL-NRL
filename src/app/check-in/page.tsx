"use client";

import { useState, useEffect } from "react";

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || data?.error) {
          window.location.href = "/login";
          return;
        }
        setUser(data);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  const checkIn = async () => {
    if (!user) {
      setMessage("❌ Vui lòng đăng nhập trước");
      return;
    }

    const res = await fetch("/api/check-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ qrToken: token }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        setMessage("❌ Bạn chưa đăng nhập");
        window.location.href = "/login";
        return;
      }
      const err = await res.json();
      console.error("Check-in error:", err);
      setMessage("❌ " + (err.error || "Lỗi check-in"));
      return;
    }

    const data = await res.json();

    setMessage("✅ Check-in thành công!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📲 Check-in</h1>

      <input
        type="text"
        placeholder="Enter QR token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={checkIn}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Check-in
      </button>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
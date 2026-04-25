"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminCheckInPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEventId(new URLSearchParams(window.location.search).get("eventId"));
    }

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
        if (!["EVENT_MANAGER", "ADMIN", "SUPER_ADMIN"].includes(data.role)) {
          router.push("/login");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (!eventId) {
      setLoading(false);
      return;
    }

    fetch(`/api/training-days/${eventId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
      })
      .finally(() => setLoading(false));
  }, [user, eventId]);

  const checkIn = async () => {
    if (!token) {
      setMessage("❌ Vui lòng nhập mã QR token");
      return;
    }

    const res = await fetch("/api/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ qrToken: token }),
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage("❌ " + (err.error || "Lỗi check-in"));
      return;
    }

    setMessage("✅ Check-in thành công!");
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Check-in</h1>
          {event && <p className="text-sm text-gray-600">Sự kiện: {event.title}</p>}
        </div>
        <Link
          href="/admin/events"
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
        >
          Quay lại sự kiện
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-xl">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mã QR Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border p-3 rounded"
            placeholder="Nhập QR token"
          />
        </div>

        <button
          onClick={checkIn}
          className="bg-blue-500 text-white px-5 py-3 rounded hover:bg-blue-600"
        >
          Check-in
        </button>

        {message && (
          <div className="mt-4 text-sm text-gray-800">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

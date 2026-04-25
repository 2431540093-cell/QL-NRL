"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EventStatsPage() {
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

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
    if (!user || !eventId) return;

    Promise.all([
      fetch(`/api/training-days/${eventId}`, { credentials: "include" }).then((res) => {
        if (!res.ok) throw new Error("Failed to load event");
        return res.json();
      }),
      fetch(`/api/registrations?eventId=${eventId}`, { credentials: "include" }).then((res) => {
        if (!res.ok) throw new Error("Failed to load registrations");
        return res.json();
      }),
    ])
      .then(([eventData, registrationsData]) => {
        setEvent(eventData);
        setRegistrations(registrationsData || []);
      })
      .catch((error) => {
        console.error(error);
        setEvent(null);
        setRegistrations([]);
      })
      .finally(() => setLoading(false));
  }, [user, eventId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!event) return <div className="p-6">Khong tim thay su kien.</div>;

  const totalRegistered = registrations.length;
  const checkedInCount = registrations.filter((reg) => reg.checkedIn).length;
  const notCheckedInCount = registrations.filter((reg) => !reg.checkedIn).length;
  const capacity = event.maxParticipants || "Khong gioi han";
  const remainingSeats =
    typeof event.maxParticipants === "number" ? Math.max(0, event.maxParticipants - totalRegistered) : "∞";
  const checkInRate = totalRegistered > 0 ? ((checkedInCount / totalRegistered) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <Link href="/admin/events" className="mb-2 inline-block text-blue-600 hover:text-blue-800">
            ← Quay lai danh sach su kien
          </Link>
          <h1 className="text-3xl font-bold">DS dang ky va check-in</h1>
          <p className="mt-1 text-gray-600">{event.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/events/${event.id}`} className="rounded border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
            Xem chi tiet su kien
          </Link>
          <Link href={`/admin/check-in?eventId=${event.id}`} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Mo trang Check-in
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tong dang ky</p>
          <p className="mt-3 text-4xl font-bold text-gray-900">{totalRegistered}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Da check-in</p>
          <p className="mt-3 text-4xl font-bold text-green-600">{checkedInCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Chua check-in</p>
          <p className="mt-3 text-4xl font-bold text-orange-600">{notCheckedInCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Suc chua</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{capacity}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cho trong</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{remainingSeats}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ty le check-in</p>
          <p className="mt-3 text-3xl font-bold text-blue-600">{checkInRate}%</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Danh sach nguoi tham gia</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tong hop nguoi da dang ky, da check-in va chua check-in cua su kien nay.
          </p>
        </div>
        {registrations.length === 0 ? (
          <p className="text-gray-500">Chua co dang ky nao.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">#</th>
                  <th className="p-3">Ten</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">MSSV</th>
                  <th className="p-3">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{reg.user?.name || "---"}</td>
                    <td className="p-3">{reg.user?.email || "---"}</td>
                    <td className="p-3">{reg.user?.mssv || "---"}</td>
                    <td className="p-3">
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                          Da check-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800">
                          Chua check-in
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

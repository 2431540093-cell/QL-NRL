"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminEventDetailPage() {
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

    const fetchEvent = async () => {
      const res = await fetch(`/api/training-days/${eventId}`, { credentials: "include" });
      if (!res.ok) {
        router.push("/admin/events");
        return;
      }
      const data = await res.json();
      setEvent(data);
    };

    const fetchRegistrations = async () => {
      const res = await fetch(`/api/registrations?eventId=${eventId}`, { credentials: "include" });
      if (!res.ok) {
        setRegistrations([]);
        return;
      }
      const data = await res.json();
      setRegistrations(data);
    };

    Promise.all([fetchEvent(), fetchRegistrations()]).finally(() => setLoading(false));
  }, [user, eventId, router]);

  if (loading || !user) {
    return <div className="p-6">Loading...</div>;
  }

  if (!event) {
    return <div className="p-6">Sự kiện không tồn tại.</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <Link href="/admin/events" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold">Chi tiết sự kiện</h1>
          <p className="text-sm text-gray-600 mt-1">{event.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/events"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
          >
            Quay lại
          </Link>
          <Link
            href={`/admin/check-in?eventId=${event.id}`}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Check-in
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thông tin chung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Học kỳ</p>
                <p className="font-semibold">{event.semester?.name || "Không có"}</p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái</p>
                <p className="font-semibold">{event.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Thời gian bắt đầu</p>
                <p className="font-semibold">{new Date(event.startTime).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-gray-500">Thời gian kết thúc</p>
                <p className="font-semibold">{event.endTime ? new Date(event.endTime).toLocaleString('vi-VN') : 'Chưa xác định'}</p>
              </div>
              <div>
                <p className="text-gray-500">Địa điểm</p>
                <p className="font-semibold">{event.location || 'Chưa xác định'}</p>
              </div>
              <div>
                <p className="text-gray-500">Đã đăng ký</p>
                <p className="font-semibold">{event._count?.registrations || 0}/{event.maxParticipants || '∞'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description || 'Chưa có mô tả'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Thời gian đăng ký</span>
                <span>{new Date(event.registrationStart).toLocaleString('vi-VN')} → {new Date(event.registrationEnd).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Giới hạn</span>
                <span>{event.maxParticipants || 'Không giới hạn'}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã đăng ký</span>
                <span>{event._count?.registrations || 0}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tham gia nhanh</h2>
            <p className="text-sm text-gray-600 mb-4">Sử dụng trang check-in để nhập mã QR và xác nhận tham gia.</p>
            <Link href={`/admin/check-in?eventId=${event.id}`} className="block bg-blue-500 text-white text-center py-3 rounded hover:bg-blue-600">
              Mở trang Check-in
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Danh sách người tham gia</h2>
        {registrations.length === 0 ? (
          <p className="text-gray-500">Chưa có người tham gia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">#</th>
                  <th className="p-3">Tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">MSSV</th>
                  <th className="p-3">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{reg.user?.name || '---'}</td>
                    <td className="p-3">{reg.user?.email || '---'}</td>
                    <td className="p-3">{reg.user?.mssv || '---'}</td>
                    <td className="p-3">
                      {reg.checkedIn ? (
                        <span className="text-green-600 font-semibold">Đã check-in</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Chưa check-in</span>
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

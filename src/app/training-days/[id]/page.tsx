"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function EventDetailPage() {
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  useEffect(() => {
    // Check auth
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.error) {
          router.push("/login");
          return;
        }
        if (data.role !== "STUDENT") {
          router.push(data.role === "EVENT_MANAGER" || data.role === "ADMIN" || data.role === "SUPER_ADMIN" ? `/admin/events/${eventId}` : "/login");
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

    // Load event details
    fetch(`/api/training-days/${eventId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setEvent(data);
        } else {
          router.push("/training-days");
        }
      })
      .catch(() => {
        router.push("/training-days");
      });

    // Check if user is registered
    fetch(`/api/registrations/check/${eventId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsRegistered(data.registered);
        if (data.qrToken) {
          setQrToken(data.qrToken);
        }
      });
  }, [user, eventId, router]);

  const register = async () => {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId: parseInt(eventId) }),
    });

    if (res.ok) {
      const data = await res.json();
      setIsRegistered(true);
      setQrToken(data.qrToken);
      alert("Đăng ký thành công!");
    } else {
      const err = await res.json();
      alert(err.error || "Đăng ký thất bại");
    }
  };

  if (!user || !event) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/training-days"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
        <Link
          href="/student"
          className="rounded-lg bg-primary-950 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-primary-900"
        >
          👤 Cá nhân
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thông tin sự kiện</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Học kỳ</p>
                <p className="font-semibold">{event.semester?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className={`font-semibold ${
                  event.status === "OPEN_REGISTRATION" ? "text-green-600" :
                  event.status === "CLOSED" ? "text-red-600" : "text-yellow-600"
                }`}>
                  {event.status === "OPEN_REGISTRATION" ? "Đang mở đăng ký" :
                   event.status === "CLOSED" ? "Đã đóng" : "Nháp"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian bắt đầu</p>
                <p className="font-semibold">
                  {new Date(event.startTime).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian kết thúc</p>
                <p className="font-semibold">
                  {event.endTime ? new Date(event.endTime).toLocaleString('vi-VN') : 'Chưa xác định'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa điểm</p>
                <p className="font-semibold">{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lượng đăng ký</p>
                <p className="font-semibold">
                  {event._count?.registrations || 0}/{event.maxParticipants || '∞'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Registration Period */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thời gian đăng ký</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bắt đầu đăng ký</p>
                <p className="font-semibold">
                  {new Date(event.registrationStart).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kết thúc đăng ký</p>
                <p className="font-semibold">
                  {new Date(event.registrationEnd).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration & QR */}
        <div className="space-y-6">
          {/* Registration Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Đăng ký tham gia</h2>

            {isRegistered ? (
              <div className="text-center">
                <div className="text-green-600 text-lg font-semibold mb-4">
                  ✅ Đã đăng ký thành công
                </div>
                {qrToken && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Mã QR check-in:</p>
                    <div className="flex justify-center">
                      <QRCodeCanvas value={qrToken} size={150} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Sử dụng mã QR này để check-in tại sự kiện
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                {event.status === "OPEN_REGISTRATION" ? (
                  <button
                    onClick={register}
                    className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    Đăng ký ngay
                  </button>
                ) : (
                  <div className="text-gray-500">
                    {event.status === "CLOSED" ? "Sự kiện đã đóng đăng ký" : "Sự kiện chưa mở đăng ký"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thống kê</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Đã đăng ký:</span>
                <span className="font-semibold">{event._count?.registrations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tối đa:</span>
                <span className="font-semibold">{event.maxParticipants || '∞'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Còn trống:</span>
                <span className="font-semibold">
                  {event.maxParticipants ?
                    Math.max(0, event.maxParticipants - (event._count?.registrations || 0)) :
                    '∞'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

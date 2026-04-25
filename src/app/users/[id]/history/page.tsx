"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/users/${id}/history`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setHistory(data))
      .catch((err) => {
        console.error("Fetch history error:", err);
        setError(err.message || "Không thể tải lịch sử tham gia");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6">Đang tải lịch sử tham gia...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Lịch sử tham gia</h1>

      {history.length === 0 ? (
        <p>Chưa có dữ liệu lịch sử.</p>
      ) : (
        <div className="space-y-4">
          {history.map((reg: any) => (
            <div key={reg.id} className="border p-4 rounded shadow-sm bg-white">
              <h2 className="font-semibold text-lg mb-2">{reg.event.title}</h2>
              <p className="text-sm text-gray-600">Địa điểm: {reg.event.location}</p>
              <p className="text-sm text-gray-600">
                Thời gian: {new Date(reg.event.startTime).toLocaleString()}
                {reg.event.endTime ? ` - ${new Date(reg.event.endTime).toLocaleString()}` : ""}
              </p>
              <p className="text-sm">Trạng thái: {reg.checkedIn ? "Đã check-in" : "Đã đăng ký"}</p>
              {reg.checkIns.length > 0 && (
                <p className="text-sm text-gray-700">
                  Check-in lúc: {new Date(reg.checkIns[0].checkInTime).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2 break-all">QR Token: {reg.qrToken}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
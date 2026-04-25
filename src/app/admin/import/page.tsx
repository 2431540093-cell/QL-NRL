"use client";

import { useState, useEffect } from "react";

export default function AdminImportPage() {
  const [user, setUser] = useState<any>(null);
  const [importData, setImportData] = useState({
    eventId: '',
    emails: ''
  });

  // Check authentication
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data && (data.role !== "ADMIN" && data.role !== "SUPER_ADMIN")) {
          window.location.href = "/login";
          return;
        }
        if (data) setUser(data);
      })
      .catch((error) => {
        console.error("Auth check error:", error);
        window.location.href = "/login";
      });
  }, []);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📥 Import Dữ Liệu</h1>

      {/* Import Past Event Data */}
      <div className="max-w-2xl">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Import Dữ Liệu Sự Kiện Cũ</h2>
          <p className="text-gray-600 mb-4">
            Import dữ liệu đăng ký từ các sự kiện đã qua. Nhập ID sự kiện và danh sách email người dùng (cách nhau bởi dấu phẩy).
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID Sự kiện *</label>
              <input
                type="text"
                value={importData.eventId}
                onChange={(e) => setImportData({...importData, eventId: e.target.value})}
                className="border p-3 w-full rounded"
                placeholder="Nhập ID sự kiện"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email người dùng *</label>
              <textarea
                value={importData.emails}
                onChange={(e) => setImportData({...importData, emails: e.target.value})}
                className="border p-3 w-full rounded"
                placeholder="Email cách nhau bởi dấu phẩy (vd: user1@example.com, user2@example.com)"
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition-colors"
              onClick={async () => {
                if (!importData.eventId.trim() || !importData.emails.trim()) {
                  alert("Vui lòng nhập đầy đủ thông tin");
                  return;
                }

                const emails = importData.emails.split(',').map((e: string) => e.trim());

                const res = await fetch("/api/import-past-data", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    eventId: importData.eventId,
                    userEmails: emails,
                  }),
                });

                let err: any = {};
                try {
                  err = await res.json();
                } catch {
                  err = { error: "Server không trả JSON" };
                }

                if (!res.ok) {
                  console.error("Import error:", {
                    status: res.status,
                    error: err,
                  });
                  alert(err.error || "Không thể import dữ liệu");
                  return;
                }

                const data = await res.json();

                alert(`Đã import thành công ${data.count} đăng ký`);

                // Reset form
                setImportData({ eventId: '', emails: '' });
              }}
            >
              Import Dữ Liệu
            </button>
          </div>
        </div>

        {/* Import Users */}
        <div className="bg-white border rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-4">Import Người Dùng</h2>
          <p className="text-gray-600 mb-4">
            Import danh sách người dùng từ hệ thống cũ.
          </p>

          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={async () => {
              const res = await fetch("/api/import-users", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  role: user?.role,
                }),
              });

              let data;
              try {
                data = await res.json();
              } catch {
                data = { error: "Server không trả JSON" };
              }

              if (!res.ok) {
                console.error("Import users error:", {
                  status: res.status,
                  error: data,
                });
                alert(data.error || "Import failed");
                return;
              }

              console.log("IMPORT RESPONSE:", data);
              alert(data.message);
            }}
          >
            Import Người Dùng
          </button>
        </div>
      </div>
    </div>
  );
}
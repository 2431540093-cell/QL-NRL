"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type EventFormData = {
  semesterId: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  startTime: string;
  endTime: string;
  registrationStart: string;
  registrationEnd: string;
  daysPerSession: string;
  maxParticipants: string;
};

type Semester = { id: number; name: string };

export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    semesterId: "",
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    startTime: "",
    endTime: "",
    registrationStart: "",
    registrationEnd: "",
    daysPerSession: "0.5",
    maxParticipants: "",
  });
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/semesters", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const list = data?.success && Array.isArray(data.data) ? data.data : [];
        setSemesters(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, semesterId: prev.semesterId || String(list[0].id) }));
        }
      })
      .catch(() => setSemesters([]));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.semesterId || !formData.title.trim() || !formData.registrationStart || !formData.registrationEnd || !formData.startTime || !formData.endTime) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return false;
    }

    const regStart = new Date(formData.registrationStart);
    const regEnd = new Date(formData.registrationEnd);
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (regStart >= regEnd) {
      setError("Thời gian mở đăng ký phải trước thời gian đóng đăng ký.");
      return false;
    }

    if (start >= end) {
      setError("Thời gian bắt đầu phải trước thời gian kết thúc.");
      return false;
    }

    if (regEnd > start) {
      setError("Thời gian đóng đăng ký phải trước thời gian bắt đầu sự kiện.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...formData,
        semesterId: parseInt(formData.semesterId, 10),
        daysPerSession: formData.daysPerSession ? parseFloat(formData.daysPerSession) : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : null,
      }),
    });

    if (res.ok) {
      router.push("/admin/events");
      return;
    }

    const data = await res.json().catch(() => null);
    setError(data?.error || "Không thể tạo sự kiện.");
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Tạo sự kiện mới</h1>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Thông tin sự kiện</h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="semesterId">Học kì - Năm học *</label>
              <select
                id="semesterId"
                name="semesterId"
                value={formData.semesterId}
                onChange={handleChange}
                className="admin-select max-w-[380px]"
                required
              >
                <option value="">Chọn học kì</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="title">Tên sự kiện *</label>
              <input id="title" name="title" value={formData.title} onChange={handleChange} className="admin-input" required />
            </div>

            <div className="admin-field">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="admin-textarea" />
            </div>

            <div className="admin-field">
              <label htmlFor="imageUrl">URL ảnh đại diện sự kiện</label>
              <p className="admin-field-hint">Nhập URL ảnh trên internet hoặc tải file ảnh.</p>
              <div className="flex flex-wrap gap-2">
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="admin-input max-w-[408px]"
                />
                <button type="button" className="admin-btn admin-btn-secondary">
                  Tải ảnh
                </button>
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="location">Địa điểm</label>
              <input id="location" name="location" value={formData.location} onChange={handleChange} className="admin-input" />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-field">
                <label htmlFor="startTime">Bắt đầu *</label>
                <input id="startTime" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} className="admin-input" required />
              </div>
              <div className="admin-field">
                <label htmlFor="endTime">Kết thúc *</label>
                <input id="endTime" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} className="admin-input" required />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-field">
                <label htmlFor="registrationStart">Mở đăng ký *</label>
                <input
                  id="registrationStart"
                  name="registrationStart"
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="registrationEnd">Đóng đăng ký *</label>
                <input
                  id="registrationEnd"
                  name="registrationEnd"
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-field">
                <label htmlFor="daysPerSession">Số ngày rèn luyện mỗi buổi check-in *</label>
                <select id="daysPerSession" name="daysPerSession" value={formData.daysPerSession} onChange={handleChange} className="admin-select max-w-[268px]">
                  <option value="0.5">0.5 NRL / buổi</option>
                  <option value="1">1 NRL / buổi</option>
                  <option value="2">2 NRL / buổi</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="maxParticipants">Số lượng tối đa (toàn sự kiện)</label>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="admin-input max-w-[268px]"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#d9e4ef] px-4 py-5">
              <h3 className="text-lg font-semibold text-slate-900">Danh sách buổi</h3>
              <p className="mt-2 text-sm text-slate-500">
                Vui lòng chọn thời gian bắt đầu và kết thúc sự kiện để tạo danh sách buổi.
              </p>
            </div>

            <div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Tạo sự kiện
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

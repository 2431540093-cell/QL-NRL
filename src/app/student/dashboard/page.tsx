"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data));

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        console.log("Student Events API Response:", data); // Debug log
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          console.error("Invalid events data format:", data);
          setEvents([]);
        }
      })
      .catch((error) => {
        console.error("Fetch events error:", error);
        setEvents([]);
      });
  }, []);

  const register = async (eventId: number) => {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, eventId }),
    });

    if (res.ok) {
      alert("Registered successfully!");
      // Refresh events or update state
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const getRegistrationStatus = (event: any) => {
    const now = new Date();
    const regStart = new Date(event.registrationStart);
    const regEnd = new Date(event.registrationEnd);

    if (now < regStart) return "Chưa mở đăng ký";
    if (now > regEnd) return "Đã đóng đăng ký";
    return "Đang mở đăng ký";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Events</h1>

      <div className="grid gap-4">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event: any) => (
            <div
              key={event.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{event.title}</h2>
              {event.description && <p className="text-gray-700">{event.description}</p>}
              <p className="text-gray-600">{event.location}</p>
              <p className="text-sm text-gray-500">
                {new Date(event.startTime).toLocaleString()}
                {event.endTime && ` - ${new Date(event.endTime).toLocaleString()}`}
              </p>
              <p className="text-sm">Semester: {event.semester?.name}</p>
              <p className="text-sm">Status: {getRegistrationStatus(event)}</p>

              <div className="flex gap-2 mt-3">
                {getRegistrationStatus(event) === "Đang mở đăng ký" && (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => register(event.id)}
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No events available or loading...</p>
        )}
      </div>
    </div>
  );
}
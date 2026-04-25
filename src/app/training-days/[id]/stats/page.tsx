"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StatsPage() {
  const { id } = useParams();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/training-days/${id}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [id]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="p-6">
  <h1 className="text-2xl font-bold mb-6">📊 Statistics</h1>

  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="p-4 bg-blue-100 rounded-lg shadow">
      <p className="text-sm">Total</p>
      <p className="text-xl font-bold">{stats.total}</p>
    </div>

    <div className="p-4 bg-green-100 rounded-lg shadow">
      <p className="text-sm">Checked-in</p>
      <p className="text-xl font-bold">{stats.checkedIn}</p>
    </div>

    <div className="p-4 bg-purple-100 rounded-lg shadow">
      <p className="text-sm">Attendance</p>
      <p className="text-xl font-bold">
        {stats.total > 0
          ? ((stats.checkedIn / stats.total) * 100).toFixed(2)
          : 0}%
      </p>
    </div>
  </div>

  <button
    className="bg-green-500 text-white px-4 py-2 rounded"
    onClick={async () => {
      const res = await fetch(`/api/training-days/${id}/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event_${id}_participants.csv`;
      a.click();
    }}
  >
    Export CSV
  </button>
</div>
  );
}
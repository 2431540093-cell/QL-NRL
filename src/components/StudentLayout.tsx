import { ReactNode } from "react";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-600 mb-4">🎓 Student</h2>
          <nav className="space-y-2">
            <a href="/training-days" className="block p-2 hover:bg-blue-50 rounded">
              📅 Sự kiện
            </a>
            <a href="/student" className="block p-2 hover:bg-blue-50 rounded">
              👤 Cá nhân
            </a>
          </nav>
          <div className="mt-8 pt-4 border-t">
            <button
              onClick={async () => {
                await fetch("/api/auth/me", { method: "DELETE" });
                window.location.href = "/login";
              }}
              className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
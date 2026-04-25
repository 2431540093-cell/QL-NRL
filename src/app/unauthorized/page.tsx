export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
        <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
      </div>
    </div>
  );
}
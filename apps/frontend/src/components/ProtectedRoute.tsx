import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useSessionStore } from "@/lib/session";

export default function ProtectedRoute() {
  const { isLoading, isSuccess } = useAuthCheck();
  const isGuest = useSessionStore((s) => s.isGuest);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-muted text-sm animate-pulse">
          Verifying identity...
        </div>
      </div>
    );
  }

  if (!isSuccess || isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

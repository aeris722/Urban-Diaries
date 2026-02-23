import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full grid place-items-center bg-[#faf9f6] text-[#44403c]">
        <p className="text-sm tracking-wide uppercase text-[#78716c]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

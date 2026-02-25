import { Navigate } from "react-router";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full px-6 py-10 bg-[#faf9f6]">
        <div className="mx-auto max-w-5xl space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-[70vh] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

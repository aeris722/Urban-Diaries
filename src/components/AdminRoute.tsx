import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Skeleton } from "./ui/skeleton";

const adminClaimCache = new Map<string, boolean>();

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setIsAdmin(false);
      return () => {
        isActive = false;
      };
    }

    const cached = adminClaimCache.get(user.uid);
    if (typeof cached === "boolean") {
      setIsAdmin(cached);
      return () => {
        isActive = false;
      };
    }

    setIsAdmin(null);

    void (async () => {
      try {
        const tokenResult = await user.getIdTokenResult();
        if (!isActive) return;
        const hasAdminClaim = tokenResult.claims.admin === true;
        adminClaimCache.set(user.uid, hasAdminClaim);
        setIsAdmin(hasAdminClaim);
      } catch {
        if (!isActive) return;
        adminClaimCache.set(user.uid, false);
        setIsAdmin(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [user]);

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
    return <Navigate to="/adminashis" replace />;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen w-full px-6 py-10 bg-[#faf9f6]">
        <div className="mx-auto max-w-5xl space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-[70vh] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/adminashis" replace />;
  }

  return <>{children}</>;
}

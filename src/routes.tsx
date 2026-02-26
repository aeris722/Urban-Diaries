import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminAccess = lazy(() => import("./pages/AdminAccess"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function RouteLoader() {
  return (
    <div className="min-h-screen w-full grid place-items-center bg-[#faf9f6] text-[#44403c]">
      <p className="text-sm tracking-wide uppercase text-[#78716c]">Loading...</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<RouteLoader />}>
        <Landing />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<RouteLoader />}>
          <Dashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/adminashis",
    element: (
      <Suspense fallback={<RouteLoader />}>
        <AdminAccess />
      </Suspense>
    ),
  },
  {
    path: "/admin-dashboard",
    element: (
      <AdminRoute>
        <Suspense fallback={<RouteLoader />}>
          <AdminDashboard />
        </Suspense>
      </AdminRoute>
    ),
  },
]);

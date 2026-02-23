import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

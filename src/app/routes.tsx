import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
]);

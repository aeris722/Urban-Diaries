import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { UrbanDiariesLogo } from "../components/brand/UrbanDiariesLogo";
import { useAuth } from "../hooks/useAuth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

  return (
    <div className="page-fade-in min-h-screen w-full bg-[#fdfbf7] px-6 py-10 text-[#44403c]">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
        <UrbanDiariesLogo
          size={30}
          className="mb-4 flex items-center gap-2.5"
          textClassName="text-lg font-semibold tracking-tight italic"
        />
        <h1 className="font-serif text-3xl italic text-[#292524]">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-[#78716c]">
          Admin claim is active for: <span className="font-medium text-[#44403c]">{user?.email}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="rounded-xl border-[#d6d3d1]"
          >
            Back to main dashboard
          </Button>
          <Button
            onClick={() => logOut()}
            className="rounded-xl bg-[#44403c] text-[#faf9f6] hover:bg-[#292524]"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}


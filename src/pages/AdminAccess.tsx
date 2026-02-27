import type { FormEvent } from "react";
import { useState } from "react";
import type { User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UrbanDiariesLogo } from "../components/brand/UrbanDiariesLogo";
import { useAuth } from "../hooks/useAuth";
import { functions } from "../services/firebase";

type VerifyAdminPasswordRequest = {
  password: string;
};

type VerifyAdminPasswordResponse = {
  success: boolean;
};

function resolveFunctionErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code.includes("permission-denied")) return "Incorrect password or unauthorized account.";
    if (code.includes("unauthenticated")) return "Sign in with Google before requesting admin access.";
    if (code.includes("invalid-argument")) return "Enter your admin password.";
  }

  if (error instanceof Error) return error.message;
  return "Admin verification failed. Try again.";
}

async function refreshAdminClaim(user: User) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true) return;
    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }

  throw new Error("Admin claim is not ready yet. Please retry.");
}

export default function AdminAccess() {
  const navigate = useNavigate();
  const { user, loading, authError, clearAuthError, logInWithGoogle } = useAuth();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    clearAuthError();
    setError(null);
    setIsSubmitting(true);
    try {
      await logInWithGoogle();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAuthError();
    setError(null);

    if (!user) {
      setError("Sign in with Google before entering the admin password.");
      return;
    }

    if (!password.trim()) {
      setError("Enter your admin password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const verifyAdminPassword = httpsCallable<
        VerifyAdminPasswordRequest,
        VerifyAdminPasswordResponse
      >(functions, "verifyAdminPassword");

      const result = await verifyAdminPassword({ password });
      if (!result.data.success) {
        throw new Error("Admin verification failed.");
      }

      await refreshAdminClaim(user);
      setPassword("");
      navigate("/admin-dashboard", { replace: true });
    } catch (caught) {
      setError(resolveFunctionErrorMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in min-h-screen w-full bg-[#faf9f6] px-6 py-12 text-[#44403c]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-md rounded-3xl border border-[#e7e5e4] bg-white/90 p-6 shadow-sm"
      >
        <UrbanDiariesLogo
          size={30}
          className="mb-4 flex items-center gap-2.5"
          textClassName="text-lg font-semibold tracking-tight italic"
        />
        <h1 className="font-serif text-2xl italic text-[#292524]">Admin Access</h1>
        <p className="mt-2 text-sm text-[#78716c]">
          Sign in with Google, then enter your private admin password.
        </p>

        <div className="mt-4 rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-3 text-xs text-[#57534e]">
          {loading ? "Checking sign-in status..." : user ? `Signed in as ${user.email}` : "Not signed in"}
        </div>

        {!user ? (
          <Button
            onClick={signIn}
            disabled={isSubmitting || loading}
            className="mt-4 w-full rounded-xl bg-[#44403c] text-[#faf9f6] hover:bg-[#292524]"
          >
            Sign in with Google
          </Button>
        ) : (
          <form onSubmit={verifyPassword} className="mt-4 space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              className="rounded-xl border-[#d6d3d1]"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full rounded-xl bg-[#44403c] text-[#faf9f6] hover:bg-[#292524]"
            >
              Verify and continue
            </Button>
          </form>
        )}

        {error || authError ? (
          <p className="mt-3 text-xs text-red-600">{error ?? authError}</p>
        ) : null}
      </motion.div>
    </div>
  );
}


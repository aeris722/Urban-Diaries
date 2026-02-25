import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: string | null;
  logInWithGoogle: () => Promise<void>;
  logInWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailPassword: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isGmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@gmail.com"));
}

function isPasswordProvider(user: User) {
  return user.providerData.some((provider) => provider.providerId === "password");
}

async function upsertUserRecord(user: User, provider: "google" | "password") {
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email ?? null,
      provider,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Token-backed guard: signed-in password users must verify ownership first.
      if (isPasswordProvider(nextUser) && !nextUser.emailVerified) {
        await signOut(auth);
        setAuthError("Verify your email first before logging in.");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      if (!isGmail(result.user.email)) {
        await signOut(auth);
        throw new Error("Only Gmail Google accounts are allowed.");
      }

      await upsertUserRecord(result.user, "google");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed.";
      setAuthError(message);
      throw error;
    }
  }, []);

  const logInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!result.user.emailVerified) {
        await signOut(auth);
        throw new Error("Email not verified. Check your inbox and verify first.");
      }

      if (!isGmail(result.user.email)) {
        await signOut(auth);
        throw new Error("Only Gmail accounts are allowed.");
      }

      await upsertUserRecord(result.user, "password");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email login failed.";
      setAuthError(message);
      throw error;
    }
  }, []);

  // Kept for secure password onboarding if you add a dedicated registration page later.
  const registerWithEmailPassword = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(result.user);
      await signOut(auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      setAuthError(message);
      throw error;
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authError,
      logInWithGoogle,
      logInWithEmailPassword,
      registerWithEmailPassword,
      logOut,
      clearAuthError,
    }),
    [
      user,
      loading,
      authError,
      logInWithGoogle,
      logInWithEmailPassword,
      registerWithEmailPassword,
      logOut,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

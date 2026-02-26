import {
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../services/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: string | null;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isGoogleProviderUser(user: User) {
  return user.providerData.some((provider) => provider.providerId === "google.com");
}

async function upsertUserRecord(user: User) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email ?? null,
      provider: "google",
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void setPersistence(auth, browserLocalPersistence).catch(() => {
      // Continue even if persistence setup fails.
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      void (async () => {
        try {
          if (!nextUser) {
            if (!active) return;
            setUser(null);
            return;
          }

          // Block legacy auth providers so the app remains Google-only.
          if (!isGoogleProviderUser(nextUser)) {
            await signOut(auth);
            if (!active) return;
            setAuthError("Only Google sign-in is allowed.");
            setUser(null);
            return;
          }

          await upsertUserRecord(nextUser);
          if (!active) return;
          setUser(nextUser);
        } catch (error) {
          if (!active) return;
          const message = error instanceof Error ? error.message : "Authentication check failed.";
          setAuthError(message);
          setUser(null);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const logInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await upsertUserRecord(result.user);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
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
      logOut,
      clearAuthError,
    }),
    [
      user,
      loading,
      authError,
      logInWithGoogle,
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

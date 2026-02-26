import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { DiaryEntry } from "../utils/journal";

const LOCAL_SESSION_KEY = "urban_diaries_last_session";
const DEFAULT_TITLE = "Untitled Entry";

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function mapEntry(id: string, data: Record<string, unknown>): DiaryEntry {
  return {
    id,
    title: typeof data.title === "string" && data.title.trim() ? data.title : DEFAULT_TITLE,
    content: typeof data.content === "string" ? data.content : "",
    mood: typeof data.mood === "string" ? data.mood : "",
    temperature: typeof data.temperature === "number" ? data.temperature : null,
    location: typeof data.location === "string" ? data.location : "",
    images: Array.isArray(data.images) ? data.images.filter((item): item is string => typeof item === "string") : [],
    dateCreated: toMillis(data.dateCreated),
    lastEdited: toMillis(data.lastEdited),
    editVersion: typeof data.editVersion === "number" ? data.editVersion : 0,
  };
}

function readRememberedSession(uid: string): string | null {
  try {
    return localStorage.getItem(`${LOCAL_SESSION_KEY}:${uid}`);
  } catch {
    return null;
  }
}

function rememberSession(uid: string, sessionId: string) {
  try {
    localStorage.setItem(`${LOCAL_SESSION_KEY}:${uid}`, sessionId);
  } catch {
    // ignore storage failures
  }
}

export function useSessions(uid: string | undefined) {
  const [sessions, setSessions] = useState<DiaryEntry[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const preferredSessionIdRef = useRef<string | null>(null);
  const createInFlightRef = useRef<Promise<string | null> | null>(null);

  const createSession = useCallback(async () => {
    if (!uid) return null;
    if (createInFlightRef.current) {
      return createInFlightRef.current;
    }

    const pending = (async () => {
      setIsCreating(true);
      try {
        const id = crypto.randomUUID();
        const entryRef = doc(db, "users", uid, "diaryEntries", id);
        await setDoc(entryRef, {
          id,
          title: DEFAULT_TITLE,
          content: "",
          dateCreated: serverTimestamp(),
          lastEdited: serverTimestamp(),
          mood: "",
          temperature: null,
          location: "",
          images: [],
          editVersion: 0,
        });

        setActiveSessionId(id);
        rememberSession(uid, id);
        await setDoc(
          doc(db, "users", uid),
          {
            lastOpenedSessionId: id,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        return id;
      } catch {
        return null;
      } finally {
        setIsCreating(false);
      }
    })();

    createInFlightRef.current = pending;
    try {
      return await pending;
    } finally {
      if (createInFlightRef.current === pending) {
        createInFlightRef.current = null;
      }
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setSessions([]);
      setActiveSessionId(null);
      setIsLoading(false);
      preferredSessionIdRef.current = null;
      createInFlightRef.current = null;
      return;
    }

    preferredSessionIdRef.current = readRememberedSession(uid);
    setIsLoading(true);
    setSessions([]);
    setActiveSessionId(null);

    let isDisposed = false;
    let unsubscribe: (() => void) | undefined;

    const bootstrap = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (isDisposed) return;
        const data = userDoc.data() as { lastOpenedSessionId?: unknown } | undefined;
        if (!preferredSessionIdRef.current && typeof data?.lastOpenedSessionId === "string") {
          preferredSessionIdRef.current = data.lastOpenedSessionId;
        }
      } catch {
        // ignore profile-read failures and continue with realtime sessions
      }

      if (isDisposed) return;

      const sessionsQuery = query(
        collection(db, "users", uid, "diaryEntries"),
        orderBy("lastEdited", "desc"),
      );

      unsubscribe = onSnapshot(
        sessionsQuery,
        (snapshot) => {
          const nextSessions = snapshot.docs.map((item) =>
            mapEntry(item.id, item.data() as Record<string, unknown>),
          );

          setSessions(nextSessions);
          setIsLoading(false);

          if (nextSessions.length === 0) {
            setActiveSessionId(null);

            const shouldCreateDefault = !snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites;
            if (shouldCreateDefault) {
              void createSession();
            }
            return;
          }

          setActiveSessionId((prev) => {
            if (prev && nextSessions.some((entry) => entry.id === prev)) {
              return prev;
            }

            const preferredId = preferredSessionIdRef.current;
            if (preferredId && nextSessions.some((entry) => entry.id === preferredId)) {
              preferredSessionIdRef.current = null;
              return preferredId;
            }

            preferredSessionIdRef.current = null;
            return nextSessions[0].id;
          });
        },
        () => {
          setIsLoading(false);
        },
      );
    };

    void bootstrap();

    return () => {
      isDisposed = true;
      unsubscribe?.();
    };
  }, [createSession, uid]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!uid) return null;
      try {
        await deleteDoc(doc(db, "users", uid, "diaryEntries", sessionId));
      } catch {
        return activeSessionId;
      }

      if (activeSessionId && activeSessionId !== sessionId) {
        return activeSessionId;
      }

      const fallback = sessions.find((entry) => entry.id !== sessionId)?.id ?? null;
      if (fallback) {
        setActiveSessionId(fallback);
        rememberSession(uid, fallback);
        return fallback;
      }

      setActiveSessionId(null);
      return null;
    },
    [activeSessionId, sessions, uid],
  );

  useEffect(() => {
    if (!uid || !activeSessionId) return;
    rememberSession(uid, activeSessionId);
    void setDoc(
      doc(db, "users", uid),
      {
        lastOpenedSessionId: activeSessionId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch(() => {
      // Ignore profile sync failures.
    });
  }, [activeSessionId, uid]);

  const activeSession = useMemo(
    () => sessions.find((item) => item.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  );

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    selectSession,
    createSession,
    deleteSession,
    isLoading,
    isCreating,
  };
}

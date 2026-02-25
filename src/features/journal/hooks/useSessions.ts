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
import { db } from "../../../app/lib/firebase";
import type { DiaryEntry } from "../types/journal";

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
  const hasBootstrappedRef = useRef(false);
  const rememberedFromProfileRef = useRef<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setSessions([]);
      setActiveSessionId(null);
      setIsLoading(false);
      hasBootstrappedRef.current = false;
      rememberedFromProfileRef.current = null;
      return;
    }

    hasBootstrappedRef.current = false;
    setIsLoading(true);

    void getDoc(doc(db, "users", uid)).then((snapshot) => {
      const data = snapshot.data() as { lastOpenedSessionId?: unknown } | undefined;
      rememberedFromProfileRef.current =
        typeof data?.lastOpenedSessionId === "string" ? data.lastOpenedSessionId : null;
    });

    const sessionsQuery = query(
      collection(db, "users", uid, "diaryEntries"),
      orderBy("lastEdited", "desc"),
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const nextSessions = snapshot.docs.map((item) =>
          mapEntry(item.id, item.data() as Record<string, unknown>),
        );

        setSessions(nextSessions);
        setIsLoading(false);

        if (!hasBootstrappedRef.current) {
          hasBootstrappedRef.current = true;
          const localRemembered = readRememberedSession(uid);
          const preferredId = localRemembered ?? rememberedFromProfileRef.current;
          const rememberedExists = nextSessions.some((entry) => entry.id === preferredId);
          if (preferredId && rememberedExists) {
            setActiveSessionId(preferredId);
            return;
          }
          if (nextSessions[0]) {
            setActiveSessionId(nextSessions[0].id);
          }
          return;
        }

        if (nextSessions.length === 0) {
          setActiveSessionId(null);
          return;
        }

        setActiveSessionId((prev) => {
          if (prev && nextSessions.some((entry) => entry.id === prev)) {
            return prev;
          }
          return nextSessions[0].id;
        });
      },
      () => {
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  const createSession = useCallback(async () => {
    if (!uid || isCreating) return null;
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
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, uid]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!uid) return null;
      await deleteDoc(doc(db, "users", uid, "diaryEntries", sessionId));

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
      return createSession();
    },
    [activeSessionId, createSession, sessions, uid],
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
    );
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

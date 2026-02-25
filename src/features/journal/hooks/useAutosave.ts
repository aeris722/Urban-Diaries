import { useEffect, useRef } from "react";
import { doc, runTransaction, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../../app/lib/firebase";
import type { SaveStatus, SessionDraft } from "../types/journal";

type UseAutosaveParams = {
  uid: string | undefined;
  sessionId: string | null;
  draft: SessionDraft;
  enabled: boolean;
  onStatusChange: (status: SaveStatus) => void;
};

const DEBOUNCE_MS = 1500;

async function persistDraft(uid: string, sessionId: string, draft: SessionDraft) {
  const sessionRef = doc(db, "users", uid, "diaryEntries", sessionId);
  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(sessionRef);
    const persistedVersion = Number(current.data()?.editVersion ?? -1);
    if (persistedVersion >= draft.editVersion) {
      return;
    }

    transaction.set(
      sessionRef,
      {
        title: draft.title,
        content: draft.content,
        mood: draft.mood,
        location: draft.location,
        temperature: draft.temperature,
        images: draft.images,
        editVersion: draft.editVersion,
        lastEdited: serverTimestamp(),
      },
      { merge: true },
    );
  });

  batch.set(
    userRef,
    {
      lastOpenedSessionId: sessionId,
      lastEditedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
}

export function useAutosave({
  uid,
  sessionId,
  draft,
  enabled,
  onStatusChange,
}: UseAutosaveParams) {
  const timeoutRef = useRef<number | null>(null);
  const lastPayloadBySessionRef = useRef<Record<string, string>>({});
  const inFlightRef = useRef<Set<string>>(new Set());
  const inFlightPromiseRef = useRef<Record<string, Promise<void>>>({});
  const latestRef = useRef<{ uid?: string; sessionId: string | null; draft: SessionDraft; enabled: boolean }>({
    uid,
    sessionId,
    draft,
    enabled,
  });

  latestRef.current = { uid, sessionId, draft, enabled };

  const flushPendingSave = async () => {
    const current = latestRef.current;
    if (!current.enabled || !current.uid || !current.sessionId) return;

    const payload = JSON.stringify(current.draft);
    const key = `${current.uid}:${current.sessionId}`;
    if (payload === lastPayloadBySessionRef.current[key] || inFlightRef.current.has(key)) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    onStatusChange("saving");
    try {
      inFlightRef.current.add(key);
      const savePromise = persistDraft(current.uid, current.sessionId, current.draft);
      inFlightPromiseRef.current[key] = savePromise;
      await savePromise;
      lastPayloadBySessionRef.current[key] = payload;
      onStatusChange("saved");
    } catch {
      onStatusChange("error");
    } finally {
      inFlightRef.current.delete(key);
      delete inFlightPromiseRef.current[key];
    }
  };

  const cancelPendingSave = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const waitForIdle = async (targetSessionId: string | null) => {
    if (!targetSessionId || !uid) return;
    const key = `${uid}:${targetSessionId}`;
    const inFlight = inFlightPromiseRef.current[key];
    if (inFlight) {
      await inFlight;
    }
  };

  useEffect(() => {
    if (!enabled || !uid || !sessionId) return;

    const payload = JSON.stringify(draft);
    const key = `${uid}:${sessionId}`;
    if (payload === lastPayloadBySessionRef.current[key] || inFlightRef.current.has(key)) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    onStatusChange("saving");

    timeoutRef.current = window.setTimeout(async () => {
      try {
        inFlightRef.current.add(key);
        const savePromise = persistDraft(uid, sessionId, draft);
        inFlightPromiseRef.current[key] = savePromise;
        await savePromise;
        lastPayloadBySessionRef.current[key] = payload;
        onStatusChange("saved");
      } catch {
        onStatusChange("error");
      } finally {
        inFlightRef.current.delete(key);
        delete inFlightPromiseRef.current[key];
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelPendingSave();
    };
  }, [draft, enabled, onStatusChange, sessionId, uid]);

  return { flushPendingSave, cancelPendingSave, waitForIdle };
}

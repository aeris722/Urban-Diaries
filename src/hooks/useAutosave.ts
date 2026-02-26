import { useEffect, useRef } from "react";
import { doc, runTransaction, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../services/firebase";
import type { SaveStatus, SessionDraft } from "../utils/journal";

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
  const lastSavedVersionRef = useRef<Record<string, number>>({});
  const inFlightVersionRef = useRef<Record<string, number>>({});
  const inFlightPromiseRef = useRef<Record<string, Promise<void>>>({});
  const latestRef = useRef<{ uid?: string; sessionId: string | null; draft: SessionDraft; enabled: boolean }>({
    uid,
    sessionId,
    draft,
    enabled,
  });

  latestRef.current = { uid, sessionId, draft, enabled };

  const shouldSkipVersion = (key: string, version: number) => {
    const lastSavedVersion = lastSavedVersionRef.current[key] ?? -1;
    const inFlightVersion = inFlightVersionRef.current[key];
    return version <= lastSavedVersion || inFlightVersion === version;
  };

  const saveNow = async (
    nextUid: string,
    nextSessionId: string,
    nextDraft: SessionDraft,
    key: string,
    version: number,
  ) => {
    onStatusChange("saving");
    try {
      inFlightVersionRef.current[key] = version;
      const savePromise = persistDraft(nextUid, nextSessionId, nextDraft);
      inFlightPromiseRef.current[key] = savePromise;
      await savePromise;
      lastSavedVersionRef.current[key] = Math.max(lastSavedVersionRef.current[key] ?? -1, version);
      onStatusChange("saved");
    } catch {
      onStatusChange("error");
    } finally {
      if (inFlightVersionRef.current[key] === version) {
        delete inFlightVersionRef.current[key];
      }
      delete inFlightPromiseRef.current[key];
    }
  };

  const flushPendingSave = async () => {
    const current = latestRef.current;
    if (!current.enabled || !current.uid || !current.sessionId) return;

    const version = current.draft.editVersion;
    const key = `${current.uid}:${current.sessionId}`;
    if (shouldSkipVersion(key, version)) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await saveNow(current.uid, current.sessionId, current.draft, key, version);
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

    const version = draft.editVersion;
    const key = `${uid}:${sessionId}`;
    if (shouldSkipVersion(key, version)) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    onStatusChange("saving");

    timeoutRef.current = window.setTimeout(() => {
      void saveNow(uid, sessionId, draft, key, version);
    }, DEBOUNCE_MS);

    return () => {
      cancelPendingSave();
    };
  }, [draft, enabled, onStatusChange, sessionId, uid]);

  return { flushPendingSave, cancelPendingSave, waitForIdle };
}

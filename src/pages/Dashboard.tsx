import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { Skeleton } from "../components/ui/skeleton";
import { Navbar } from "../components/Navbar";
import { MetadataBar } from "../components/journal/MetadataBar";
import { SessionSidebar } from "../components/journal/SessionSidebar";
import { useAuth } from "../hooks/useAuth";
import { useAutosave } from "../hooks/useAutosave";
import { useSessions } from "../hooks/useSessions";
import { useUserWeather } from "../hooks/useUserWeather";
import type { SaveStatus, SessionDraft } from "../utils/journal";

const LazyRichEditor = lazy(async () => {
  const module = await import("../components/journal/RichEditor");
  return { default: module.RichEditor };
});

const emptyDraft: SessionDraft = {
  title: "Untitled Entry",
  content: "",
  mood: "",
  temperature: null,
  location: "",
  images: [],
  editVersion: 0,
};

function statusLabel(status: SaveStatus): string {
  if (status === "saving") return "Saving...";
  if (status === "saved") return "Saved";
  if (status === "error") return "Save failed";
  return "Idle";
}

function extractImageSources(content: string): string[] {
  if (!content.includes("<img")) return [];
  return Array.from(content.matchAll(/<img[^>]+src=(['"])(.*?)\1/gi), (match) => match[2]).filter(Boolean);
}

function arraysEqual(left: string[], right: string[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

export default function Dashboard() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    sessions,
    activeSession,
    activeSessionId,
    selectSession,
    createSession,
    deleteSession,
    isLoading: sessionsLoading,
    isCreating,
  } = useSessions(uid);

  const { locationName, temperature, icon, isLoading: weatherLoading } = useUserWeather();

  const [draft, setDraft] = useState<SessionDraft>(emptyDraft);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDraftReady, setIsDraftReady] = useState(false);
  const draftBufferRef = useRef<Record<string, SessionDraft>>({});
  const appliedUrlSessionIdRef = useRef<string | null>(null);
  const lastImageSignatureRef = useRef("");
  const sessionIdFromUrl = searchParams.get("session");

  useEffect(() => {
    if (!sessionIdFromUrl) {
      appliedUrlSessionIdRef.current = null;
      return;
    }

    if (sessionIdFromUrl === appliedUrlSessionIdRef.current) return;
    if (!sessions.some((session) => session.id === sessionIdFromUrl)) return;

    appliedUrlSessionIdRef.current = sessionIdFromUrl;
    if (sessionIdFromUrl !== activeSessionId) {
      selectSession(sessionIdFromUrl);
      setSaveStatus("idle");
    }
  }, [activeSessionId, selectSession, sessionIdFromUrl, sessions]);

  useEffect(() => {
    if (!activeSessionId) {
      if (!sessionIdFromUrl) return;
      if (sessionsLoading || sessions.length > 0) return;
      const next = new URLSearchParams(searchParams);
      next.delete("session");
      setSearchParams(next, { replace: true });
      return;
    }

    if (sessionIdFromUrl === activeSessionId) return;
    const next = new URLSearchParams(searchParams);
    next.set("session", activeSessionId);
    setSearchParams(next, { replace: true });
  }, [activeSessionId, searchParams, sessionIdFromUrl, sessions.length, sessionsLoading, setSearchParams]);

  useEffect(() => {
    if (!activeSessionId) {
      setDraft(emptyDraft);
      setIsDraftReady(false);
      lastImageSignatureRef.current = "";
      return;
    }

    if (!activeSession) {
      setDraft(emptyDraft);
      setIsDraftReady(false);
      lastImageSignatureRef.current = "";
      return;
    }

    const buffered = draftBufferRef.current[activeSessionId];
    const shouldUseBuffered = Boolean(buffered) && buffered.editVersion >= activeSession.editVersion;
    const hydrated: SessionDraft = shouldUseBuffered
      ? buffered
      : {
          title: activeSession.title,
          content: activeSession.content,
          mood: activeSession.mood,
          temperature: activeSession.temperature,
          location: activeSession.location,
          images: activeSession.images,
          editVersion: activeSession.editVersion,
        };

    setDraft(hydrated);
    draftBufferRef.current[activeSessionId] = hydrated;
    lastImageSignatureRef.current = hydrated.images.join("|");
    setIsDraftReady(true);
  }, [activeSession, activeSessionId]);

  useEffect(() => {
    if (!activeSessionId || !isDraftReady) return;
    setDraft((prev) => {
      const nextLocation = prev.location.trim() ? prev.location : locationName;
      const nextTemperature = prev.temperature ?? temperature;
      if (nextLocation === prev.location && nextTemperature === prev.temperature) {
        return prev;
      }
      return {
        ...prev,
        location: nextLocation,
        temperature: nextTemperature,
        editVersion: prev.editVersion + 1,
      };
    });
  }, [activeSessionId, isDraftReady, locationName, temperature]);

  const updateDraft = useCallback(
    (next: Partial<Omit<SessionDraft, "editVersion">>) => {
      if (!activeSessionId || !isDraftReady) return;
      setDraft((prev) => {
        const hasChange = Object.entries(next).some(([key, value]) => {
          const current = prev[key as keyof SessionDraft];
          if (Array.isArray(current) && Array.isArray(value)) {
            return !arraysEqual(current, value);
          }
          return current !== value;
        });

        if (!hasChange) return prev;
        return { ...prev, ...next, editVersion: prev.editVersion + 1 };
      });
    },
    [activeSessionId, isDraftReady],
  );

  useEffect(() => {
    if (!activeSessionId || !isDraftReady) return;
    draftBufferRef.current[activeSessionId] = draft;
  }, [activeSessionId, draft, isDraftReady]);

  const onEditorContentChange = useCallback(
    (content: string) => {
      if (!isDraftReady) return;
      const nextImages = extractImageSources(content);
      const nextSignature = nextImages.join("|");
      const imagesChanged = nextSignature !== lastImageSignatureRef.current;
      if (imagesChanged) {
        lastImageSignatureRef.current = nextSignature;
      }
      updateDraft(imagesChanged ? { content, images: nextImages } : { content });
    },
    [isDraftReady, updateDraft],
  );

  const { flushPendingSave, cancelPendingSave, waitForIdle } = useAutosave({
    uid,
    sessionId: activeSessionId,
    draft,
    enabled: Boolean(activeSessionId && isDraftReady),
    onStatusChange: setSaveStatus,
  });

  const onSessionSelect = useCallback(
    (sessionId: string) => {
      void (async () => {
        try {
          setActionError(null);
          if (sessionId === activeSessionId) {
            setIsSidebarOpen(false);
            return;
          }
          if (isDraftReady) {
            await flushPendingSave();
          }
          selectSession(sessionId);
          setSaveStatus("idle");
          setIsSidebarOpen(false);
        } catch (error) {
          setSaveStatus("error");
          setActionError(error instanceof Error ? error.message : "Unable to switch session.");
        }
      })();
    },
    [activeSessionId, flushPendingSave, isDraftReady, selectSession],
  );

  const onSessionCreate = useCallback(async () => {
    try {
      setActionError(null);
      if (isDraftReady) {
        await flushPendingSave();
      }
      const createdId = await createSession();
      setSaveStatus("idle");
      setIsSidebarOpen(false);
      return createdId;
    } catch (error) {
      setSaveStatus("error");
      setActionError(error instanceof Error ? error.message : "Unable to create session.");
      return null;
    }
  }, [createSession, flushPendingSave, isDraftReady]);

  const onSessionDelete = useCallback(
    (sessionId: string) => {
      void (async () => {
        try {
          setActionError(null);
          const confirmed = window.confirm(
            "Are you sure you want to delete this diary entry? This action cannot be undone.",
          );
          if (!confirmed) return;

          if (sessionId === activeSessionId) {
            cancelPendingSave();
            await waitForIdle(sessionId);
          }

          delete draftBufferRef.current[sessionId];
          await deleteSession(sessionId);
          setSaveStatus("idle");
        } catch (error) {
          setSaveStatus("error");
          setActionError(error instanceof Error ? error.message : "Unable to delete session.");
        }
      })();
    },
    [activeSessionId, cancelPendingSave, deleteSession, waitForIdle],
  );

  const saveStateText = useMemo(() => statusLabel(saveStatus), [saveStatus]);

  return (
    <div className="min-h-screen w-full bg-[#fdfbf7] text-[#44403c] selection:bg-[#fde68a]/50 selection:text-[#451a03]">
      <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

      <div
        className={`fixed inset-0 z-40 bg-black/25 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={onSessionSelect}
        onDelete={onSessionDelete}
        onCreate={onSessionCreate}
        isLoading={sessionsLoading}
        isCreating={isCreating}
        className={`fixed left-3 top-[84px] z-50 h-[calc(100vh-96px)] transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 lg:px-6 lg:py-6">
        <main className="min-w-0 rounded-3xl border border-[#e7e5e4] bg-white/55 p-4 backdrop-blur-xl lg:p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                disabled={!isDraftReady}
                placeholder="Untitled Entry"
                className="w-full max-w-[520px] rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-xl font-serif italic outline-none focus:border-[#a8a29e]"
              />
              <span className={`text-xs uppercase tracking-wider ${saveStatus === "error" ? "text-red-600" : "text-[#78716c]"}`}>
                {saveStateText}
              </span>
            </div>

            <MetadataBar
              locationName={weatherLoading ? "Detecting location..." : locationName}
              temperature={temperature}
              weatherIconName={icon}
              location={draft.location}
              onLocationChange={(location) => updateDraft({ location })}
              temperatureValue={draft.temperature}
              onTemperatureChange={(value) => updateDraft({ temperature: value })}
              mood={draft.mood}
              onMoodSelect={(mood) => updateDraft({ mood })}
            />

            <div className="mt-5 rounded-[2rem] border border-[#ecebe8] bg-[#fcfcfc]/70 p-4 shadow-sm lg:p-8">
              {actionError ? <p className="mb-3 text-xs text-red-600">{actionError}</p> : null}
              <Suspense fallback={<Skeleton className="h-[60vh] w-full rounded-2xl" />}>
                {isDraftReady ? (
                  <LazyRichEditor
                    key={activeSessionId ?? "empty"}
                    initialContent={draft.content}
                    onContentChange={onEditorContentChange}
                  />
                ) : (
                  <Skeleton className="h-[60vh] w-full rounded-2xl" />
                )}
              </Suspense>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { Skeleton } from "../components/ui/skeleton";
import { Navbar } from "../components/Navbar";
import { MetadataBar } from "../../features/journal/components/MetadataBar";
import { SessionSidebar } from "../../features/journal/components/SessionSidebar";
import { useAutosave } from "../../features/journal/hooks/useAutosave";
import { useSessions } from "../../features/journal/hooks/useSessions";
import { useUserWeather } from "../../features/journal/hooks/useUserWeather";
import type { SaveStatus, SessionDraft } from "../../features/journal/types/journal";
import { useAuth } from "../context/AuthContext";

const LazyRichEditor = lazy(async () => {
  const module = await import("../../features/journal/components/RichEditor");
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
  return Array.from(new DOMParser().parseFromString(content, "text/html").querySelectorAll("img"))
    .map((image) => image.getAttribute("src") ?? "")
    .filter(Boolean);
}

export default function Dashboard() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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

  const { locationName, temperature, icon } = useUserWeather();

  const [draft, setDraft] = useState<SessionDraft>(emptyDraft);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const draftBufferRef = useRef<Record<string, SessionDraft>>({});
  const sessionIdFromUrl = searchParams.get("session");

  useEffect(() => {
    if (!sessionsLoading && uid && sessions.length === 0) {
      createSession().catch(() => {
        // keep UI responsive on first load
      });
    }
  }, [createSession, sessions.length, sessionsLoading, uid]);

  useEffect(() => {
    if (!sessionIdFromUrl || !sessions.some((session) => session.id === sessionIdFromUrl)) return;
    if (sessionIdFromUrl !== activeSessionId) {
      selectSession(sessionIdFromUrl);
    }
  }, [activeSessionId, selectSession, sessionIdFromUrl, sessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    if (searchParams.get("session") === activeSessionId) return;
    const next = new URLSearchParams(searchParams);
    next.set("session", activeSessionId);
    setSearchParams(next, { replace: true });
  }, [activeSessionId, searchParams, setSearchParams]);

  useEffect(() => {
    if (!activeSessionId) {
      setDraft(emptyDraft);
      return;
    }

    const buffered = draftBufferRef.current[activeSessionId];
    if (buffered) {
      setDraft(buffered);
      return;
    }

    if (activeSession) {
      const hydrated: SessionDraft = {
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
    }
  }, [activeSession, activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) return;
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
  }, [activeSessionId, locationName, temperature]);

  const updateDraft = useCallback((next: Partial<Omit<SessionDraft, "editVersion">>) => {
    setDraft((prev) => {
      const hasChange = Object.entries(next).some(([key, value]) => {
        const current = prev[key as keyof SessionDraft];
        if (Array.isArray(current) && Array.isArray(value)) {
          return JSON.stringify(current) !== JSON.stringify(value);
        }
        return current !== value;
      });

      if (!hasChange) return prev;
      return { ...prev, ...next, editVersion: prev.editVersion + 1 };
    });
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    draftBufferRef.current[activeSessionId] = draft;
  }, [activeSessionId, draft]);

  const { flushPendingSave, cancelPendingSave, waitForIdle } = useAutosave({
    uid,
    sessionId: activeSessionId,
    draft,
    enabled: Boolean(activeSessionId),
    onStatusChange: setSaveStatus,
  });

  const onSessionSelect = useCallback(
    (sessionId: string) => {
      void (async () => {
        if (sessionId !== activeSessionId) {
          await flushPendingSave();
        }
        selectSession(sessionId);
        const next = new URLSearchParams(searchParams);
        next.set("session", sessionId);
        setSearchParams(next);
        setSaveStatus("idle");
        setIsSidebarOpen(false);
      })();
    },
    [activeSessionId, flushPendingSave, searchParams, selectSession, setSearchParams],
  );

  const onSessionCreate = useCallback(async () => {
    await flushPendingSave();
    const createdId = await createSession();
    if (createdId) {
      const next = new URLSearchParams(searchParams);
      next.set("session", createdId);
      setSearchParams(next);
    }
    setSaveStatus("idle");
    setIsSidebarOpen(false);
    return createdId;
  }, [createSession, flushPendingSave, searchParams, setSearchParams]);

  const onSessionDelete = useCallback(
    (sessionId: string) => {
      void (async () => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this diary entry? This action cannot be undone.",
        );
        if (!confirmed) return;

        if (sessionId === activeSessionId) {
          cancelPendingSave();
          await waitForIdle(sessionId);
        }

        delete draftBufferRef.current[sessionId];
        const nextId = await deleteSession(sessionId);

        if (nextId) {
          const next = new URLSearchParams(searchParams);
          next.set("session", nextId);
          setSearchParams(next);
        }

        setSaveStatus("idle");
      })();
    },
    [activeSessionId, cancelPendingSave, deleteSession, searchParams, setSearchParams, waitForIdle],
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
                placeholder="Untitled Entry"
                className="w-full max-w-[520px] rounded-xl border border-[#e7e5e4] bg-white px-4 py-2 text-xl font-serif italic outline-none focus:border-[#a8a29e]"
              />
              <span className={`text-xs uppercase tracking-wider ${saveStatus === "error" ? "text-red-600" : "text-[#78716c]"}`}>
                {saveStateText}
              </span>
            </div>

            <MetadataBar
              locationName={locationName}
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
              <Suspense fallback={<Skeleton className="h-[60vh] w-full rounded-2xl" />}>
                <LazyRichEditor
                  key={activeSessionId ?? "empty"}
                  initialContent={draft.content}
                  onContentChange={(content) => updateDraft({ content, images: extractImageSources(content) })}
                />
              </Suspense>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

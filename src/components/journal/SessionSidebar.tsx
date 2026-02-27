import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock, Heart, Image as ImageIcon, MapPin, NotebookPen, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import type { DiaryEntry } from "../../utils/journal";

type SessionSidebarProps = {
  sessions: DiaryEntry[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => Promise<unknown>;
  isLoading: boolean;
  isCreating: boolean;
  className?: string;
};

const ROW_HEIGHT_COMFORTABLE = 136;
const ROW_HEIGHT_COMPACT = 88;
const OVERSCAN = 6;

function formatDateAndTime(timestamp: number) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function extractPreview(content: string) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain || "Start writing this entry...";
}

export const SessionSidebar = memo(function SessionSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  onCreate,
  isLoading,
  isCreating,
  className,
}: SessionSidebarProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(520);
  const [isTabletCompact, setIsTabletCompact] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(min-width: 768px) and (max-width: 1100px)");
    const handleChange = () => setIsTabletCompact(media.matches);
    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const rowHeight = isTabletCompact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_COMFORTABLE;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      setHeight(target.clientHeight || 520);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const total = sessions.length * rowHeight;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const visibleCount = Math.ceil(height / rowHeight) + OVERSCAN * 2;
  const end = Math.min(sessions.length, start + visibleCount);
  const visibleItems = useMemo(() => sessions.slice(start, end), [end, sessions, start]);

  return (
    <aside
      className={`w-[320px] md:max-lg:w-[92px] shrink-0 rounded-3xl border border-[#e7e5e4] bg-white/95 backdrop-blur-xl shadow-sm transition-all duration-200 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-2 p-4 border-b border-[#ecebe8]">
        <div className="md:max-lg:hidden">
          <h3 className="text-sm font-semibold text-[#44403c]">Sessions</h3>
          <p className="text-xs text-[#78716c]">{sessions.length} entries</p>
        </div>
        <Button
          size="sm"
          onClick={onCreate}
          disabled={isCreating}
          className="rounded-lg cursor-pointer md:max-lg:h-10 md:max-lg:w-10 md:max-lg:p-0"
          title="Create new entry"
        >
          <Plus size={14} />
          <span className="md:max-lg:hidden">New</span>
        </Button>
      </div>

      <div className="h-[520px] overflow-y-auto" onScroll={handleScroll}>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: isTabletCompact ? 6 : 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={`rounded-2xl ${isTabletCompact ? "h-[70px]" : "h-[118px]"}`}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="h-full grid place-items-center p-5 text-center">
            <div>
              <NotebookPen size={24} className="mx-auto mb-2 text-[#a8a29e]" />
              <p className="text-sm text-[#57534e]">No entries yet</p>
              <p className="mt-1 text-xs text-[#78716c] md:max-lg:hidden">Create your first entry to start reflecting.</p>
            </div>
          </div>
        ) : (
          <div style={{ height: total, position: "relative" }}>
            {visibleItems.map((session, index) => {
              const rowIndex = start + index;
              const top = rowIndex * rowHeight;
              const isActive = session.id === activeSessionId;
              const { date, time } = formatDateAndTime(session.lastEdited);
              const previewText = extractPreview(session.content);
              const mood = session.mood || "No mood";
              const location = session.location || "No location";

              return (
                <div
                  key={session.id}
                  className="absolute left-0 w-full border-b border-[#f1efec] px-3 py-3"
                  style={{ top, height: rowHeight }}
                >
                  <span
                    className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-opacity duration-150 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ background: "var(--accent-ui)" }}
                    aria-hidden="true"
                  />

                  {isTabletCompact ? (
                    <div className="flex h-full flex-col items-center justify-between">
                      <button
                        onClick={() => onSelect(session.id)}
                        className="cursor-pointer grid h-11 w-11 place-items-center rounded-xl border border-[#ece8e1] bg-white text-[#5f544c] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                        title={`${session.title || "Untitled Entry"} (${date} ${time})`}
                        aria-label={`Open ${session.title || "Untitled Entry"}`}
                      >
                        <NotebookPen size={17} strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-md p-1 text-[#a8a29e] hover:bg-[#efe8de] hover:text-[#7c2d12]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(session.id);
                        }}
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => onSelect(session.id)} className="cursor-pointer min-w-0 flex-1 text-left">
                        <p className="inline-flex items-center gap-3 text-xs text-[#8b8179]">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={13} />
                            {date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} />
                            {time}
                          </span>
                        </p>

                        <p className="mt-2 truncate text-sm font-semibold text-[#3f3a35]">{session.title || "Untitled Entry"}</p>

                        <p
                          className="mt-2 text-xs leading-relaxed text-[#6f655d]"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {previewText}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#857970]">
                          <span className="inline-flex items-center gap-1.5">
                            <Heart size={12} />
                            {mood}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={12} />
                            {location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <ImageIcon size={12} />
                            {session.images.length} image{session.images.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="cursor-pointer rounded-md p-1 text-[#a8a29e] hover:bg-[#efe8de] hover:text-[#7c2d12]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(session.id);
                        }}
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
});

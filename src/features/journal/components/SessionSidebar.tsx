import { memo, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { ScrollArea } from "../../../app/components/ui/scroll-area";
import type { DiaryEntry } from "../types/journal";

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

const ROW_HEIGHT = 124;
const OVERSCAN = 6;

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

  const total = sessions.length * ROW_HEIGHT;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(height / ROW_HEIGHT) + OVERSCAN * 2;
  const end = Math.min(sessions.length, start + visibleCount);

  const visibleItems = useMemo(() => sessions.slice(start, end), [end, sessions, start]);

  return (
    <aside className={`w-[320px] shrink-0 rounded-3xl border border-[#e7e5e4] bg-white/95 backdrop-blur-xl shadow-sm ${className ?? ""}`}>
      <div className="flex items-center justify-between p-4 border-b border-[#ecebe8]">
        <div>
          <h3 className="text-sm font-semibold text-[#44403c]">Sessions</h3>
          <p className="text-xs text-[#78716c]">{sessions.length} entries</p>
        </div>
        <Button size="sm" onClick={onCreate} disabled={isCreating} className="rounded-lg">
          <Plus size={14} /> New
        </Button>
      </div>

      <ScrollArea className="h-[520px]" onScrollCapture={(event) => {
        const target = event.currentTarget.querySelector("[data-slot='scroll-area-viewport']") as HTMLElement | null;
        if (!target) return;
        setScrollTop(target.scrollTop);
        setHeight(target.clientHeight || 520);
      }}>
        {isLoading ? (
          <div className="p-4 text-sm text-[#78716c]">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-[#78716c]">No sessions yet.</div>
        ) : (
          <div style={{ height: total, position: "relative" }}>
            {visibleItems.map((session, index) => {
              const rowIndex = start + index;
              const top = rowIndex * ROW_HEIGHT;
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`absolute left-0 w-full border-b border-[#f1efec] px-4 py-3 transition-colors ${
                    isActive ? "bg-[#f7f4ef]" : "hover:bg-[#faf8f4]"
                  }`}
                  style={{ top, height: ROW_HEIGHT }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelect(session.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium text-[#44403c]">{session.title || "Untitled Entry"}</p>
                      <p className="mt-1 truncate text-xs text-[#78716c]">
                        Created: {new Date(session.dateCreated).toLocaleString()}
                      </p>
                      <p className="truncate text-xs text-[#a8a29e]">
                        Last edited: {new Date(session.lastEdited).toLocaleString()}
                      </p>
                      <p className="truncate text-xs text-[#78716c]">
                        Mood: {session.mood || "--"} | Temp: {session.temperature ?? "--"}F | Location: {session.location || "--"}
                      </p>
                    </button>
                    <button
                      type="button"
                      className="rounded-md p-1 text-[#a8a29e] hover:bg-[#efe8de] hover:text-[#7c2d12]"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(session.id);
                      }}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
});

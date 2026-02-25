import { memo, useMemo, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../app/components/ui/dropdown-menu";
import { Input } from "../../../app/components/ui/input";
import { resolveIcon } from "../../../shared/utils/icons";
import type { ActivityOption } from "../types/journal";

type ActivitySelectorProps = {
  value: string | null;
  activities: ActivityOption[];
  onSelect: (activity: string) => void;
  onCreate: (label: string) => Promise<void>;
  disabled?: boolean;
};

export const ActivitySelector = memo(function ActivitySelector({
  value,
  activities,
  onSelect,
  onCreate,
  disabled,
}: ActivitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selected = activities.find((item) => item.label === value) ?? null;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return activities;
    return activities.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [activities, normalizedQuery]);

  const canCreate =
    normalizedQuery.length > 1 &&
    !activities.some((item) => item.label.toLowerCase() === normalizedQuery);

  const createActivity = async () => {
    if (!canCreate || isCreating) return;
    setIsCreating(true);
    try {
      const label = query.trim();
      await onCreate(label);
      onSelect(label);
      setOpen(false);
      setQuery("");
    } finally {
      setIsCreating(false);
    }
  };

  const TriggerIcon = resolveIcon(selected?.icon ?? "Tag");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-12 min-w-[220px] items-center justify-between gap-2 rounded-xl border border-[#e7e5e4] bg-white px-4 text-base text-[#44403c] outline-none transition-colors hover:bg-[#f8f6f2] focus-visible:ring-2 focus-visible:ring-[#d4b690] disabled:opacity-60"
          aria-label="Select activity"
        >
          <span className="flex items-center gap-2 truncate">
            <TriggerIcon size={18} />
            <span className="truncate">{selected?.label ?? "Select activity"}</span>
          </span>
          <ChevronDown size={18} className="text-[#78716c]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="z-50 w-56 border-[#e7e5e4] bg-white p-2 shadow-xl">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#78716c]">Activity</DropdownMenuLabel>

        <div className="p-1" onClick={(event) => event.stopPropagation()}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity..."
            className="h-10"
          />
        </div>

        <div className="max-h-56 overflow-y-auto py-1">
          {filtered.map((activity) => {
            const ItemIcon = resolveIcon(activity.icon);
            return (
              <DropdownMenuItem
                key={activity.id}
                onSelect={() => {
                  onSelect(activity.label);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-between rounded-md px-2 py-2 text-base"
              >
                <span className="flex items-center gap-2">
                  <ItemIcon size={16} />
                  {activity.label}
                </span>
                {activity.label === value ? <Check size={16} /> : null}
              </DropdownMenuItem>
            );
          })}
          {filtered.length === 0 ? <p className="px-2 py-2 text-sm text-[#78716c]">No activity found.</p> : null}
        </div>

        {canCreate ? (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={createActivity}
              disabled={isCreating}
              className="mt-1 inline-flex h-10 w-full items-center justify-center gap-1 rounded-md border border-[#e7e5e4] bg-white px-4 text-sm hover:bg-[#f9f7f3]"
            >
              <Plus size={14} /> Add "{query.trim()}"
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

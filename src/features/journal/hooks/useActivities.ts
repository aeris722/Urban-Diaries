import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../app/lib/firebase";
import type { ActivityOption } from "../types/journal";

const defaultActivities: ActivityOption[] = [
  { id: "study", label: "Study", icon: "BookOpen" },
  { id: "sports", label: "Sports", icon: "Dumbbell" },
  { id: "school", label: "School", icon: "GraduationCap" },
  { id: "self-care", label: "Self-care", icon: "Sparkles" },
  { id: "vacation", label: "Vacation", icon: "Palmtree" },
  { id: "reading", label: "Reading", icon: "Library" },
  { id: "coding", label: "Coding", icon: "Code2" },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export function useActivities(uid: string | undefined) {
  const [customActivities, setCustomActivities] = useState<ActivityOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setCustomActivities([]);
      setIsLoading(false);
      return;
    }

    const preferencesRef = doc(db, "users", uid, "preferences", "activities");
    const unsubscribe = onSnapshot(
      preferencesRef,
      (snapshot) => {
        const data = snapshot.data() as { customActivities?: ActivityOption[] } | undefined;
        const list = Array.isArray(data?.customActivities)
          ? data!.customActivities.filter(
              (item): item is ActivityOption =>
                !!item && typeof item.id === "string" && typeof item.label === "string" && typeof item.icon === "string",
            )
          : [];

        setCustomActivities(list.map((item) => ({ ...item, isCustom: true })));
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  const addCustomActivity = useCallback(
    async (label: string) => {
      if (!uid) return;
      const trimmed = label.trim();
      if (!trimmed) return;

      const id = slugify(trimmed);
      const normalized = trimmed.toLowerCase();
      const exists = [...defaultActivities, ...customActivities].some(
        (item) => item.label.toLowerCase() === normalized,
      );
      if (exists) return;

      const nextCustom = [
        ...customActivities,
        {
          id,
          label: trimmed,
          icon: "Tag",
          isCustom: true,
        },
      ];

      setCustomActivities(nextCustom);

      await setDoc(
        doc(db, "users", uid, "preferences", "activities"),
        {
          customActivities: nextCustom,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    },
    [customActivities, uid],
  );

  const activities = useMemo(
    () => [...defaultActivities, ...customActivities],
    [customActivities],
  );

  return {
    activities,
    customActivities,
    addCustomActivity,
    isLoading,
  };
}

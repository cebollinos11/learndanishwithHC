import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nextReviewDate } from "../engine/srs";

export interface SrsEntry {
  box: number; // Leitner box, 0 = just learned
  nextReviewAt: string; // ISO date
}

interface ProgressState {
  knownWordIds: number[];
  srs: Record<number, SrsEntry>;
  currentTale: string | null;
  seeded: boolean;
  initSeed: (ids: number[]) => void;
  markKnown: (id: number) => void;
  markUnknown: (id: number) => void;
  reviewCorrect: (id: number) => void;
  setCurrentTale: (tale: string | null) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      knownWordIds: [],
      srs: {},
      currentTale: null,
      seeded: false,
      initSeed: (ids) => {
        if (get().seeded) return;
        set({ knownWordIds: Array.from(new Set(ids)), seeded: true });
      },
      markKnown: (id) => {
        if (get().knownWordIds.includes(id)) return;
        set((state) => ({
          knownWordIds: [...state.knownWordIds, id],
          srs: { ...state.srs, [id]: { box: 0, nextReviewAt: nextReviewDate(0) } },
        }));
      },
      markUnknown: (id) => {
        set((state) => {
          const { [id]: _removed, ...restSrs } = state.srs;
          return {
            knownWordIds: state.knownWordIds.filter((x) => x !== id),
            srs: restSrs,
          };
        });
      },
      reviewCorrect: (id) => {
        set((state) => {
          const current = state.srs[id];
          const nextBox = (current?.box ?? 0) + 1;
          return { srs: { ...state.srs, [id]: { box: nextBox, nextReviewAt: nextReviewDate(nextBox) } } };
        });
      },
      setCurrentTale: (tale) => set({ currentTale: tale }),
    }),
    { name: "hcda:progress:v1" }
  )
);

export function useKnownSet(): Set<number> {
  const knownWordIds = useProgressStore((s) => s.knownWordIds);
  return useMemo(() => new Set(knownWordIds), [knownWordIds]);
}

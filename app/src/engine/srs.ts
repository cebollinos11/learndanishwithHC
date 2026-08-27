import type { SrsEntry } from "../state/progressStore";

// Leitner-style box intervals, in days. Box index = array index.
const INTERVALS_DAYS = [1, 3, 7, 16, 35, 90];

export function nextReviewDate(box: number): string {
  const days = INTERVALS_DAYS[Math.min(box, INTERVALS_DAYS.length - 1)];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function isDue(entry: SrsEntry, now: Date = new Date()): boolean {
  return new Date(entry.nextReviewAt).getTime() <= now.getTime();
}

export function getDueWordIds(srs: Record<number, SrsEntry>, now: Date = new Date()): number[] {
  return Object.entries(srs)
    .filter(([, entry]) => isDue(entry, now))
    .map(([id]) => Number(id));
}

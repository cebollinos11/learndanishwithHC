import { describe, expect, it } from "vitest";
import { getDueWordIds, isDue, nextReviewDate } from "./srs";

describe("isDue", () => {
  it("is due when nextReviewAt is in the past", () => {
    const entry = { box: 0, nextReviewAt: new Date(Date.now() - 1000).toISOString() };
    expect(isDue(entry)).toBe(true);
  });

  it("is not due when nextReviewAt is in the future", () => {
    const entry = { box: 0, nextReviewAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() };
    expect(isDue(entry)).toBe(false);
  });
});

describe("getDueWordIds", () => {
  it("returns only the ids whose entries are due", () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1000).toISOString();
    const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const srs = {
      1: { box: 0, nextReviewAt: past },
      2: { box: 1, nextReviewAt: future },
      3: { box: 2, nextReviewAt: past },
    };
    expect(getDueWordIds(srs, now).sort()).toEqual([1, 3]);
  });
});

describe("nextReviewDate", () => {
  it("schedules further-out reviews for higher boxes", () => {
    const box0 = new Date(nextReviewDate(0)).getTime();
    const box3 = new Date(nextReviewDate(3)).getTime();
    expect(box3).toBeGreaterThan(box0);
  });

  it("caps the interval for boxes beyond the schedule length", () => {
    const capped = new Date(nextReviewDate(99)).getTime();
    const lastDefined = new Date(nextReviewDate(5)).getTime();
    expect(capped).toBe(lastDefined);
  });
});

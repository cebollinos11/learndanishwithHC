import { describe, expect, it } from "vitest";
import { buildTestCorpus } from "./testFixture";
import { computeCoveragePct, countNewlyFullyKnown, countKnownInTopN } from "./coverage";

describe("computeCoveragePct", () => {
  it("weights coverage by word frequency, not just word count", () => {
    const corpus = buildTestCorpus();
    // jeg (freq 3) + har (freq 3) known, out of 14 total tokens
    const pct = computeCoveragePct(corpus, new Set([1, 4]));
    expect(pct).toBeCloseTo((6 / 14) * 100, 5);
  });

  it("is 0 when nothing is known", () => {
    const corpus = buildTestCorpus();
    expect(computeCoveragePct(corpus, new Set())).toBe(0);
  });
});

describe("countNewlyFullyKnown", () => {
  it("counts sentences that flip from having an unknown word to fully known", () => {
    const corpus = buildTestCorpus();
    const before = new Set([1, 4]); // jeg, har
    const after = new Set([1, 4, 2]); // + kat
    // Sentence 1 ("Jeg har en kat.") needs exactly jeg+har+kat -> newly complete.
    // Sentence 3 still needs "hund" (id 3) -> not complete.
    expect(countNewlyFullyKnown(corpus, before, after)).toBe(1);
  });

  it("returns 0 when the newly known word completes nothing", () => {
    const corpus = buildTestCorpus();
    const before = new Set([1, 4]);
    const after = new Set([1, 4]); // no change
    expect(countNewlyFullyKnown(corpus, before, after)).toBe(0);
  });
});

describe("countKnownInTopN", () => {
  it("counts known words within the top-N ranked words", () => {
    const corpus = buildTestCorpus();
    const { known, total } = countKnownInTopN(corpus, new Set([1, 4]), 2);
    expect(total).toBe(2); // ranks 1-2: jeg, kat
    expect(known).toBe(1); // only jeg is known and in top 2
  });
});

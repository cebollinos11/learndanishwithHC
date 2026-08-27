import { describe, expect, it } from "vitest";
import { buildTestCorpus } from "./testFixture";
import { findTheUnknownWord, pickNextSentence } from "./pickSentence";

describe("findTheUnknownWord", () => {
  it("returns the single unknown word id when exactly one is unknown", () => {
    const corpus = buildTestCorpus();
    const sentence2 = corpus.sentenceById.get(2)!; // "Jeg har en hund." -> [jeg, har, hund]
    expect(findTheUnknownWord(sentence2, new Set([1, 4]))).toBe(3); // hund
  });

  it("returns null when zero words are unknown", () => {
    const corpus = buildTestCorpus();
    const sentence1 = corpus.sentenceById.get(1)!;
    expect(findTheUnknownWord(sentence1, new Set([1, 2, 4]))).toBeNull();
  });

  it("returns null when more than one word is unknown", () => {
    const corpus = buildTestCorpus();
    const sentence3 = corpus.sentenceById.get(3)!; // needs kat + hund
    expect(findTheUnknownWord(sentence3, new Set([1, 4]))).toBeNull();
  });
});

describe("pickNextSentence", () => {
  it("only offers sentences with exactly one unknown word", () => {
    const corpus = buildTestCorpus();
    const picked = pickNextSentence(corpus, new Set([1, 4]), null);
    // Sentence 1 and 2 both qualify (1 unknown each); sentence 3 needs two.
    expect(picked).not.toBeNull();
    expect([1, 2]).toContain(picked!.id);
  });

  it("returns null when no sentence has exactly one unknown word", () => {
    const corpus = buildTestCorpus();
    const picked = pickNextSentence(corpus, new Set(), null); // everything unknown
    expect(picked).toBeNull();
  });

  it("respects the exclude set", () => {
    const corpus = buildTestCorpus();
    const picked = pickNextSentence(corpus, new Set([1, 4]), null, new Set([1]));
    expect(picked?.id).toBe(2);
  });

  it("skips a sentence whose lone unknown word has no gloss", () => {
    const corpus = buildTestCorpus();
    corpus.wordById.get(2)!.gloss = null; // "kat" now ungossed
    const picked = pickNextSentence(corpus, new Set([1, 4]), null);
    // Sentence 1 needs "kat" (ungossed) -- must be skipped in favor of sentence 2.
    expect(picked?.id).toBe(2);
  });
});

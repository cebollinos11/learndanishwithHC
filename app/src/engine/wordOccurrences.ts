import type { Corpus, Sentence } from "../data/types";

/** Returns a sentence containing wordId, preferring one other than its first occurrence for variety. */
export function pickReviewSentence(corpus: Corpus, wordId: number): Sentence | null {
  const occurrences = corpus.sentences.filter((s) => s.wordIds.includes(wordId));
  if (occurrences.length === 0) return null;
  const word = corpus.wordById.get(wordId);
  const others = word ? occurrences.filter((s) => s.id !== word.firstSentenceId) : occurrences;
  const pool = others.length > 0 ? others : occurrences;
  return pool[Math.floor(Math.random() * pool.length)];
}

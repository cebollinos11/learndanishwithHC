import type { Corpus } from "../data/types";

export function computeCoveragePct(corpus: Corpus, knownIds: ReadonlySet<number>): number {
  let known = 0;
  for (const w of corpus.words) {
    if (knownIds.has(w.id)) known += w.frequency;
  }
  return (known / corpus.totalTokens) * 100;
}

export function unknownCountForSentence(corpus: Corpus, sentenceId: number, knownIds: ReadonlySet<number>): number {
  const sentence = corpus.sentenceById.get(sentenceId);
  if (!sentence) return Infinity;
  let count = 0;
  for (const id of sentence.wordIds) {
    if (!knownIds.has(id)) count++;
  }
  return count;
}

export function countNewlyFullyKnown(
  corpus: Corpus,
  knownIdsBefore: ReadonlySet<number>,
  knownIdsAfter: ReadonlySet<number>
): number {
  let count = 0;
  for (const s of corpus.sentences) {
    const wasFullyKnown = s.wordIds.every((id) => knownIdsBefore.has(id));
    const isFullyKnown = s.wordIds.every((id) => knownIdsAfter.has(id));
    if (!wasFullyKnown && isFullyKnown) count++;
  }
  return count;
}

export function countKnownInTopN(corpus: Corpus, knownIds: ReadonlySet<number>, n: number): { known: number; total: number } {
  const top = corpus.words.filter((w) => w.rank <= n);
  return { known: top.filter((w) => knownIds.has(w.id)).length, total: top.length };
}

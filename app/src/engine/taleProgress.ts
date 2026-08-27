import type { Corpus } from "../data/types";

export interface TaleProgress {
  knownSentences: number;
  totalSentences: number;
  pctSentencesKnown: number;
}

export function computeTaleProgress(corpus: Corpus, taleName: string, knownIds: ReadonlySet<number>): TaleProgress {
  const sentences = corpus.sentences.filter((s) => s.tale === taleName);
  const knownSentences = sentences.filter((s) => s.wordIds.every((id) => knownIds.has(id))).length;
  return {
    knownSentences,
    totalSentences: sentences.length,
    pctSentencesKnown: sentences.length > 0 ? (knownSentences / sentences.length) * 100 : 0,
  };
}

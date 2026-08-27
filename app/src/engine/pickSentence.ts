import type { Corpus, Sentence } from "../data/types";
import { unknownCountForSentence } from "./coverage";

/**
 * Finds the single unknown word id in a sentence that has exactly one
 * unknown word. Returns null if the sentence doesn't qualify.
 */
export function findTheUnknownWord(sentence: Sentence, knownIds: ReadonlySet<number>): number | null {
  const unknown = sentence.wordIds.filter((id) => !knownIds.has(id));
  return unknown.length === 1 ? unknown[0] : null;
}

/**
 * Picks the next drillable sentence: exactly one unknown word, preferring
 * the current tale (by position) and otherwise the easiest tale with candidates.
 * The unknown word must have a gloss -- ungossed words (rank > ~7000) aren't
 * surfaced as drill targets yet, since there'd be nothing to show for them.
 */
export function pickNextSentence(
  corpus: Corpus,
  knownIds: ReadonlySet<number>,
  currentTale: string | null,
  excludeSentenceIds: ReadonlySet<number> = new Set()
): Sentence | null {
  const candidates: Sentence[] = [];
  for (const s of corpus.sentences) {
    if (excludeSentenceIds.has(s.id)) continue;
    if (unknownCountForSentence(corpus, s.id, knownIds) !== 1) continue;
    const unknownId = findTheUnknownWord(s, knownIds);
    if (unknownId === null || corpus.wordById.get(unknownId)?.gloss == null) continue;
    candidates.push(s);
  }
  if (candidates.length === 0) return null;

  if (currentTale) {
    const sameTale = candidates.filter((s) => s.tale === currentTale);
    if (sameTale.length > 0) {
      sameTale.sort((a, b) => a.position - b.position);
      return sameTale[0];
    }
  }

  candidates.sort((a, b) => {
    const orderA = corpus.taleOrder.get(a.tale) ?? Number.MAX_SAFE_INTEGER;
    const orderB = corpus.taleOrder.get(b.tale) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.position - b.position;
  });
  return candidates[0];
}

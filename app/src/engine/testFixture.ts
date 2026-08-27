import type { Corpus, Sentence, Word } from "../data/types";

/** Small hand-built corpus for unit tests: no fetches, no real data. */
export function buildTestCorpus(): Corpus {
  const words: Word[] = [
    { id: 1, word: "jeg", frequency: 3, rank: 1, taleCount: 1, firstSentenceId: 1, gloss: "I", isProperNoun: false, isSeed: true },
    { id: 2, word: "kat", frequency: 2, rank: 2, taleCount: 1, firstSentenceId: 1, gloss: "cat", isProperNoun: false, isSeed: false },
    { id: 3, word: "hund", frequency: 2, rank: 3, taleCount: 1, firstSentenceId: 2, gloss: "dog", isProperNoun: false, isSeed: false },
    { id: 4, word: "har", frequency: 3, rank: 4, taleCount: 1, firstSentenceId: 1, gloss: "have", isProperNoun: false, isSeed: true },
  ];

  const sentences: Sentence[] = [
    { id: 1, tale: "Test", position: 0, text: "Jeg har en kat.", wordCount: 4, wordIds: [1, 4, 2] },
    { id: 2, tale: "Test", position: 1, text: "Jeg har en hund.", wordCount: 4, wordIds: [1, 4, 3] },
    { id: 3, tale: "Test", position: 2, text: "Jeg har en kat og en hund.", wordCount: 6, wordIds: [1, 4, 2, 3] },
  ];

  const tales = [{ name: "Test", sentenceCount: 3, avgSentenceLength: 4.7, pctTop2000: 1, difficultyScore: 0 }];

  const wordById = new Map(words.map((w) => [w.id, w]));
  const sentenceById = new Map(sentences.map((s) => [s.id, s]));
  const taleOrder = new Map(tales.map((t, i) => [t.name, i]));
  const totalTokens = sentences.reduce((sum, s) => sum + s.wordCount, 0);
  const wordIdByText = new Map(words.map((w) => [w.word, w.id]));

  return { words, wordById, wordIdByText, sentences, sentenceById, tales, taleOrder, totalTokens };
}

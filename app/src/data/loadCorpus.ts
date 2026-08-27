import type { Corpus, Sentence, Tale, Word } from "./types";

export async function loadCorpus(): Promise<Corpus> {
  const base = import.meta.env.BASE_URL;
  const [words, sentences, tales]: [Word[], Sentence[], Tale[]] = await Promise.all([
    fetch(`${base}data/words.json`).then((r) => r.json()),
    fetch(`${base}data/sentences.json`).then((r) => r.json()),
    fetch(`${base}data/tales.json`).then((r) => r.json()),
  ]);

  const wordById = new Map(words.map((w) => [w.id, w]));
  const wordIdByText = new Map(words.map((w) => [w.word, w.id]));
  const sentenceById = new Map(sentences.map((s) => [s.id, s]));
  const taleOrder = new Map(tales.map((t, i) => [t.name, i]));
  const totalTokens = sentences.reduce((sum, s) => sum + s.wordCount, 0);

  return { words, wordById, wordIdByText, sentences, sentenceById, tales, taleOrder, totalTokens };
}

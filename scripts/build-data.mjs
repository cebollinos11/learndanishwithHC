// Offline data pipeline: reads the raw hcandersenr corpus JSON and produces
// the derived JSON files the app consumes at runtime (words/sentences/tales).
// Run with: node scripts/build-data.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "app", "public", "data");

const SEED_RANK_CUTOFF = 60;
const TOP2000_RANK_CUTOFF = 2000;

// Letters actually present in the corpus's word list (see andersen_da_words.json),
// plus hyphen/apostrophe as internal joiners for compounds like "klods-hans", "mo'er".
const LETTER = "a-zàáäåæèéíóøü";
const TOKEN_RE = new RegExp(`[${LETTER}]+(?:['-][${LETTER}]+)*`, "gi");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function loadGlosses() {
  // Keyed by word text (not id) -- much less error-prone to hand-author at scale.
  const file = path.join(ROOT, "glosses-by-word.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const wordsRaw = readJson("andersen_da_words.json").words;
  const sentencesRaw = readJson("andersen_da_sentences.json").sentences;
  const glosses = loadGlosses();

  const wordByText = new Map(wordsRaw.map((w) => [w.word, w]));
  const wordById = new Map(wordsRaw.map((w) => [w.id, w]));

  // occurrences[wordId] = { count, capitalizedNonInitial, sawNonInitial }
  const occurrences = new Map(wordsRaw.map((w) => [w.id, { capitalizedNonInitial: 0, nonInitialSeen: 0 }]));

  const misses = new Map(); // token -> count, for tokens with no matching word entry

  const outSentences = sentencesRaw.map((s) => {
    const wordIdSet = new Set();
    let position = 0;
    let match;
    TOKEN_RE.lastIndex = 0;
    while ((match = TOKEN_RE.exec(s.text)) !== null) {
      const raw = match[0];
      const lower = raw.toLowerCase();
      const w = wordByText.get(lower);
      if (!w) {
        misses.set(lower, (misses.get(lower) ?? 0) + 1);
      } else {
        wordIdSet.add(w.id);
        const isCapitalized = raw[0] !== raw[0].toLowerCase() && raw[0] === raw[0].toUpperCase();
        if (position > 0) {
          const occ = occurrences.get(w.id);
          occ.nonInitialSeen++;
          if (isCapitalized) occ.capitalizedNonInitial++;
        }
      }
      position++;
    }
    return {
      id: s.id,
      tale: s.tale,
      position: s.position,
      text: s.text,
      wordCount: s.word_count,
      wordIds: Array.from(wordIdSet),
    };
  });

  const totalTokens = sentencesRaw.reduce((sum, s) => sum + s.word_count, 0);
  const totalMisses = Array.from(misses.values()).reduce((a, b) => a + b, 0);
  const missRate = totalMisses / totalTokens;
  console.log(`Tokenizer: ${totalMisses} unmatched tokens out of ~${totalTokens} (${(missRate * 100).toFixed(3)}%)`);
  if (missRate > 0.001) {
    console.warn("Top unmatched tokens:", [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30));
    throw new Error(`Tokenizer miss rate too high (${(missRate * 100).toFixed(3)}%) — investigate before proceeding.`);
  } else if (misses.size > 0) {
    console.warn("Unmatched tokens (low rate, logged for review):", [...misses.entries()]);
  }

  let glossedCount = 0;
  const outWords = wordsRaw.map((w) => {
    const occ = occurrences.get(w.id);
    // Require at least 2 non-initial occurrences so a single personified/poetic
    // capitalization (e.g. "Madkniven" the talking bread-knife, used once) doesn't
    // get mistaken for a real proper noun.
    const isProperNoun = occ.nonInitialSeen >= 2 && occ.capitalizedNonInitial / occ.nonInitialSeen > 0.5;
    const gloss = glosses[w.word] ?? null;
    if (gloss) glossedCount++;
    return {
      id: w.id,
      word: w.word,
      frequency: w.frequency,
      rank: w.rank,
      taleCount: w.tale_count,
      firstSentenceId: w.first_sentence_id,
      gloss,
      isProperNoun,
      isSeed: w.rank <= SEED_RANK_CUTOFF && !isProperNoun,
    };
  });
  console.log(`Glosses: ${glossedCount} / ${outWords.length} words glossed`);
  console.log(`Proper nouns flagged: ${outWords.filter((w) => w.isProperNoun).length}`);
  console.log(`Seed words: ${outWords.filter((w) => w.isSeed).length}`);

  // Tale difficulty: composite of average sentence length and share of tokens
  // ranked in the top 2000 (higher share + shorter sentences = easier).
  const taleStats = new Map();
  for (const s of outSentences) {
    if (!taleStats.has(s.tale)) {
      taleStats.set(s.tale, { sentenceCount: 0, totalWords: 0, top2000Tokens: 0, totalTokens: 0 });
    }
    const t = taleStats.get(s.tale);
    t.sentenceCount++;
    t.totalWords += s.wordCount;
    for (const id of s.wordIds) {
      t.totalTokens++;
      const w = wordById.get(id);
      if (w.rank <= TOP2000_RANK_CUTOFF) t.top2000Tokens++;
    }
  }
  const outTales = Array.from(taleStats.entries()).map(([name, t]) => {
    const avgSentenceLength = t.totalWords / t.sentenceCount;
    const pctTop2000 = t.totalTokens > 0 ? t.top2000Tokens / t.totalTokens : 0;
    // Normalize avg length against a rough max of 40 words/sentence; both terms in [0,1]-ish, lower = easier.
    const difficultyScore = avgSentenceLength / 40 + (1 - pctTop2000);
    return { name, sentenceCount: t.sentenceCount, avgSentenceLength, pctTop2000, difficultyScore };
  });
  outTales.sort((a, b) => a.difficultyScore - b.difficultyScore);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "words.json"), JSON.stringify(outWords));
  fs.writeFileSync(path.join(OUT_DIR, "sentences.json"), JSON.stringify(outSentences));
  fs.writeFileSync(path.join(OUT_DIR, "tales.json"), JSON.stringify(outTales, null, 2));

  console.log(`\nWrote ${outWords.length} words, ${outSentences.length} sentences, ${outTales.length} tales to ${OUT_DIR}`);
  console.log("Easiest 5 tales:", outTales.slice(0, 5).map((t) => t.name));
}

main();

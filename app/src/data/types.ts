export interface Word {
  id: number;
  word: string;
  frequency: number;
  rank: number;
  taleCount: number;
  firstSentenceId: number;
  gloss: string | null;
  isProperNoun: boolean;
  isSeed: boolean;
}

export interface Sentence {
  id: number;
  tale: string;
  position: number;
  text: string;
  wordCount: number;
  wordIds: number[];
}

export interface Tale {
  name: string;
  sentenceCount: number;
  avgSentenceLength: number;
  pctTop2000: number;
  difficultyScore: number;
}

export interface Corpus {
  words: Word[];
  wordById: Map<number, Word>;
  wordIdByText: Map<string, number>;
  sentences: Sentence[];
  sentenceById: Map<number, Sentence>;
  tales: Tale[];
  taleOrder: Map<string, number>; // tale name -> index in difficulty-sorted tales list
  totalTokens: number;
}

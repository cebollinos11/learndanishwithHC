const LETTER = "a-zàáäåæèéíóøü";
const TOKEN_RE = new RegExp(`[${LETTER}]+(?:['-][${LETTER}]+)*`, "gi");

export interface SentencePart {
  text: string;
  wordId: number | null; // null for punctuation/whitespace segments
}

/** Splits sentence text into segments, tagging each matched token with its word id. */
export function renderSentenceParts(text: string, wordIdByToken: (lowerToken: string) => number | undefined): SentencePart[] {
  const parts: SentencePart[] = [];
  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), wordId: null });
    }
    const id = wordIdByToken(match[0].toLowerCase());
    parts.push({ text: match[0], wordId: id ?? null });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), wordId: null });
  }
  return parts;
}

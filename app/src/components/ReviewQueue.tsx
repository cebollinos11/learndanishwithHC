import { useMemo, useState } from "react";
import type { Corpus } from "../data/types";
import type { SrsEntry } from "../state/progressStore";
import { getDueWordIds } from "../engine/srs";
import { pickReviewSentence } from "../engine/wordOccurrences";
import { SentenceCard } from "./SentenceCard";
import { WordPanel } from "./WordPanel";

interface Props {
  corpus: Corpus;
  srs: Record<number, SrsEntry>;
  onCorrect: (wordId: number) => void;
  onForgot: (wordId: number) => void;
}

export function ReviewQueue({ corpus, srs, onCorrect, onForgot }: Props) {
  const dueWordIds = useMemo(() => getDueWordIds(srs), [srs]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentWordId = dueWordIds[0] ?? null;
  const currentWord = currentWordId !== null ? corpus.wordById.get(currentWordId) ?? null : null;
  const sentence = useMemo(
    () => (currentWordId !== null ? pickReviewSentence(corpus, currentWordId) : null),
    [corpus, currentWordId]
  );

  if (!currentWord || !sentence) {
    return (
      <div className="review-queue">
        <h2>Review</h2>
        <p>{reviewedCount > 0 ? `Nice work — reviewed ${reviewedCount} words. ` : ""}Nothing due for review right now.</p>
      </div>
    );
  }

  const handleCorrect = () => {
    onCorrect(currentWord.id);
    setReviewedCount((c) => c + 1);
    setPanelOpen(false);
  };

  const handleForgot = () => {
    onForgot(currentWord.id);
    setReviewedCount((c) => c + 1);
    setPanelOpen(false);
  };

  return (
    <div className="review-queue">
      <h2>Review ({dueWordIds.length} due)</h2>
      <SentenceCard corpus={corpus} sentence={sentence} targetWordId={currentWord.id} onTapTarget={() => setPanelOpen(true)} />
      {panelOpen && (
        <WordPanel corpus={corpus} word={currentWord} onKnow={handleCorrect} onDontKnow={handleForgot} />
      )}
    </div>
  );
}

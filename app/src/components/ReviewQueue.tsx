import { useMemo, useState } from "react";
import type { Corpus } from "../data/types";
import type { SrsEntry } from "../state/progressStore";
import { getDueWordIds } from "../engine/srs";
import { pickReviewSentence } from "../engine/wordOccurrences";
import { useFlashcardHotkeys } from "../hooks/useFlashcardHotkeys";
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

  const handleCorrect = () => {
    if (!currentWord) return;
    onCorrect(currentWord.id);
    setReviewedCount((c) => c + 1);
    setPanelOpen(false);
  };

  const handleForgot = () => {
    if (!currentWord) return;
    onForgot(currentWord.id);
    setReviewedCount((c) => c + 1);
    setPanelOpen(false);
  };

  useFlashcardHotkeys({
    enabled: !!currentWord && !!sentence,
    panelOpen,
    onReveal: () => setPanelOpen(true),
    onKnow: handleCorrect,
    onDontKnow: handleForgot,
  });

  if (!currentWord || !sentence) {
    return (
      <div className="review-queue">
        <h2>Review</h2>
        <p>{reviewedCount > 0 ? `Nice work — reviewed ${reviewedCount} words. ` : ""}Nothing due for review right now.</p>
      </div>
    );
  }

  return (
    <div className="review-queue">
      <h2>Review ({dueWordIds.length} due)</h2>
      <SentenceCard corpus={corpus} sentence={sentence} targetWordId={currentWord.id} onTapTarget={() => setPanelOpen(true)} />
      {panelOpen && (
        <WordPanel corpus={corpus} word={currentWord} onKnow={handleCorrect} onDontKnow={handleForgot} />
      )}
      <p className="hotkey-hint">{panelOpen ? "← don't know · → know" : "↑ / ↓ reveal translation"}</p>
    </div>
  );
}

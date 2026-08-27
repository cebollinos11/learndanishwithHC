import { useState } from "react";
import type { Corpus, Word } from "../data/types";
import { renderSentenceParts } from "../engine/renderSentence";

interface Props {
  corpus: Corpus;
  taleName: string;
  knownIds: ReadonlySet<number>;
  onBack: () => void;
}

export function ReaderView({ corpus, taleName, knownIds, onBack }: Props) {
  const [activeWord, setActiveWord] = useState<Word | null>(null);
  const sentences = corpus.sentences.filter((s) => s.tale === taleName).sort((a, b) => a.position - b.position);

  return (
    <div className="reader-view">
      <button className="back-link" onClick={onBack}>
        ← Back to tales
      </button>
      <h2 className="reader-title">{taleName}</h2>
      <p className="reader-text">
        {sentences.map((s) => {
          const parts = renderSentenceParts(s.text, (token) => corpus.wordIdByText.get(token));
          return (
            <span key={s.id}>
              {parts.map((part, i) => {
                if (part.wordId === null) return <span key={i}>{part.text}</span>;
                const isKnown = knownIds.has(part.wordId);
                return (
                  <button
                    key={i}
                    className={isKnown ? "reader-word known" : "reader-word unknown"}
                    onClick={() => setActiveWord(corpus.wordById.get(part.wordId!) ?? null)}
                  >
                    {part.text}
                  </button>
                );
              })}{" "}
            </span>
          );
        })}
      </p>

      {activeWord && (
        <div className="reader-gloss-popup" onClick={() => setActiveWord(null)}>
          <div className="reader-gloss-content" onClick={(e) => e.stopPropagation()}>
            <h3>{activeWord.word}</h3>
            <p>{activeWord.gloss ?? "(no gloss yet)"}</p>
            <button onClick={() => setActiveWord(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

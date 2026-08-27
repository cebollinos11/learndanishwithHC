import type { Corpus, Sentence } from "../data/types";
import { renderSentenceParts } from "../engine/renderSentence";
import { isTtsSupported, speak } from "../tts";

interface Props {
  corpus: Corpus;
  sentence: Sentence;
  targetWordId: number;
  onTapTarget: () => void;
}

export function SentenceCard({ corpus, sentence, targetWordId, onTapTarget }: Props) {
  const parts = renderSentenceParts(sentence.text, (token) => corpus.wordIdByText.get(token));

  return (
    <div className="sentence-card">
      <p className="sentence-text">
        {parts.map((part, i) =>
          part.wordId === targetWordId ? (
            <button key={i} className="word-target" onClick={onTapTarget}>
              {part.text}
            </button>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
        {isTtsSupported() && (
          <button className="speak-btn" onClick={() => speak(sentence.text)} aria-label="Pronounce sentence">
            🔊
          </button>
        )}
      </p>
      <p className="sentence-tale">{sentence.tale}</p>
    </div>
  );
}

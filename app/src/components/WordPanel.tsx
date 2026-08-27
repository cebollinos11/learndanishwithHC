import type { Corpus, Word } from "../data/types";
import { isTtsSupported, speak } from "../tts";

interface Props {
  corpus: Corpus;
  word: Word;
  onKnow: () => void;
  onDontKnow: () => void;
}

export function WordPanel({ corpus, word, onKnow, onDontKnow }: Props) {
  const exampleSentence = corpus.sentenceById.get(word.firstSentenceId);

  return (
    <div className="word-panel">
      <h2 className="word-panel-word">
        {word.word}
        {isTtsSupported() && (
          <button className="speak-btn" onClick={() => speak(word.word)} aria-label="Pronounce word">
            🔊
          </button>
        )}
      </h2>
      <p className="word-panel-gloss">{word.gloss ?? "(no gloss yet)"}</p>
      {exampleSentence && (
        <p className="word-panel-example">
          <em>{exampleSentence.text}</em>
          {isTtsSupported() && (
            <button className="speak-btn" onClick={() => speak(exampleSentence.text)} aria-label="Pronounce sentence">
              🔊
            </button>
          )}
        </p>
      )}
      <div className="word-panel-actions">
        <button className="btn-dont-know" onClick={onDontKnow}>
          I don't know this
        </button>
        <button className="btn-know" onClick={onKnow}>
          I know this
        </button>
      </div>
    </div>
  );
}

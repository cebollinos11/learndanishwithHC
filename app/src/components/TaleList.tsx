import type { Corpus } from "../data/types";
import { computeTaleProgress } from "../engine/taleProgress";

interface Props {
  corpus: Corpus;
  knownIds: ReadonlySet<number>;
  onOpenTale: (taleName: string) => void;
}

export function TaleList({ corpus, knownIds, onOpenTale }: Props) {
  return (
    <div className="tale-list">
      <h2>Tales, easiest first</h2>
      <ul>
        {corpus.tales.map((tale) => {
          const progress = computeTaleProgress(corpus, tale.name, knownIds);
          return (
            <li key={tale.name} className="tale-list-item" onClick={() => onOpenTale(tale.name)}>
              <span className="tale-list-name">{tale.name}</span>
              <span className="tale-list-progress">
                {progress.knownSentences}/{progress.totalSentences} sentences readable (
                {progress.pctSentencesKnown.toFixed(0)}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

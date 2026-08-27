import type { Corpus } from "../data/types";
import { computeCoveragePct, countKnownInTopN } from "../engine/coverage";

interface Props {
  corpus: Corpus;
  knownIds: ReadonlySet<number>;
}

const MILESTONES = [63, 929, 3081]; // words covering ~50% / 80% / 90% of all Andersen tokens

export function CoverageDashboard({ corpus, knownIds }: Props) {
  const coveragePct = computeCoveragePct(corpus, knownIds);
  const fullyKnownTales = corpus.tales.filter((t) => {
    const sentences = corpus.sentences.filter((s) => s.tale === t.name);
    return sentences.every((s) => s.wordIds.every((id) => knownIds.has(id)));
  }).length;

  return (
    <div className="coverage-dashboard">
      <h2>Your progress</h2>
      <p className="dashboard-headline">{coveragePct.toFixed(2)}% of all Andersen text is readable to you</p>
      <p>
        {knownIds.size} words known · {fullyKnownTales} / {corpus.tales.length} tales fully readable
      </p>
      <ul className="dashboard-milestones">
        {MILESTONES.map((n) => {
          const { known, total } = countKnownInTopN(corpus, knownIds, n);
          return (
            <li key={n}>
              Top {n} words: {known} / {total} known
            </li>
          );
        })}
      </ul>
    </div>
  );
}

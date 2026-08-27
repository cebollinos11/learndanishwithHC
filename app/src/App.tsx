import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { loadCorpus } from "./data/loadCorpus";
import type { Corpus, Sentence } from "./data/types";
import { computeCoveragePct, countNewlyFullyKnown } from "./engine/coverage";
import { findTheUnknownWord, pickNextSentence } from "./engine/pickSentence";
import { useKnownSet, useProgressStore } from "./state/progressStore";
import { SentenceCard } from "./components/SentenceCard";
import { WordPanel } from "./components/WordPanel";
import { TaleList } from "./components/TaleList";
import { ReaderView } from "./components/ReaderView";
import { CoverageDashboard } from "./components/CoverageDashboard";
import { ReviewQueue } from "./components/ReviewQueue";
import { getDueWordIds } from "./engine/srs";

const RECENT_LIMIT = 25;

type View = "drill" | "tales" | "dashboard" | "review";

function App() {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [targetWordId, setTargetWordId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [recentSentenceIds, setRecentSentenceIds] = useState<number[]>([]);
  const [view, setView] = useState<View>("drill");
  const [openTale, setOpenTale] = useState<string | null>(null);

  const knownSet = useKnownSet();
  const initSeed = useProgressStore((s) => s.initSeed);
  const markKnown = useProgressStore((s) => s.markKnown);
  const markUnknown = useProgressStore((s) => s.markUnknown);
  const reviewCorrect = useProgressStore((s) => s.reviewCorrect);
  const setCurrentTale = useProgressStore((s) => s.setCurrentTale);
  const currentTale = useProgressStore((s) => s.currentTale);
  const srs = useProgressStore((s) => s.srs);
  const dueCount = useMemo(() => getDueWordIds(srs).length, [srs]);

  useEffect(() => {
    loadCorpus().then((c) => {
      setCorpus(c);
      const seedIds = c.words.filter((w) => w.isSeed || w.isProperNoun).map((w) => w.id);
      initSeed(seedIds);
    });
  }, [initSeed]);

  const coveragePct = useMemo(() => (corpus ? computeCoveragePct(corpus, knownSet) : 0), [corpus, knownSet]);

  const advance = (excludeIds: Set<number>) => {
    if (!corpus) return;
    const next = pickNextSentence(corpus, knownSet, currentTale, excludeIds);
    setCurrentSentence(next);
    setCurrentTale(next?.tale ?? null);
    setPanelOpen(false);
    if (next) {
      const unknown = findTheUnknownWord(next, knownSet);
      setTargetWordId(unknown);
      setRecentSentenceIds((prev) => [...prev.slice(-(RECENT_LIMIT - 1)), next.id]);
    } else {
      setTargetWordId(null);
    }
  };

  useEffect(() => {
    if (corpus && !currentSentence) {
      advance(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpus, knownSet.size]);

  if (!corpus) {
    return <div className="loading">Loading corpus…</div>;
  }

  const targetWord = targetWordId ? corpus.wordById.get(targetWordId) ?? null : null;

  const handleKnow = () => {
    if (!targetWord) return;
    const before = knownSet;
    const after = new Set(before);
    after.add(targetWord.id);
    const newlyUnlocked = countNewlyFullyKnown(corpus, before, after);
    markKnown(targetWord.id);
    setFeedback(
      newlyUnlocked > 0
        ? `"${targetWord.word}" learned — +${newlyUnlocked} sentence${newlyUnlocked === 1 ? "" : "s"} unlocked!`
        : `"${targetWord.word}" learned.`
    );
    advance(new Set(recentSentenceIds));
  };

  const handleDontKnow = () => {
    if (!currentSentence) return;
    setFeedback(null);
    advance(new Set([...recentSentenceIds, currentSentence.id]));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Learn Danish with H.C. Andersen</h1>
        <div className="coverage-badge">{coveragePct.toFixed(2)}% of Andersen readable</div>
      </header>

      <nav className="app-nav">
        <button className={view === "drill" ? "active" : ""} onClick={() => setView("drill")}>
          Drill
        </button>
        <button
          className={view === "tales" ? "active" : ""}
          onClick={() => {
            setView("tales");
            setOpenTale(null);
          }}
        >
          Tales
        </button>
        <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
          Progress
        </button>
        <button className={view === "review" ? "active" : ""} onClick={() => setView("review")}>
          Review{dueCount > 0 ? ` (${dueCount})` : ""}
        </button>
      </nav>

      {view === "drill" && (
        <>
          {feedback && <div className="feedback-banner">{feedback}</div>}
          {currentSentence && targetWordId ? (
            <>
              <SentenceCard
                corpus={corpus}
                sentence={currentSentence}
                targetWordId={targetWordId}
                onTapTarget={() => setPanelOpen(true)}
              />
              {panelOpen && targetWord && (
                <WordPanel corpus={corpus} word={targetWord} onKnow={handleKnow} onDontKnow={handleDontKnow} />
              )}
            </>
          ) : (
            <p>No fully-drillable sentences left right now — keep learning to unlock more!</p>
          )}
        </>
      )}

      {view === "tales" &&
        (openTale ? (
          <ReaderView corpus={corpus} taleName={openTale} knownIds={knownSet} onBack={() => setOpenTale(null)} />
        ) : (
          <TaleList corpus={corpus} knownIds={knownSet} onOpenTale={setOpenTale} />
        ))}

      {view === "dashboard" && <CoverageDashboard corpus={corpus} knownIds={knownSet} />}

      {view === "review" && (
        <ReviewQueue corpus={corpus} srs={srs} onCorrect={reviewCorrect} onForgot={markUnknown} />
      )}
    </div>
  );
}

export default App;

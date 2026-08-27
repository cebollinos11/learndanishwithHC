# learndanishwithHC
Web app to learn danish with the texts of HC Andersen

## Structure

- `andersen_da*.{sqlite,json}` — raw corpus (source of truth, not edited directly)
- `glosses-by-word.json` — hand-authored English glosses, keyed by Danish word
- `scripts/build-data.mjs` — offline pipeline: tokenizes sentences, builds the word↔sentence index, flags proper nouns and seed words, scores tale difficulty, merges in glosses. Run with `node scripts/build-data.mjs` after touching the corpus or the glosses file; it writes `app/public/data/{words,sentences,tales}.json`.
- `app/` — the Vite + React + TypeScript frontend

## Running

```
cd app
npm install
npm run dev      # dev server
npm run build    # production build
npm run test     # vitest
```

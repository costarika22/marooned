import { useEffect, useMemo, useState } from "react";

const SCREEN = {
  LANDING: "landing",
  ENTRY: "entry",
  LOADING: "loading",
  RESULTS: "results"
};

const loadingLines = [
  "Reading your castaway instincts...",
  "Cross-checking panic levels...",
  "Consulting dramatic island physics...",
  "Calculating your questionable fate..."
];

function normalizeValue(value) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function getSurvivalApiUrl() {
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBaseUrl) {
    return `${envBaseUrl.replace(/\/+$/, "")}/api/survival`;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3001/api/survival";
  }

  return "/api/survival";
}

function getResultMood(days) {
  if (days >= 31) return "happy";
  if (days >= 13) return "stressed";
  return "defeated";
}

function getResultReaction(days) {
  if (days >= 61) return "You may be annoyingly good at this.";
  if (days >= 31) return "You packed like a pro castaway.";
  if (days >= 13) return "This might keep you alive. Briefly.";
  if (days >= 4) return "Bold plan. Very unstable.";
  return "You packed like this was spring break.";
}

function IslandScene({ mood, screen }) {
  const bubbleText =
    screen === SCREEN.LOADING
      ? "thinking..."
      : mood === "happy"
        ? "easy."
        : mood === "stressed"
          ? "hmm."
          : mood === "defeated"
            ? "oh no."
            : "survive?";

  return (
    <div className="scene-root" aria-hidden="true">
      <div className="scene-glow" />
      <div className="scene-sun" />

      <div className="scene-water">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      <div className="island-wrap">
        <div className="island-shadow" />
        <div className="island-main">
          <div className="island-ridge" />

          <div className="palm-trunk" />
          <div className="palm-leaf leaf-a" />
          <div className="palm-leaf leaf-b" />
          <div className="palm-leaf leaf-c" />

          <div className={`castaway castaway-${mood}`}>
            <div className="castaway-head" />
            <div className="castaway-body" />
            <div className="castaway-arm arm-left" />
            <div className="castaway-arm arm-right" />
          </div>
        </div>
      </div>

      <p className="scene-bubble">{bubbleText}</p>
    </div>
  );
}

function LandingPanel({ onStart }) {
  return (
    <>
      <p className="panel-eyebrow">Mini Survival Story</p>
      <h1 className="panel-title">Marooned</h1>
      <p className="panel-subtitle">Pick 3 items. Hope for the best.</p>
      <button type="button" onClick={onStart} className="btn btn-primary">
        Start Packing
      </button>
    </>
  );
}

function EntryPanel({ values, errors, apiError, onChange, onSubmit, onBack }) {
  return (
    <>
      <p className="panel-eyebrow">Loadout</p>
      <h1 className="panel-title panel-title-sm">Pick Your 3 Items</h1>
      <p className="panel-subtitle panel-subtitle-sm">No duplicates. No miracles.</p>

      <form onSubmit={onSubmit} className="entry-form">
        {[0, 1, 2].map((index) => (
          <label key={index} className="field">
            <span>Item {index + 1}</span>
            <input
              type="text"
              value={values[index]}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={index === 0 ? "Water filter" : index === 1 ? "Tarp" : "Flare gun"}
            />
          </label>
        ))}

        {errors.length > 0 ? (
          <div className="inline-note inline-note-error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {apiError ? <div className="inline-note inline-note-error">{apiError}</div> : null}

        <div className="button-row">
          <button type="submit" className="btn btn-primary">
            Check My Odds
          </button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </>
  );
}

function LoadingPanel({ line }) {
  return (
    <>
      <p className="panel-eyebrow">Simulation</p>
      <h1 className="panel-title panel-title-sm">Island Judgment In Progress</h1>
      <p className="panel-subtitle panel-subtitle-sm">{line}</p>
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

function ResultsPanel({ result, selectedItems, onPlayAgain }) {
  return (
    <>
      <p className="panel-eyebrow">Result</p>
      <h1 className="score-hero">{result.days}</h1>
      <p className="score-label">Survival Days</p>
      <p className="score-reaction">{getResultReaction(result.days)}</p>
      <p className="score-summary">{result.explanation}</p>

      <div className="chip-grid">
        {selectedItems.map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>

      <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </>
  );
}

function App() {
  const [screen, setScreen] = useState(SCREEN.LANDING);
  const [itemValues, setItemValues] = useState(["", "", ""]);
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);

  useEffect(() => {
    if (screen !== SCREEN.LOADING) return undefined;

    const intervalId = setInterval(() => {
      setLoadingLineIndex((index) => (index + 1) % loadingLines.length);
    }, 1200);

    return () => clearInterval(intervalId);
  }, [screen]);

  const mood = useMemo(() => {
    if (screen === SCREEN.LOADING) return "thinking";
    if (screen === SCREEN.RESULTS && result) return getResultMood(result.days);
    return "idle";
  }, [screen, result]);

  function handleInputChange(index, value) {
    const nextValues = [...itemValues];
    nextValues[index] = value;
    setItemValues(nextValues);
    setApiError("");
  }

  function handleStart() {
    setScreen(SCREEN.ENTRY);
  }

  function handleBackToLanding() {
    setErrors([]);
    setApiError("");
    setScreen(SCREEN.LANDING);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = itemValues.map((item) => item.trim());
    const nextErrors = [];

    if (trimmed.some((item) => item.length === 0)) {
      nextErrors.push("All 3 items are required.");
    }

    const normalized = trimmed.map((item) => normalizeValue(item));
    if (new Set(normalized).size !== normalized.length) {
      nextErrors.push("No duplicate picks. You only get three.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors([]);
    setApiError("");
    setSelectedItems(trimmed);
    setLoadingLineIndex(0);
    setScreen(SCREEN.LOADING);
    const loadingStartedAt = Date.now();

    try {
      const response = await fetch(getSurvivalApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: trimmed })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The island is ignoring us. Please try again.");
      }

      const elapsedMs = Date.now() - loadingStartedAt;
      const minimumLoadingMs = 2000;
      const remainingMs = Math.max(0, minimumLoadingMs - elapsedMs);
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }

      setResult({
        days: data.days,
        rating: data.rating,
        explanation: data.explanation
      });
      setScreen(SCREEN.RESULTS);
    } catch (error) {
      setScreen(SCREEN.ENTRY);
      setApiError(error.message || "Something went wrong. Please try again.");
    }
  }

  function handlePlayAgain() {
    setItemValues(["", "", ""]);
    setErrors([]);
    setApiError("");
    setResult(null);
    setSelectedItems([]);
    setScreen(SCREEN.LANDING);
  }

  return (
    <main className="app-root">
      <div className="layout-split">
        <section className="content-pane">
          {screen === SCREEN.LANDING ? <LandingPanel onStart={handleStart} /> : null}
          {screen === SCREEN.ENTRY ? (
            <EntryPanel
              values={itemValues}
              errors={errors}
              apiError={apiError}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onBack={handleBackToLanding}
            />
          ) : null}
          {screen === SCREEN.LOADING ? <LoadingPanel line={loadingLines[loadingLineIndex]} /> : null}
          {screen === SCREEN.RESULTS && result ? (
            <ResultsPanel result={result} selectedItems={selectedItems} onPlayAgain={handlePlayAgain} />
          ) : null}
        </section>

        <section className="scene-pane">
          <IslandScene mood={mood} screen={screen} />
        </section>
      </div>
    </main>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";
import { getSurvivalApiUrl } from "./config/api";

const SCREEN = {
  LANDING: "landing",
  ENTRY: "entry",
  LOADING: "loading",
  RESULTS: "results"
};

const loadingLines = [
  "Checking your castaway instincts...",
  "Searching the island for coconuts...",
  "Consulting survival gods...",
  "Building your suspicious future..."
];
const LANDING_LINE =
  "You're stranded on a desert island. Pick 3 items to maximize how many days you survive.";
const LANDING_TYPEWRITER_SEEN_KEY = "marooned_landing_typewriter_seen";

function normalizeValue(value) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function LogoWord() {
  return (
    <h1 className="logo-word" aria-label="Marooned!">
      <span className="arc-left">Mar</span>
      <span className="coconut-pair arc-center" aria-hidden="true">
        <span className="coconut" />
        <span className="coconut" />
      </span>
      <span className="arc-right">ned!</span>
    </h1>
  );
}

function getResultMood(days) {
  if (days >= 31) return "happy";
  if (days >= 13) return "stressed";
  return "defeated";
}

function IslandScene({ mood, screen }) {
  return (
    <div className="scene-layer" aria-hidden="true">
      <div className="scene-sun" />
      <div className="scene-water">
        <div className="wave wave-a" />
        <div className="wave wave-b" />
        <div className="wave wave-c" />
      </div>

      <div className="island-wrap">
        <div className="island-main">
          <div className="island-ridge" />
          <div className="palm-trunk" />
          <div className="palm-leaf leaf-1" />
          <div className="palm-leaf leaf-2" />
          <div className="palm-leaf leaf-3" />

          <div className={`castaway castaway-${mood}`}>
            <div className="castaway-head" />
            <div className="castaway-body" />
            <div className="castaway-arm arm-left" />
            <div className="castaway-arm arm-right" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingContent({ onStart }) {
  const [typedLine, setTypedLine] = useState(() => {
    try {
      const hasSeenTypewriter = sessionStorage.getItem(LANDING_TYPEWRITER_SEEN_KEY) === "1";
      return hasSeenTypewriter ? LANDING_LINE : "";
    } catch (error) {
      return "";
    }
  });

  useEffect(() => {
    if (typedLine === LANDING_LINE) {
      return undefined;
    }

    try {
      sessionStorage.setItem(LANDING_TYPEWRITER_SEEN_KEY, "1");
    } catch (error) {
      // Ignore storage errors and continue with in-memory behavior.
    }

    let index = 0;
    setTypedLine("");

    const intervalId = setInterval(() => {
      index += 1;
      setTypedLine(LANDING_LINE.slice(0, index));
      if (index >= LANDING_LINE.length) {
        clearInterval(intervalId);
      }
    }, 22);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <p className="eyebrow">Mini Survival Game</p>
      <LogoWord />
      <p className="subtitle landing-typewriter">
        {typedLine}
        <span className="type-caret" aria-hidden="true">
          |
        </span>
      </p>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        Start Packing
      </button>
    </>
  );
}

function EntryContent({ values, errors, apiError, onChange, onSubmit, onBack }) {
  return (
    <>
      <p className="eyebrow">Loadout</p>
      <h2 className="screen-title">Pick Your 3 Items</h2>
      <p className="subtitle subtitle-sm">No duplicates. No miracles.</p>

      <form className="entry-form" onSubmit={onSubmit}>
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
          <div className="inline-error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {apiError ? <div className="inline-error">{apiError}</div> : null}

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

function LoadingContent({ line }) {
  return (
    <>
      <p className="eyebrow">Simulation</p>
      <h2 className="screen-title">Island Judgment In Progress</h2>
      <p className="subtitle subtitle-sm">{line}</p>
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

function ResultContent({ result, selectedItems, onPlayAgain }) {
  return (
    <>
      <p className="eyebrow">Result</p>
      <h2 className="screen-title">Survival Report</h2>
      <p className="subtitle subtitle-sm">{result.rating}</p>
      <p className="result-days">{result.days}</p>
      <p className="result-label">Survival Days</p>
      <p className="result-summary">{result.explanation}</p>

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: trimmed })
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Scoring response was invalid. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch survival score.");
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
      setApiError(error.message || "Failed to fetch survival score.");
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
      <IslandScene mood={mood} screen={screen} />

      <section className="center-stage">
        <div className="content-flow">
          {screen === SCREEN.LANDING ? <LandingContent onStart={handleStart} /> : null}
          {screen === SCREEN.ENTRY ? (
            <EntryContent
              values={itemValues}
              errors={errors}
              apiError={apiError}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onBack={handleBackToLanding}
            />
          ) : null}
          {screen === SCREEN.LOADING ? <LoadingContent line={loadingLines[loadingLineIndex]} /> : null}
          {screen === SCREEN.RESULTS && result ? (
            <ResultContent result={result} selectedItems={selectedItems} onPlayAgain={handlePlayAgain} />
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";

const SCREEN = {
  LANDING: "landing",
  ENTRY: "entry",
  LOADING: "loading",
  RESULTS: "results"
};

const loadingLines = [
  "Interviewing coconuts...",
  "Reading panic levels...",
  "Checking your chaos-to-survival ratio...",
  "Consulting dramatic island spirits..."
];

function normalizeValue(value) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function getResultMood(days) {
  if (days >= 31) return "happy";
  if (days >= 13) return "stressed";
  return "defeated";
}

function getResultReaction(days) {
  if (days >= 61) return "You may be annoyingly good at this.";
  if (days >= 31) return "Finally, someone brought real survival gear.";
  if (days >= 13) return "This might keep you alive. Briefly.";
  if (days >= 4) return "Bold. Not smart.";
  return "You packed like this was spring break.";
}

function HeaderText({ screen, result }) {
  if (screen === SCREEN.RESULTS && result) {
    return (
      <>
        <p className="scene-tag">Result</p>
        <h1 className="scene-title">Castaway Report</h1>
        <p className="scene-subtitle">{result.rating}</p>
      </>
    );
  }

  if (screen === SCREEN.LOADING) {
    return (
      <>
        <p className="scene-tag">Simulation</p>
        <h1 className="scene-title">Island Judging You</h1>
        <p className="scene-subtitle">Please remain dramatically calm.</p>
      </>
    );
  }

  if (screen === SCREEN.ENTRY) {
    return (
      <>
        <p className="scene-tag">Loadout</p>
        <h1 className="scene-title">Pick Your 3 Items</h1>
        <p className="scene-subtitle">No duplicates. No miracles.</p>
      </>
    );
  }

  return (
    <>
      <p className="scene-tag">Mini survival game</p>
      <h1 className="scene-title">Marooned</h1>
      <p className="scene-subtitle">Pick 3 items. Hope for the best.</p>
    </>
  );
}

function IslandScene({ mood, speech, screen }) {
  return (
    <section className="scene-stage" aria-hidden="true">
      <div className="scene-sun" />
      <div className="scene-cloud cloud-1" />
      <div className="scene-cloud cloud-2" />
      <div className="scene-ocean">
        <div className="wave wave-a" />
        <div className="wave wave-b" />
        <div className="wave wave-c" />
      </div>

      <div className={`scene-island ${screen === SCREEN.RESULTS ? "scene-island-result" : ""}`}>
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
          <div className="castaway-leg leg-left" />
          <div className="castaway-leg leg-right" />
        </div>

        {mood === "thinking" ? <div className="thought-dot thought-dot-1" /> : null}
        {mood === "thinking" ? <div className="thought-dot thought-dot-2" /> : null}
      </div>

      <p className="scene-speech">{speech}</p>
    </section>
  );
}

function LandingActions({ onStart }) {
  return (
    <div className="action-wrap">
      <div className="action-dock action-dock-landing">
        <p className="dock-line">One tiny island. Three bad decisions.</p>
        <button type="button" onClick={onStart} className="action-btn-primary">
          Start Packing
        </button>
      </div>
    </div>
  );
}

function EntryActions({ values, errors, apiError, onChange, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} className="action-wrap">
      <div className="action-dock action-dock-entry">
        <div className="entry-grid">
          {[0, 1, 2].map((index) => (
            <label key={index} className="entry-field">
              <span className="entry-label">Item {index + 1}</span>
              <input
                type="text"
                value={values[index]}
                onChange={(event) => onChange(index, event.target.value)}
                placeholder={index === 0 ? "Water filter" : index === 1 ? "Tarp" : "Flare gun"}
              />
            </label>
          ))}
        </div>

        {errors.length > 0 ? (
          <div className="status-note status-note-error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {apiError ? <div className="status-note status-note-error">{apiError}</div> : null}

        <div className="action-row">
          <button type="submit" className="action-btn-primary">
            Check My Odds
          </button>
          <button type="button" onClick={onBack} className="action-btn-secondary">
            Back
          </button>
        </div>
      </div>
    </form>
  );
}

function LoadingActions({ line }) {
  return (
    <div className="action-wrap">
      <div className="action-dock action-dock-loading">
        <p className="dock-line">{line}</p>
        <div className="dot-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function ResultActions({ items, result, onPlayAgain }) {
  return (
    <div className="action-wrap">
      <div className="action-dock action-dock-result">
        <div className="result-hero">
          <p className="result-days">{result.days}</p>
          <p className="result-label">Days</p>
        </div>

        <p className="result-reaction">{getResultReaction(result.days)}</p>
        <p className="result-explanation">{result.explanation}</p>

        <div className="chip-row">
          {items.map((item) => (
            <span key={item} className="item-chip">
              {item}
            </span>
          ))}
        </div>

        <button type="button" onClick={onPlayAgain} className="action-btn-primary">
          Play Again
        </button>
      </div>
    </div>
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

  const sceneMood = useMemo(() => {
    if (screen === SCREEN.LOADING) return "thinking";
    if (screen === SCREEN.RESULTS && result) return getResultMood(result.days);
    return "idle";
  }, [screen, result]);

  const speechLine = useMemo(() => {
    if (screen === SCREEN.LOADING) return "uh oh";
    if (screen === SCREEN.RESULTS && result) {
      if (result.days >= 31) return "nailed it";
      if (result.days >= 13) return "still breathing";
      return "send help";
    }
    if (screen === SCREEN.ENTRY) return "choose wisely";
    return "tiny panic";
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
      const response = await fetch("http://localhost:3001/api/survival", {
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
    <main className="marooned-app">
      <header className="scene-header">
        <HeaderText screen={screen} result={result} />
      </header>

      <IslandScene mood={sceneMood} speech={speechLine} screen={screen} />

      {screen === SCREEN.LANDING ? <LandingActions onStart={handleStart} /> : null}
      {screen === SCREEN.ENTRY ? (
        <EntryActions
          values={itemValues}
          errors={errors}
          apiError={apiError}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onBack={handleBackToLanding}
        />
      ) : null}
      {screen === SCREEN.LOADING ? <LoadingActions line={loadingLines[loadingLineIndex]} /> : null}
      {screen === SCREEN.RESULTS && result ? (
        <ResultActions items={selectedItems} result={result} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}

export default App;

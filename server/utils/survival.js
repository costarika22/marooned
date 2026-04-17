function normalizeInput(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function buildAliasMap(items) {
  const aliasMap = new Map();

  for (const item of items) {
    const itemTerms = [item.name, ...item.aliases];

    for (const term of itemTerms) {
      const normalizedTerm = normalizeInput(term);
      if (normalizedTerm && !aliasMap.has(normalizedTerm)) {
        aliasMap.set(normalizedTerm, item);
      }
    }
  }

  return aliasMap;
}

function matchInputToItem(input, aliasMap) {
  const normalizedInput = normalizeInput(input);
  if (!normalizedInput) return null;
  return aliasMap.get(normalizedInput) || null;
}

function determineRatingLabel(days) {
  if (days <= 5) return "You are absolutely not making it";
  if (days <= 15) return "This is looking rough";
  if (days <= 30) return "You might survive for a bit";
  if (days <= 60) return "You might actually thrive";
  return "Certified castaway legend";
}

function getCategoryWeight(category) {
  const weights = {
    water: 6,
    food: 4,
    shelter: 3,
    fire: 3,
    rescue: 3,
    tools: 2,
    medical: 2,
    defense: 1,
    comfort: 0
  };

  return weights[category] || 0;
}

function getItemUsefulnessScore(item) {
  const categoryScore = Math.max(...item.categories.map((category) => getCategoryWeight(category)), 0);
  const basePart = Math.round(item.baseScore * 0.45);
  return Math.max(1, basePart + categoryScore);
}

function pickUnknownReaction(input, index) {
  const unknownReactions = [
    `"${input}" is giving vacation energy, not survival energy.`,
    `"${input}" sounds fun until day two.`,
    `You brought "${input}". The island laughed.`,
    `"${input}" might help emotionally. Not physically.`
  ];

  return unknownReactions[index % unknownReactions.length];
}

function buildPunchyExplanation({
  days,
  knownItemNames,
  unknownReactions,
  comboReasons,
  coveredCategories,
  duplicateNotes
}) {
  if (days <= 3) {
    return unknownReactions[0] || "You packed like this was spring break.";
  }

  if (days <= 12) {
    return comboReasons[0] || "This might keep you alive. Briefly.";
  }

  if (days <= 30) {
    if (coveredCategories.has("water") && coveredCategories.has("food")) {
      return "You made actual survival choices. Suspiciously competent.";
    }
    return "Not terrible. Not great. Very island reality-show energy.";
  }

  if (days <= 60) {
    return comboReasons[0] || "Finally, someone brought actual survival gear.";
  }

  if (comboReasons.length > 0) {
    return `You may be annoyingly good at this. ${comboReasons[0]}`;
  }

  if (knownItemNames.length > 0) {
    return `Elite loadout: ${knownItemNames.slice(0, 2).join(" + ")}.`;
  }

  if (duplicateNotes.length > 0) {
    return "Strong picks, but duplicates held you back.";
  }

  return "You may be annoyingly good at this.";
}

function calculateSurvivalScore({ inputs, items, comboBonuses }) {
  const aliasMap = buildAliasMap(items);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const uniqueKnownIds = new Set();
  const uniqueUnknownInputs = new Set();
  const matchedItems = [];
  const unknownReactions = [];
  const duplicateNotes = [];

  // Baseline is now zero so weak choices can legitimately bottom out.
  let score = 0;
  let repeatedPenalty = 0;

  for (const rawInput of inputs) {
    const input = String(rawInput || "");
    const normalized = normalizeInput(input);
    const matched = matchInputToItem(input, aliasMap);

    if (matched) {
      matchedItems.push({
        input,
        matchedName: matched.name,
        isKnown: true
      });

      if (uniqueKnownIds.has(matched.id)) {
        duplicateNotes.push(`${matched.name} was repeated, so it only counted once.`);
        repeatedPenalty += 3;
      } else {
        uniqueKnownIds.add(matched.id);
        score += getItemUsefulnessScore(matched);
      }

      continue;
    }

    matchedItems.push({
      input,
      matchedName: null,
      isKnown: false
    });

    if (!normalized) {
      unknownReactions.push("Blank item. Bold minimalist strategy.");
      repeatedPenalty += 2;
      continue;
    }

    if (uniqueUnknownInputs.has(normalized)) {
      duplicateNotes.push(`"${input}" was repeated and did not stack.`);
      repeatedPenalty += 3;
      continue;
    }

    uniqueUnknownInputs.add(normalized);
    // Unknowns are mostly unhelpful; they should not be generous.
    score += 0;
    unknownReactions.push(pickUnknownReaction(input, unknownReactions.length));
  }

  const coveredCategories = new Set();
  const knownItemNames = [];

  for (const itemId of uniqueKnownIds) {
    const item = itemById.get(itemId);
    if (!item) continue;
    knownItemNames.push(item.name);
    for (const category of item.categories) {
      coveredCategories.add(category);
    }
  }

  let categoryScore = 0;

  for (const category of coveredCategories) {
    categoryScore += getCategoryWeight(category);
  }

  // Core needs matter much more than before.
  if (coveredCategories.has("water") && coveredCategories.has("food")) {
    categoryScore += 8;
  }
  if (coveredCategories.has("water") && (coveredCategories.has("shelter") || coveredCategories.has("fire"))) {
    categoryScore += 7;
  }
  if (coveredCategories.has("water") && coveredCategories.has("rescue")) {
    categoryScore += 5;
  }

  score += categoryScore;

  let comboScore = 0;
  const comboReasons = [];

  for (const combo of comboBonuses) {
    const hasCombo = combo.requiredItemIds.every((id) => uniqueKnownIds.has(id));
    if (!hasCombo) continue;
    // Combos matter more now.
    const buffedBonus = Math.round(combo.bonusScore * 1.8);
    comboScore += buffedBonus;
    comboReasons.push(combo.reason);
  }

  score += comboScore;

  // If all choices were unknown/blank, survival should be harsh.
  if (uniqueKnownIds.size === 0) {
    score -= 2;
  }

  // Missing core needs should hurt outcomes, even with decent gear.
  if (!coveredCategories.has("water")) score -= 10;
  if (!coveredCategories.has("food")) score -= 3;
  if (!coveredCategories.has("shelter") && !coveredCategories.has("fire")) score -= 4;

  score -= repeatedPenalty;

  const days = Math.max(0, Math.min(100, Math.round(score)));
  const rating = determineRatingLabel(days);
  const explanation = buildPunchyExplanation({
    days,
    knownItemNames,
    unknownReactions,
    comboReasons,
    coveredCategories,
    duplicateNotes
  });

  return {
    days,
    rating,
    explanation,
    matchedItems
  };
}

module.exports = {
  normalizeInput,
  matchInputToItem,
  calculateSurvivalScore,
  determineRatingLabel,
  buildPunchyExplanation
};

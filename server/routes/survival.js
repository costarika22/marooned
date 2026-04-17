const express = require("express");
const items = require("../data/items");
const comboBonuses = require("../data/comboBonuses");
const { calculateSurvivalScore } = require("../utils/survival");

const router = express.Router();

router.post("/survival", (req, res) => {
  const { items: submittedItems } = req.body || {};

  if (!Array.isArray(submittedItems)) {
    return res.status(400).json({
      error: 'Invalid request. "items" must be an array with exactly 3 items.'
    });
  }

  if (submittedItems.length !== 3) {
    return res.status(400).json({
      error: `Invalid request. You must submit exactly 3 items (received ${submittedItems.length}).`
    });
  }

  const hasInvalidItem = submittedItems.some((item) => typeof item !== "string");
  if (hasInvalidItem) {
    return res.status(400).json({
      error: 'Invalid request. Every item must be a string (example: "water bottle").'
    });
  }

  const result = calculateSurvivalScore({
    inputs: submittedItems,
    items,
    comboBonuses
  });

  return res.json(result);
});

module.exports = router;

const items = require("../server/data/items");
const comboBonuses = require("../server/data/comboBonuses");
const { calculateSurvivalScore } = require("../server/utils/survival");

function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }

  return null;
}

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  const body = parseRequestBody(req);
  if (!body) {
    return res.status(400).json({
      error: "Invalid JSON body."
    });
  }

  const { items: submittedItems } = body;

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

  return res.status(200).json(result);
};

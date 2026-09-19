const REQUIRED_DIMENSIONS = [
  "data_collection",
  "third_party_sharing",
  "tracking",
  "retention",
  "user_control",
  "ai_training",
  "government_disclosure"
];

const VALID_CONFIDENCE = ["high", "medium", "low"];

export function validateExtraction(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid extraction response: not an object.");
  }

  if (!data.dimensions || typeof data.dimensions !== "object") {
    throw new Error("Missing dimensions object.");
  }

  for (const key of REQUIRED_DIMENSIONS) {
    const dimension = data.dimensions[key];

    if (!dimension) {
      throw new Error(`Missing dimension: ${key}`);
    }

    if (typeof dimension.assessment !== "string" || dimension.assessment.length === 0) {
      throw new Error(`Missing or invalid assessment for ${key}`);
    }

    if (!VALID_CONFIDENCE.includes(dimension.confidence)) {
      throw new Error(`Invalid confidence for ${key}: ${dimension.confidence}`);
    }

    if (dimension.evidence !== null && typeof dimension.evidence !== "string") {
      throw new Error(`Invalid evidence for ${key}: must be a string or null`);
    }
  }

  if (!Array.isArray(data.plain_english_summary) || data.plain_english_summary.length === 0) {
    throw new Error("Missing or empty plain-English summary.");
  }

  for (const line of data.plain_english_summary) {
    if (typeof line !== "string") {
      throw new Error("plain_english_summary must contain only strings.");
    }
  }

  return true;
}
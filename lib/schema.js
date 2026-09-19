const dimensionSchema = {
  type: "OBJECT",
  properties: {
    assessment: {
      type: "STRING"
    },
    evidence: {
      type: ["STRING", "NULL"]
    },
    confidence: {
      type: "STRING",
      enum: ["high", "medium", "low"]
    }
  },
  required: [
    "assessment",
    "evidence",
    "confidence"
  ]
};

export const EXTRACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    dimensions: {
      type: "OBJECT",
      properties: {
        data_collection: dimensionSchema,
        third_party_sharing: dimensionSchema,
        tracking: dimensionSchema,
        retention: dimensionSchema,
        user_control: dimensionSchema,
        ai_training: dimensionSchema,
        government_disclosure: dimensionSchema
      },
      required: [
        "data_collection",
        "third_party_sharing",
        "tracking",
        "retention",
        "user_control",
        "ai_training",
        "government_disclosure"
      ]
    },
    plain_english_summary: {
      type: "ARRAY",
      items: {
        type: "STRING"
      }
    }
  },
  required: [
    "dimensions",
    "plain_english_summary"
  ]
};

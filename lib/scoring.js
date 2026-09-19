const RUBRIC = {
  data_collection: {
    weight: 3,
    points: {
      minimal: 0,
      moderate: 1,
      broad: 2,
      not_stated: 1
    }
  },

  third_party_sharing: {
    weight: 4,
    points: {
      none: 0,
      service_providers_only: 1,
      broad_commercial: 3,
      not_stated: 2
    }
  },

  tracking: {
    weight: 3,
    points: {
      none: 0,
      limited: 1,
      extensive: 2,
      not_stated: 1
    }
  },

  retention: {
    weight: 3,
    points: {
      clear_and_bounded: 0,
      vague: 1,
      indefinite: 2,
      not_stated: 2
    }
  },

  user_control: {
    weight: 4,
    points: {
      full: 0,
      partial: 1,
      none: 2,
      not_stated: 2
    }
  },

  ai_training: {
    weight: 1,
    points: {
      not_used: 0,
      conditional_use: 1,
      explicit_use: 2,
      not_stated: 1
    }
  },

  government_disclosure: {
    weight: 1,
    points: {
      narrow_lawful: 0,
      broad_or_vague: 2,
      not_stated: 1
    }
  }
};

const DIMENSION_NAMES = {
  data_collection: "Data Collection",
  third_party_sharing: "Third-Party Sharing",
  tracking: "Tracking",
  retention: "Retention",
  user_control: "User Control",
  ai_training: "AI Training",
  government_disclosure: "Government Disclosure"
};

const MAX_SCORE = 42;

const GRADE_LABELS = {
  A: "Low Concern",
  B: "Limited Concern",
  C: "Moderate Concern",
  D: "Elevated Concern",
  E: "High Concern",
  F: "Significant Concern"
};

function getRiskLevel(points) {
  if (points === 0) return "low";
  if (points === 1) return "moderate";
  return "high";
}

function getGrade(score) {
  const percentage = (score / MAX_SCORE) * 100;

  if (percentage <= 15) return "A";
  if (percentage <= 30) return "B";
  if (percentage <= 50) return "C";
  if (percentage <= 70) return "D";
  if (percentage <= 85) return "E";

  return "F";
}

function createConcernTitle(key, assessment) {
  const titles = {
    data_collection: {
      minimal: "Limited data collection",
      moderate: "Moderate data collection",
      broad: "Broad data collection",
      not_stated: "Data collection practices are not clearly stated"
    },

    third_party_sharing: {
      none: "No broad third-party sharing described",
      service_providers_only: "Service-provider data sharing",
      broad_commercial: "Commercial or advertising data sharing",
      not_stated: "Third-party sharing is not clearly stated"
    },

    tracking: {
      none: "No significant tracking described",
      limited: "Limited tracking",
      extensive: "Extensive tracking or behavioral monitoring",
      not_stated: "Tracking practices are not clearly stated"
    },

    retention: {
      clear_and_bounded: "Clearly bounded data retention",
      vague: "Retention period is unclear",
      indefinite: "Extended or potentially indefinite retention",
      not_stated: "Retention practices are not clearly stated"
    },

    user_control: {
      full: "Meaningful user controls are described",
      partial: "User controls are limited",
      none: "Little or no user control is described",
      not_stated: "User controls are not clearly stated"
    },

    ai_training: {
      not_used: "AI/model training use is explicitly excluded",
      conditional_use: "Conditional AI/model use",
      explicit_use: "AI/model use is explicitly described",
      not_stated: "AI/model use is not stated"
    },

    government_disclosure: {
      narrow_lawful: "Lawful government disclosure described",
      broad_or_vague: "Broad or vague government disclosure",
      not_stated: "Government disclosure practices are not clearly stated"
    }
  };

  return (
    titles[key]?.[assessment] ||
    DIMENSION_NAMES[key]
  );
}

export function scorePrivacyPolicy(extraction) {
  let riskScore = 0;

  const dimensions = Object.entries(
    extraction.dimensions
  ).map(([key, data]) => {
    const rubric = RUBRIC[key];

    if (!rubric) {
      throw new Error(`Unknown dimension: ${key}`);
    }

    const points =
      rubric.points[data.assessment];

    if (typeof points !== "number") {
      throw new Error(
        `Unknown assessment "${data.assessment}" for ${key}`
      );
    }

    const weightedPoints =
      points * rubric.weight;

    riskScore += weightedPoints;

    return {
      key,
      name: DIMENSION_NAMES[key],
      assessment: data.assessment,
      risk_level: getRiskLevel(points),
      evidence: data.evidence,
      confidence: data.confidence,
      weighted_points: weightedPoints
    };
  });

  const grade = getGrade(riskScore);

  const topConcerns = dimensions
    .filter(
      dimension =>
        dimension.weighted_points > 0
    )
    .sort(
      (a, b) =>
        b.weighted_points -
        a.weighted_points
    )
    .slice(0, 5)
    .map(dimension => ({
      title: createConcernTitle(
        dimension.key,
        dimension.assessment
      ),
      evidence: dimension.evidence,
      dimension: dimension.key
    }));

  return {
    grade,
    risk_score: riskScore,
    max_score: MAX_SCORE,
    grade_label: GRADE_LABELS[grade],

    summary:
      extraction.plain_english_summary,

    dimensions: dimensions.map(
      dimension => ({
        name: dimension.name,
        assessment:
          dimension.assessment,
        risk_level:
          dimension.risk_level,
        evidence:
          dimension.evidence,
        confidence:
          dimension.confidence
      })
    ),

    top_concerns: topConcerns,

    disclaimer:
      "This is an informational analysis based on the policy text provided, not legal advice or a determination of regulatory compliance."
  };
}

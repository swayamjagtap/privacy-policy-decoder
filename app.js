/* =========================
   DOM REFERENCES
========================= */

const policyInput = document.querySelector("#policy-input");
const characterCount = document.querySelector("#character-count");

const analyzeButton =
  document.querySelector("#analyze-button");

const analyzeAnotherButton =
  document.querySelector("#analyze-another-button");

const tryExampleButton =
  document.querySelector("#try-example-button");

const inputError =
  document.querySelector("#input-error");

const loadingState =
  document.querySelector("#loading-state");

const loadingTitle =
  document.querySelector("#loading-title");

const loadingDescription =
  document.querySelector("#loading-description");

const resultsSection =
  document.querySelector("#results-section");

const gradeBadge =
  document.querySelector("#grade-badge");

const gradeLetter =
  document.querySelector("#grade-letter");

const gradeLabel =
  document.querySelector("#grade-label");

const gradeReason =
  document.querySelector("#grade-reason");

const riskScore =
  document.querySelector("#risk-score");

const maxScore =
  document.querySelector("#max-score");

const scoreBreakdown =
  document.querySelector("#score-breakdown");

const summaryList =
  document.querySelector("#summary-list");

const dimensionsGrid =
  document.querySelector("#dimensions-grid");

const concernsList =
  document.querySelector("#concerns-list");

const liveRegion =
  document.querySelector("#live-region");

const MAX_CHARACTERS = 120000;
const MIN_CHARACTERS = 100;


/* =========================
   EXAMPLE POLICY
========================= */

const EXAMPLE_POLICY = `Privacy Policy — ExampleApp (Fictional)

Effective Date: January 1, 2026

1. Information We Collect
We collect your name, email address, device identifiers, IP address, browser type, operating system, approximate location (city-level), and usage data including pages visited, features used, and session duration. We may also collect content you upload to the service.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, to communicate with you, to personalize your experience, and to conduct analytics.

3. Third-Party Sharing
We share your information with service providers who assist us in operating the platform, including cloud hosting, analytics, and customer support providers. We may also share aggregated, de-identified information with advertising and marketing partners for promotional purposes. We may share information with business partners and affiliates for joint marketing initiatives.

4. Cookies and Tracking
We use cookies, pixel tags, and similar technologies to track your activity across our platform. We use analytics cookies to understand usage patterns. Third-party advertising partners may also place cookies on your device to serve targeted advertisements based on your browsing behavior across websites.

5. Data Retention
We retain your personal information for as long as necessary to fulfill the purposes described in this policy and as required by applicable law.

6. Your Rights and Choices
You may access and update your account information through your account settings. You may request deletion of your account by contacting support. Some data may be retained for legal compliance even after deletion. We do not currently respond to Do Not Track signals.

7. AI and Model Use
We may use de-identified usage data to improve and develop our machine learning models and recommendation systems.

8. Government and Law Enforcement
We may disclose your information to government authorities or law enforcement when we believe in good faith that disclosure is necessary to comply with legal obligations, protect our rights, prevent fraud, or ensure the safety of our users or the public.

9. Changes to This Policy
We may update this policy from time to time. We will notify you of material changes by posting the updated policy on our website.`;


/* =========================
   CHARACTER COUNTER
========================= */

function updateCharacterCount() {
  const count = policyInput.value.length;

  characterCount.textContent =
    `${count.toLocaleString()} / ${MAX_CHARACTERS.toLocaleString()}`;

  if (count > MAX_CHARACTERS * 0.9) {
    characterCount.dataset.warning = "true";
  } else {
    delete characterCount.dataset.warning;
  }
}

policyInput.addEventListener(
  "input",
  updateCharacterCount
);


/* =========================
   ERROR HANDLING
========================= */

function showError(message) {
  inputError.textContent = message;
  inputError.hidden = false;

  liveRegion.textContent = message;
}

function hideError() {
  inputError.textContent = "";
  inputError.hidden = true;
}

function clearResults() {
  summaryList.innerHTML = "";
  dimensionsGrid.innerHTML = "";
  concernsList.innerHTML = "";
  scoreBreakdown.innerHTML = "";

  gradeLetter.textContent = "—";
  gradeLabel.textContent = "—";
  gradeReason.textContent =
    "Based on the practices described in the submitted policy.";

  riskScore.textContent = "0";
  maxScore.textContent = "42";

  gradeBadge.className =
    "grade-badge grade-default";
}


/* =========================
   LOADING STATE
========================= */

let loadingTimer = null;

const LOADING_STEPS = [
  {
    delay: 0,
    title: "Reading your policy...",
    description: "Your policy text has been sent for analysis."
  },
  {
    delay: 4000,
    title: "Analyzing privacy signals...",
    description: "This may take a moment for longer policies."
  },
  {
    delay: 9000,
    title: "Preparing your privacy snapshot...",
    description: "Almost there."
  }
];

function setLoading(isLoading) {
  if (isLoading) {
    loadingState.hidden = false;

    analyzeButton.disabled = true;
    analyzeButton.classList.add(
      "is-loading"
    );

    policyInput.disabled = true;

    // Set initial loading text
    loadingTitle.textContent = LOADING_STEPS[0].title;
    loadingDescription.textContent = LOADING_STEPS[0].description;

    // Schedule subsequent loading steps
    loadingTimer = [];

    for (let i = 1; i < LOADING_STEPS.length; i++) {
      const step = LOADING_STEPS[i];

      const timer = setTimeout(() => {
        loadingTitle.textContent = step.title;
        loadingDescription.textContent = step.description;
      }, step.delay);

      loadingTimer.push(timer);
    }

    liveRegion.textContent =
      "Analyzing the privacy policy. This may take a moment.";
  } else {
    loadingState.hidden = true;

    analyzeButton.disabled = false;
    analyzeButton.classList.remove(
      "is-loading"
    );

    policyInput.disabled = false;

    // Clear timers
    if (loadingTimer) {
      loadingTimer.forEach(clearTimeout);
      loadingTimer = null;
    }
  }
}


/* =========================
   GRADE STYLING
========================= */

function getGradeClass(grade) {
  return `grade-${String(grade).toLowerCase()}`;
}

function getRiskClass(level) {
  const normalized =
    String(level).toLowerCase();

  if (normalized === "not_stated" ||
    normalized === "unstated") {
    return "risk-unstated";
  }

  return `risk-${normalized}`;
}

function getRiskLevel(riskLevel, assessment) {
  // "not_stated" assessments get the unstated treatment
  if (assessment === "not_stated") {
    return "unstated";
  }

  return String(riskLevel).toLowerCase();
}


/* =========================
   SAFE TEXT HELPERS
========================= */

function createElement(
  tag,
  className,
  text = null
) {
  const element =
    document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== null) {
    element.textContent = text;
  }

  return element;
}


/* =========================
   SUMMARY RENDERING
========================= */

function renderSummary(summary) {
  summaryList.innerHTML = "";

  if (!Array.isArray(summary)) {
    return;
  }

  summary.forEach((item) => {
    if (
      typeof item !== "string" ||
      !item.trim()
    ) {
      return;
    }

    const listItem =
      createElement(
        "li",
        null,
        item
      );

    summaryList.appendChild(
      listItem
    );
  });
}


/* =========================
   SCORE BREAKDOWN RENDERING
========================= */

function renderScoreBreakdown(dimensions) {
  scoreBreakdown.innerHTML = "";

  if (!Array.isArray(dimensions)) {
    return;
  }

  dimensions.forEach((dimension) => {
    const row = createElement(
      "div",
      "breakdown-row"
    );

    const label = createElement(
      "span",
      "breakdown-label",
      dimension.name || "Unknown"
    );

    const barTrack = createElement(
      "div",
      "breakdown-bar-track"
    );

    const barFill = createElement(
      "div",
      "breakdown-bar-fill"
    );

    const maxPts =
      dimension.max_weighted_points || 1;

    const pct = Math.round(
      (dimension.weighted_points / maxPts) * 100
    );

    barFill.style.width = pct + "%";

    const level = getRiskLevel(
      dimension.risk_level,
      dimension.assessment
    );

    barFill.dataset.level = level;

    barTrack.appendChild(barFill);

    const points = createElement(
      "span",
      "breakdown-points",
      `${dimension.weighted_points} / ${maxPts}`
    );

    row.appendChild(label);
    row.appendChild(barTrack);
    row.appendChild(points);

    scoreBreakdown.appendChild(row);
  });
}


/* =========================
   DIMENSION RENDERING
========================= */

function renderDimensions(dimensions) {
  dimensionsGrid.innerHTML = "";

  if (!Array.isArray(dimensions)) {
    return;
  }

  // Sort by weighted_points descending (highest concern first)
  const sorted = [...dimensions].sort(
    (a, b) =>
      (b.weighted_points || 0) -
      (a.weighted_points || 0)
  );

  sorted.forEach((dimension) => {
    const level = getRiskLevel(
      dimension.risk_level,
      dimension.assessment
    );

    const card =
      createElement(
        "article",
        "dimension-card"
      );

    card.dataset.risk = level;

    // --- Header ---
    const header =
      createElement(
        "div",
        "dimension-header"
      );

    const titleBlock =
      createElement(
        "div",
        "dimension-title-block"
      );

    const name =
      createElement(
        "h3",
        "dimension-name",
        dimension.name || "Unknown dimension"
      );

    const assessment =
      createElement(
        "p",
        "dimension-assessment",
        formatAssessment(
          dimension.assessment
        )
      );

    titleBlock.appendChild(name);
    titleBlock.appendChild(assessment);

    const meta =
      createElement(
        "div",
        "dimension-meta"
      );

    const riskPill =
      createElement(
        "span",
        `risk-pill ${getRiskClass(level)}`,
        level === "unstated"
          ? "not stated"
          : (dimension.risk_level || "unknown")
      );

    const pointsPill =
      createElement(
        "span",
        "dimension-points",
        `${dimension.weighted_points || 0} / ${dimension.max_weighted_points || 0} pts`
      );

    meta.appendChild(riskPill);
    meta.appendChild(pointsPill);

    header.appendChild(titleBlock);
    header.appendChild(meta);

    card.appendChild(header);

    // --- Evidence block ---
    const evidenceBlock =
      createElement(
        "div",
        "dimension-evidence-block"
      );

    if (dimension.evidence) {
      const evidenceLabel =
        createElement(
          "p",
          "evidence-label",
          "EVIDENCE"
        );

      const evidenceText =
        createElement(
          "p",
          "evidence-text",
          `"${dimension.evidence}"`
        );

      evidenceBlock.appendChild(evidenceLabel);
      evidenceBlock.appendChild(evidenceText);
    } else {
      const noEvidence =
        createElement(
          "p",
          "no-evidence-text",
          level === "unstated"
            ? "The policy does not provide meaningful information about this dimension."
            : "No specific evidence extracted."
        );

      evidenceBlock.appendChild(noEvidence);
    }

    card.appendChild(evidenceBlock);

    // --- Confidence ---
    if (dimension.confidence) {
      const confidence =
        createElement(
          "div",
          "dimension-confidence"
        );

      const dot =
        createElement(
          "span",
          "confidence-dot"
        );

      dot.dataset.level =
        dimension.confidence;

      const confText =
        createElement(
          "span",
          null,
          `Confidence: ${dimension.confidence}`
        );

      confidence.appendChild(dot);
      confidence.appendChild(confText);

      card.appendChild(confidence);
    }

    dimensionsGrid.appendChild(card);
  });
}


/* =========================
   CONCERN RENDERING
========================= */

function renderConcerns(concerns) {
  concernsList.innerHTML = "";

  if (
    !Array.isArray(concerns) ||
    concerns.length === 0
  ) {
    return;
  }

  concerns.forEach((concern) => {
    const card =
      createElement(
        "article",
        "concern-card"
      );

    const top =
      createElement(
        "div",
        "concern-top"
      );

    const marker =
      createElement(
        "span",
        "concern-marker",
        "!"
      );

    marker.setAttribute(
      "aria-hidden",
      "true"
    );

    const titleBlock =
      createElement("div");

    const title =
      createElement(
        "h3",
        "concern-title",
        concern.title ||
        "Privacy consideration"
      );

    titleBlock.appendChild(title);

    top.appendChild(marker);
    top.appendChild(titleBlock);

    card.appendChild(top);

    if (concern.evidence) {
      const evidence =
        createElement(
          "p",
          "concern-evidence",
          `"${concern.evidence}"`
        );

      card.appendChild(evidence);
    }

    concernsList.appendChild(card);
  });
}


/* =========================
   FORMATTING HELPERS
========================= */

function formatAssessment(value) {
  if (!value) {
    return "Not classified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* =========================
   GRADE RENDERING
========================= */

function renderGrade(data) {
  const grade =
    data.grade || "—";

  gradeLetter.textContent =
    grade;

  gradeLabel.textContent =
    data.grade_label ||
    "Analysis complete";

  gradeReason.textContent =
    getGradeReason(
      data.grade,
      data.risk_score,
      data.max_score
    );

  riskScore.textContent =
    String(
      data.risk_score ?? 0
    );

  maxScore.textContent =
    String(
      data.max_score ?? 42
    );

  gradeBadge.className =
    `grade-badge ${getGradeClass(grade)}`;
}

function getGradeReason(
  grade,
  score,
  max
) {
  if (!grade) {
    return "Analysis complete.";
  }

  const percentage =
    max > 0
      ? Math.round(
        (score / max) * 100
      )
      : 0;

  return `${score} of ${max} concern points (${percentage}%) using the Privacy Policy Decoder rubric.`;
}


/* =========================
   RESULTS RENDERING
========================= */

function renderResults(data) {
  renderGrade(data);

  renderScoreBreakdown(
    data.dimensions
  );

  renderSummary(
    data.summary
  );

  renderDimensions(
    data.dimensions
  );

  renderConcerns(
    data.top_concerns
  );

  resultsSection.hidden = false;

  liveRegion.textContent =
    `Analysis complete. Privacy grade ${data.grade}. ${data.risk_score} of ${data.max_score} concern points.`;

  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =========================
   API REQUEST
========================= */

async function analyzePolicy() {
  hideError();

  const policyText =
    policyInput.value.trim();

  if (!policyText) {
    showError(
      "Please paste a privacy policy before analyzing."
    );

    policyInput.focus();
    return;
  }

  if (
    policyText.length <
    MIN_CHARACTERS
  ) {
    showError(
      `Please provide at least ${MIN_CHARACTERS} characters of policy text.`
    );

    policyInput.focus();
    return;
  }

  if (
    policyText.length >
    MAX_CHARACTERS
  ) {
    showError(
      `The policy is too large. Please keep it under ${MAX_CHARACTERS.toLocaleString()} characters.`
    );

    policyInput.focus();
    return;
  }

  clearResults();

  setLoading(true);

  try {
    const response =
      await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            policyText
          })
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "The analysis request failed."
      );
    }

    renderResults(data);

  } catch (error) {
    console.error(
      "Frontend analysis error:",
      error
    );

    showError(
      error.message ||
      "Unable to analyze this policy right now. Please try again."
    );

  } finally {
    setLoading(false);
  }
}


/* =========================
   TRY AN EXAMPLE
========================= */

function loadExample() {
  policyInput.value = EXAMPLE_POLICY;

  updateCharacterCount();

  hideError();

  policyInput.focus();

  liveRegion.textContent =
    "Example privacy policy loaded. Press Analyze Policy to see results.";
}


/* =========================
   ANALYZE ANOTHER
========================= */

function analyzeAnother() {
  resultsSection.hidden = true;

  hideError();

  clearResults();

  policyInput.disabled = false;
  policyInput.value = "";

  updateCharacterCount();

  policyInput.focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================
   EVENT LISTENERS
========================= */

analyzeButton.addEventListener(
  "click",
  analyzePolicy
);

analyzeAnotherButton.addEventListener(
  "click",
  analyzeAnother
);

tryExampleButton.addEventListener(
  "click",
  loadExample
);

policyInput.addEventListener(
  "keydown",
  (event) => {
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key === "Enter"
    ) {
      event.preventDefault();

      analyzePolicy();
    }
  }
);


/* =========================
   INITIAL STATE
========================= */

updateCharacterCount();

resultsSection.hidden = true;
loadingState.hidden = true;

clearResults();

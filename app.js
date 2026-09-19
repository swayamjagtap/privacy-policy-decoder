const policyInput = document.querySelector("#policy-input");
const characterCount = document.querySelector("#character-count");

const analyzeButton =
  document.querySelector("#analyze-button");

const analyzeAnotherButton =
  document.querySelector("#analyze-another-button");

const inputError =
  document.querySelector("#input-error");

const loadingState =
  document.querySelector("#loading-state");

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

function setLoading(isLoading) {
  if (isLoading) {
    loadingState.hidden = false;

    analyzeButton.disabled = true;
    analyzeButton.classList.add(
      "is-loading"
    );

    policyInput.disabled = true;

    liveRegion.textContent =
      "Reading the privacy policy and preparing your privacy snapshot.";
  } else {
    loadingState.hidden = true;

    analyzeButton.disabled = false;
    analyzeButton.classList.remove(
      "is-loading"
    );

    policyInput.disabled = false;
  }
}


/* =========================
   GRADE STYLING
========================= */

function getGradeClass(grade) {
  return `grade-${String(grade).toLowerCase()}`;
}

function getRiskClass(level) {
  return `risk-${String(level).toLowerCase()}`;
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
   DIMENSION RENDERING
========================= */

function renderDimensions(dimensions) {
  dimensionsGrid.innerHTML = "";

  if (!Array.isArray(dimensions)) {
    return;
  }

  dimensions.forEach((dimension) => {
    const card =
      createElement(
        "article",
        "dimension-card"
      );

    const top =
      createElement(
        "div",
        "dimension-top"
      );

    const titleBlock =
      createElement(
        "div"
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

    const riskPill =
      createElement(
        "span",
        `risk-pill ${getRiskClass(dimension.risk_level)}`,
        dimension.risk_level || "unknown"
      );

    top.appendChild(titleBlock);
    top.appendChild(riskPill);

    const meter =
      createElement(
        "div",
        "dimension-meter"
      );

    const meterFill =
      createElement(
        "div",
        "dimension-meter-fill"
      );

    meterFill.style.width =
      getRiskPercentage(
        dimension.risk_level
      ) + "%";

    meter.appendChild(
      meterFill
    );

    card.appendChild(top);
    card.appendChild(meter);

    if (dimension.evidence) {
      const evidence =
        createElement(
          "p",
          "dimension-evidence",
          dimension.evidence
        );

      card.appendChild(evidence);
    }

    if (dimension.confidence) {
      const confidence =
        createElement(
          "div",
          "dimension-confidence",
          `Confidence: ${dimension.confidence}`
        );

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

  if (!Array.isArray(concerns)) {
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

    const title =
      createElement(
        "h3",
        "concern-title",
        concern.title ||
          "Privacy consideration"
      );

    top.appendChild(marker);
    top.appendChild(title);

    card.appendChild(top);

    if (concern.evidence) {
      const evidence =
        createElement(
          "p",
          "concern-evidence",
          `“${concern.evidence}”`
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

function getRiskPercentage(level) {
  switch (String(level).toLowerCase()) {
    case "high":
      return 100;

    case "moderate":
      return 55;

    case "low":
      return 12;

    default:
      return 25;
  }
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

  return `The policy received ${score} of ${max} risk points (${percentage}%) using the Privacy Policy Decoder rubric.`;
}


/* =========================
   RESULTS RENDERING
========================= */

function renderResults(data) {
  renderGrade(data);

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
    `Analysis complete. Privacy grade ${data.grade}.`;

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
      "Please paste a privacy policy before analyzing it."
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

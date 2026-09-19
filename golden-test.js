import { config } from "dotenv";

config({
  path: ".env.local"
});

import { GoogleGenAI } from "@google/genai";
import { EXTRACTION_PROMPT } from "./lib/prompt.js";
import { EXTRACTION_SCHEMA } from "./lib/schema.js";
import { validateExtraction } from "./lib/validate.js";
import { scorePrivacyPolicy } from "./lib/scoring.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const TEST_POLICY = `
We collect your name and email address.

We use cookies to remember your preferences.

We do not sell your personal information.

We may share your information with service providers who help us operate the service.

We retain your account information while your account is active and for 30 days after deletion.

You may request access or deletion of your information.

We may disclose information when required by law.

This policy does not describe use of personal information for AI model training.
`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Gemini request attempt ${attempt}/${maxAttempts}...`
      );

      return await ai.models.generateContent({
        model: MODEL,

        contents: `Analyze the following privacy policy.

<policy>
${TEST_POLICY}
</policy>`,

        config: {
          systemInstruction: EXTRACTION_PROMPT,
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA
        }
      });

    } catch (error) {
      const status = error?.status;

      const retryable =
        status === 503 ||
        status === 429 ||
        status === 408 ||
        status === 500 ||
        status === 502 ||
        status === 504;

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay =
        Math.min(30000, 2000 * 2 ** (attempt - 1)) +
        Math.floor(Math.random() * 1000);

      console.log(
        `Transient Gemini error (${status}). Retrying in ${Math.round(delay / 1000)}s...`
      );

      await sleep(delay);
    }
  }
}

console.log("========================================");
console.log("PRIVACY POLICY DECODER - GOLDEN TEST");
console.log("========================================");
console.log(`Model: ${MODEL}`);
console.log("");

const response = await generateWithRetry();

const rawText = response.text;

if (!rawText) {
  throw new Error("Gemini returned no response.");
}

const extraction = JSON.parse(rawText);

console.log("\n========================================");
console.log("RAW GEMINI EXTRACTION");
console.log("========================================");

console.log(
  JSON.stringify(extraction, null, 2)
);

console.log("\nValidating extraction...");

validateExtraction(extraction);

console.log("Validation: PASSED");

const result = scorePrivacyPolicy(extraction);

console.log("\n========================================");
console.log("FINAL SCORED RESULT");
console.log("========================================");

console.log(
  JSON.stringify(result, null, 2)
);

console.log("\n========================================");
console.log("GOLDEN TEST COMPLETE");
console.log("========================================");

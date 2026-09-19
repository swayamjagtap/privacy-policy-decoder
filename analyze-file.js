import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs/promises";

import { validateExtraction } from "./lib/validate.js";
import { scorePrivacyPolicy } from "./lib/scoring.js";
import { generatePolicyExtraction } from "./lib/gemini.js";

const MIN_POLICY_LENGTH = 100;
const MAX_POLICY_LENGTH = 120000;

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error(
      "Usage: node analyze-file.js <path-to-policy.txt>"
    );
    process.exit(1);
  }

  let policyText;

  try {
    policyText = await fs.readFile(
      filePath,
      "utf8"
    );
  } catch (error) {
    console.error(
      `Could not read file: ${filePath}`
    );
    console.error(error.message);
    process.exit(1);
  }

  const trimmedPolicy =
    policyText.trim();

  if (
    trimmedPolicy.length <
    MIN_POLICY_LENGTH
  ) {
    console.error(
      `Policy is too short. Minimum: ${MIN_POLICY_LENGTH} characters.`
    );
    process.exit(1);
  }

  if (
    trimmedPolicy.length >
    MAX_POLICY_LENGTH
  ) {
    console.error(
      `Policy is too large. Maximum: ${MAX_POLICY_LENGTH} characters.`
    );
    process.exit(1);
  }

  console.log("========================================");
  console.log("PRIVACY POLICY DECODER");
  console.log("REAL POLICY ANALYSIS");
  console.log("========================================");
  console.log(`File: ${filePath}`);
  console.log(
    `Characters: ${trimmedPolicy.length}`
  );

  try {
    const response =
      await generatePolicyExtraction(
        trimmedPolicy
      );

    if (!response.text) {
      throw new Error(
        "Gemini returned no text response."
      );
    }

    let extraction;

    try {
      extraction =
        JSON.parse(response.text);
    } catch {
      console.error(
        "Gemini returned invalid JSON:"
      );
      console.error(response.text);
      process.exit(1);
    }

    console.log("\n========================================");
    console.log("RAW EXTRACTION");
    console.log("========================================");

    console.log(
      JSON.stringify(
        extraction,
        null,
        2
      )
    );

    console.log(
      "\nValidating extraction..."
    );

    validateExtraction(
      extraction
    );

    console.log(
      "Validation: PASSED"
    );

    const result =
      scorePrivacyPolicy(
        extraction
      );

    console.log("\n========================================");
    console.log("FINAL SCORED RESULT");
    console.log("========================================");

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );

    console.log("\n========================================");
    console.log("ANALYSIS COMPLETE");
    console.log("========================================");

  } catch (error) {
    console.error(
      "\nAnalysis failed."
    );
    console.error(error);
    process.exit(1);
  }
}

main();

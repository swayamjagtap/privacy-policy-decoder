import { validateExtraction } from "../lib/validate.js";
import { scorePrivacyPolicy } from "../lib/scoring.js";
import { generatePolicyExtraction } from "../lib/gemini.js";

const MAX_POLICY_LENGTH = 120000;
const MIN_POLICY_LENGTH = 100;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { policyText } =
      req.body || {};

    if (
      typeof policyText !== "string" ||
      policyText.trim().length <
        MIN_POLICY_LENGTH
    ) {
      return res.status(400).json({
        error:
          `Please provide a privacy policy with at least ${MIN_POLICY_LENGTH} characters.`
      });
    }

    if (
      policyText.length >
      MAX_POLICY_LENGTH
    ) {
      return res.status(400).json({
        error:
          "The policy is too large to analyze in one request."
      });
    }

    const response =
      await generatePolicyExtraction(
        policyText
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
        "Raw Gemini response that failed to parse:",
        response.text
      );

      throw new Error(
        "Gemini's response was not valid JSON."
      );
    }

    validateExtraction(
      extraction
    );

    const result =
      scorePrivacyPolicy(
        extraction
      );

    return res.status(200).json(
      result
    );

  } catch (error) {
    console.error(
      "Analysis error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to analyze this policy right now. Please try again."
    });
  }
}

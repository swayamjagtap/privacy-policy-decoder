import { config } from "dotenv";

config({
  path: ".env.local"
});

import { GoogleGenAI } from "@google/genai";

import { EXTRACTION_PROMPT } from "./prompt.js";
import { EXTRACTION_SCHEMA } from "./schema.js";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not available. Check your .env.local file or deployment environment variables."
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const PRIMARY_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.5-flash";

const MAX_ATTEMPTS_PER_MODEL = 2;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(status) {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function tryModel(model, policyText) {
  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS_PER_MODEL;
    attempt++
  ) {
    try {
      console.log(
        `Gemini model ${model} — attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL}`
      );

      return await ai.models.generateContent({
        model,

        contents: `Analyze the following privacy policy.

<policy>
${policyText}
</policy>`,

        config: {
          systemInstruction: EXTRACTION_PROMPT,
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA
        }
      });

    } catch (error) {
      const status = error?.status;

      if (
        !isRetryable(status) ||
        attempt === MAX_ATTEMPTS_PER_MODEL
      ) {
        throw error;
      }

      const delay =
        Math.min(
          30000,
          2000 * 2 ** (attempt - 1)
        ) +
        Math.floor(Math.random() * 1000);

      console.log(
        `Transient Gemini error (${status}). ` +
        `Retrying in ${Math.round(delay / 1000)}s...`
      );

      await sleep(delay);
    }
  }
}

export async function generatePolicyExtraction(
  policyText
) {
  const models = [
    PRIMARY_MODEL,
    FALLBACK_MODEL
  ].filter(
    (model, index, array) =>
      array.indexOf(model) === index
  );

  let lastError;

  for (
    let index = 0;
    index < models.length;
    index++
  ) {
    const model = models[index];

    try {
      console.log(
        `\nUsing Gemini model: ${model}`
      );

      return await tryModel(
        model,
        policyText
      );

    } catch (error) {
      lastError = error;

      const status = error?.status;

      console.error(
        `Model ${model} failed with status ${status}.`
      );

      const hasFallback =
        index < models.length - 1;

      if (
        !hasFallback ||
        !isRetryable(status)
      ) {
        throw error;
      }

      console.log(
        `Falling back to ${models[index + 1]}...`
      );
    }
  }

  throw lastError;
}

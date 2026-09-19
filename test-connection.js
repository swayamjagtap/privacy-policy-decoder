import { config } from "dotenv";

config({
  path: ".env.local"
});

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const model =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

console.log(`Testing Gemini model: ${model}`);

const response = await ai.models.generateContent({
  model,
  contents:
    "Say 'connection successful' and nothing else."
});

console.log(response.text);

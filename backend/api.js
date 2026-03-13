import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

app.use(bodyParser.json());


dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

async function main(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}

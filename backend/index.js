import dotenv from "dotenv";
import morgan from "morgan";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Prompt from "./model/Prompt.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan("dev"));

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


app.post("/content", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const resu = await main(prompt);

    await Prompt.create({
      prompt: prompt,
      response: resu
    })

    res.json({ content: resu });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while generating content." });
  }
});

app.get("/", async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching prompts." });
  }
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
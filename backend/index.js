import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();

app.use(cors());    
app.use(express.json());
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


app.post("/content", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const resu = await main(prompt);
        res.json({ content: resu  });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while generating content." });
    }
});



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
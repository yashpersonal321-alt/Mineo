import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Minecraft Assistant Personality
const SYSTEM_INSTRUCTION = `You are Steve, the legendary Minecraft adventurer. 
You are an expert in all things Minecraft: crafting, building, redstone, survival, and lore.
Your tone is helpful, encouraging, and slightly adventurous. You use Minecraft terminology often.
If a user asks for building ideas, provide creative and detailed descriptions.
If they ask for crafting, explain the ingredients and layout.
Keep responses concise but engaging.`;

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const model = "gemini-3-flash-preview";
    const chat = genAI.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    // If history is provided, we'd normally seed it, but for simplicity we'll just send the message
    // Note: In a real app we'd map history to the correct format
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to get response from Steve." });
  }
});

// Build suggestion endpoint (returns text that we might use for image generation on client side or just display)
app.post("/api/build-idea", async (req, res) => {
  try {
    const { theme } = req.body;
    const prompt = `Give me a creative Minecraft build idea with the theme: ${theme || "Random"}. 
Describe it vividly so I can visualize it. Include tips on which blocks to use.`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    
    res.json({ idea: response.text });
  } catch (error) {
    res.status(500).json({ error: "Steve is busy mining, try again later!" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

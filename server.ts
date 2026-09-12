import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: MCP (Model Context Protocol) Implementation
  // Exposes platform data as tools for external LLMs
  app.post("/api/mcp", (req, res) => {
    const { method, params } = req.body;

    // Minimal MCP spec implementation
    switch (method) {
      case "list_tools":
        return res.json({
          tools: [
            {
              name: "get_organization_risk_posture",
              description: "Returns high-level risk metrics for the organization.",
              inputSchema: { type: "object", properties: {} }
            },
            {
              name: "list_critical_assets",
              description: "Lists business assets with criticality >= 4.",
              inputSchema: { type: "object", properties: {} }
            }
          ]
        });
      default:
        return res.status(404).json({ error: "Method not found" });
    }
  });

  // Microsoft OAuth Integration (Outlook/Hotmail)
  app.get("/api/auth/microsoft/url", (req, res) => {
    const clientId = process.env.MS_GRAPH_CLIENT_ID || "PLACEHOLDER_ID";
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/auth/microsoft/callback`);
    const scopes = encodeURIComponent("user.read mail.read");
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}`;
    
    res.json({ url: authUrl });
  });

  // API: Risk Assistant Chat
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `
              Analyze the following organization metadata and respond to the query with strategic, data-driven insights. 
              Avoid generic introductory phrases or conversational filler.
              
              ORGANIZATION METADATA:
              ${JSON.stringify(context)}
              
              STRATEGIC QUERY:
              ${message}
            `}]
          }
        ],
        config: {
          systemInstruction: "You are the CRRD Strategic Advisory Engine. Provide technical, clinical, and business-focused risk analysis. Use professional cybersecurity terminology (e.g., Inherent Risk, Residual Risk, Impact, Likelihood). Format in clean markdown tables or lists where appropriate.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

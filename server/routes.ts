import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGraphSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/graphs", async (req, res) => {
    try {
      const graphData = insertGraphSchema.parse(req.body);
      const graph = await storage.createGraph(graphData);
      res.status(201).json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid graph data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating graph" });
      }
    }
  });

  app.get("/api/graphs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const graph = await storage.getGraph(id);
      if (!graph) {
        return res.status(404).json({ message: "Graph not found" });
      }
      res.json(graph);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving graph" });
    }
  });

  app.put("/api/graphs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const graphData = insertGraphSchema.parse(req.body);
      const graph = await storage.updateGraph(id, graphData);
      if (!graph) {
        return res.status(404).json({ message: "Graph not found" });
      }
      res.json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid graph data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating graph" });
      }
    }
  });

  app.post("/api/ask", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt)
        return res.status(400).json({ message: "Prompt is required" });

      const completion = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });

      const message = completion.choices[0].message?.content;
      if (!message)
        return res.status(500).json({ message: "Invalid GPT response" });

      res.json({ response: message });
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      res
        .status(500)
        .json({ message: error.message || "Error calling OpenAI API" });
    }
  });
  
  app.post("/api/bash", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command)
        return res.status(400).json({ message: "Command is required" });

      // Execute the command in a child process
      const { exec } = require('child_process');
      
      exec(command, async (error: any, stdout: string, stderr: string) => {
        let commandOutput = '';
        
        if (error) {
          commandOutput = `Error: ${error.message}`;
        } else if (stderr) {
          commandOutput = stderr;
        } else {
          commandOutput = stdout;
        }
        
        // Construct a prompt that asks GPT to explain the bash command and its output
        const prompt = `You are a bash command processor. 
The user executed this command: "${command}"

The command output was:
\`\`\`
${commandOutput}
\`\`\`

Please respond with:
1. A brief explanation of what this command does
2. An explanation of the output
3. Any potential follow-up commands that might be useful

Format your response in a clear, readable way.`;

        const completion = await openai.chat.completions.create({
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          model: "gpt-4o",
          messages: [{ role: "system", content: "You are a helpful bash command assistant." }, 
                    { role: "user", content: prompt }],
        });

        const message = completion.choices[0].message?.content;
        if (!message)
          return res.status(500).json({ message: "Invalid GPT response" });

        res.json({ 
          response: message,
          commandOutput: commandOutput 
        });
      });
    } catch (error: any) {
      console.error("API error:", error);
      res
        .status(500)
        .json({ message: error.message || "Error executing command" });
    }
  });

  app.delete("/api/graphs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGraph(id);
      if (!success) {
        return res.status(404).json({ message: "Graph not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting graph" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

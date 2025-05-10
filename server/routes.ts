import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGraphSchema } from "@shared/schema";
import { z } from "zod";


import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export async function registerRoutes(app: Express): Promise<Server> {
  // Graph routes
  app.post('/api/graphs', async (req, res) => {
    try {
      const graphData = insertGraphSchema.parse(req.body);
      const graph = await storage.createGraph(graphData);
      res.status(201).json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid graph data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating graph' });
      }
    }
  });

  app.get('/api/graphs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const graph = await storage.getGraph(id);
      if (!graph) {
        return res.status(404).json({ message: 'Graph not found' });
      }
      res.json(graph);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving graph' });
    }
  });

  app.put('/api/graphs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const graphData = insertGraphSchema.parse(req.body);
      const graph = await storage.updateGraph(id, graphData);
      if (!graph) {
        return res.status(404).json({ message: 'Graph not found' });
      }
      res.json(graph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid graph data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating graph' });
      }
    }

  app.post('/api/ask', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      if (!completion.choices?.[0]?.message?.content) {
        return res.status(500).json({ message: 'Invalid response from OpenAI' });
      }

      res.json({ response: completion.choices[0].message.content });
    } catch (error: any) {
      const message = error.message || 'Error calling OpenAI API';
      res.status(500).json({ message });
    }
  });


  });

  app.delete('/api/graphs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGraph(id);
      if (!success) {
        return res.status(404).json({ message: 'Graph not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting graph' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

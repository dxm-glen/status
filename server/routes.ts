import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserAnalysisSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session: {
      userId?: number;
      questionnaireData?: {
        inputMethod: string;
        inputData: any;
      };
      destroy(callback: (err?: any) => void): void;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Create initial stats (all at 0)
      await storage.createUserStats({
        userId: user.id,
        intelligence: 0,
        creativity: 0,
        social: 0,
        physical: 0,
        emotional: 0,
        focus: 0,
        adaptability: 0,
        totalPoints: 0,
        level: 1,
      });

      // If questionnaire data exists in session, save it to database
      if (req.session.questionnaireData) {
        await storage.createUserAnalysis({
          userId: user.id,
          inputMethod: req.session.questionnaireData.inputMethod,
          inputData: req.session.questionnaireData.inputData,
        });
        // Clear the session data
        delete req.session.questionnaireData;
      }

      res.json({ user: { id: user.id, username: user.username, nickname: user.nickname } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      
      res.json({ user: { id: user.id, username: user.username, nickname: user.nickname } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: { id: user.id, username: user.username, nickname: user.nickname } });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Submit questionnaire (for non-authenticated users)
  app.post("/api/submit-questionnaire", async (req, res) => {
    try {
      const { answers } = req.body;
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: "Invalid questionnaire data" });
      }

      // Store in session for later use after registration
      req.session.questionnaireData = {
        inputMethod: 'questionnaire',
        inputData: answers,
      };
      
      res.json({ message: "Questionnaire submitted successfully" });
    } catch (error) {
      console.error("Questionnaire submission error:", error);
      res.status(500).json({ message: "Failed to submit questionnaire" });
    }
  });

  // Submit GPT analysis (for non-authenticated users)
  app.post("/api/submit-gpt-analysis", async (req, res) => {
    try {
      const { gptResponse } = req.body;
      if (!gptResponse || typeof gptResponse !== 'string') {
        return res.status(400).json({ message: "Invalid GPT response data" });
      }

      // Store in session for later use after registration
      req.session.questionnaireData = {
        inputMethod: 'gpt-paste',
        inputData: { gptResponse },
      };
      
      res.json({ message: "GPT analysis submitted successfully" });
    } catch (error) {
      console.error("GPT analysis submission error:", error);
      res.status(500).json({ message: "Failed to submit GPT analysis" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

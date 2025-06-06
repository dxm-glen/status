import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserAnalysisSchema } from "@shared/schema";
import { analyzeUserInput, generateMissions } from "./bedrock";
import { setupAuth } from "./auth";
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
  // Setup authentication
  setupAuth(app);

  // Session management for user context
  app.use((req: any, res, next) => {
    // Ensure user ID is available in session if authenticated
    if (req.user && !req.session.userId) {
      req.session.userId = req.user.id;
    }
    next();
  });

  // Submit questionnaire data
  app.post("/api/questionnaire", async (req, res) => {
    const { answers, inputMethod } = req.body;
    
    if (!answers || !inputMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Store questionnaire data in session
    req.session.questionnaireData = {
      inputMethod,
      inputData: answers
    };

    res.json({ 
      message: "Questionnaire submitted successfully",
      status: "stored"
    });
  });

  // Submit questionnaire data
  app.post("/api/submit-questionnaire", async (req, res) => {
    res.json({ message: "Questionnaire submitted successfully" });
  });

  // GPT analysis submission
  app.post("/api/submit-gpt-analysis", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      if (!req.session.questionnaireData) {
        return res.status(400).json({ message: "No questionnaire data found" });
      }

      const gptResponse = req.body;
      if (!gptResponse || Object.keys(gptResponse).length === 0) {
        return res.status(400).json({ message: "Invalid GPT response data" });
      }

      // Analyze user input with Bedrock AI
      const analysisResult = await analyzeUserInput(
        req.session.questionnaireData.inputMethod,
        req.session.questionnaireData.inputData
      );

      // Create user stats
      await storage.createUserStats({
        userId,
        ...analysisResult
      });

      // Create analysis record
      await storage.createUserAnalysis({
        userId,
        inputMethod: req.session.questionnaireData.inputMethod,
        inputData: req.session.questionnaireData.inputData,
        analysisResult,
      });

      // Clear session data
      delete req.session.questionnaireData;

      res.json({ 
        message: "Analysis completed successfully",
        stats: analysisResult
      });
    } catch (error) {
      console.error("Analysis submission error:", error);
      res.status(500).json({ message: "Failed to submit analysis" });
    }
  });

  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stats = await storage.getUserStats(userId);
      res.json({ stats });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Retry analysis endpoint
  app.post("/api/retry-analysis", async (req, res) => {
    res.json({ message: "Analysis retry not implemented" });
  });

  // Get user missions
  app.get("/api/user/missions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const missions = await storage.getUserMissions(userId);
      res.json({ missions });
    } catch (error) {
      console.error("Get missions error:", error);
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  // Get recent stat events for dashboard
  app.get("/api/user/stat-events", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { stat } = req.query;
      const events = await storage.getRecentStatEvents(userId, stat as string, 3);
      res.json({ events });
    } catch (error) {
      console.error("Get stat events error:", error);
      res.status(500).json({ message: "Failed to get stat events" });
    }
  });

  // Generate AI missions for user
  app.post("/api/user/generate-missions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Check mission limit
      const currentMissions = await storage.getUserMissions(userId);
      const activeMissions = currentMissions.filter(m => !m.isCompleted);
      
      const maxMissions = 10;
      if (activeMissions.length >= maxMissions) {
        return res.status(400).json({ 
          message: "Maximum mission limit reached",
          currentCount: activeMissions.length,
          maxCount: maxMissions
        });
      }

      const userStats = await storage.getUserStats(userId);
      if (!userStats) {
        return res.status(400).json({ message: "User stats not found" });
      }

      // Generate 4 new missions
      const newMissions = await generateMissions(userId, userStats, 4);
      
      // Store missions in database
      for (const mission of newMissions) {
        await storage.createMission({
          userId,
          title: mission.title,
          description: mission.description,
          difficulty: mission.difficulty,
          estimatedTime: mission.estimatedTime,
          targetStats: mission.targetStats,
          isAiGenerated: true
        });
      }

      res.json({ 
        message: "4개의 AI 미션이 생성되었습니다!",
        missions: newMissions,
        currentCount: activeMissions.length + newMissions.length,
        maxCount: maxMissions
      });
    } catch (error) {
      console.error("Generate missions error:", error);
      res.status(500).json({ message: "Failed to generate missions" });
    }
  });

  // Add custom mission
  app.post("/api/user/missions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Check mission limit
      const currentMissions = await storage.getUserMissions(userId);
      const activeMissions = currentMissions.filter(m => !m.isCompleted);
      
      const maxMissions = 10;
      if (activeMissions.length >= maxMissions) {
        return res.status(400).json({ 
          message: "Maximum mission limit reached",
          currentCount: activeMissions.length,
          maxCount: maxMissions
        });
      }

      const { title, description, difficulty, estimatedTime, targetStats } = req.body;
      
      if (!title || !description || !difficulty || !estimatedTime || !targetStats || !Array.isArray(targetStats) || targetStats.length === 0 || targetStats.length > 3) {
        return res.status(400).json({ message: "Missing required fields or invalid targetStats (must be 1-3 stats)" });
      }

      const mission = await storage.createMission({
        userId,
        title,
        description,
        difficulty,
        estimatedTime,
        targetStats,
        isAiGenerated: false
      });

      res.json({ 
        message: "Mission created successfully",
        mission,
        currentCount: activeMissions.length + 1,
        maxCount: maxMissions
      });
    } catch (error) {
      console.error("Create mission error:", error);
      res.status(500).json({ message: "Failed to create mission" });
    }
  });

  // Complete mission
  app.patch("/api/user/missions/:id/complete", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const missionId = parseInt(req.params.id);
      const mission = await storage.updateMission(missionId, {
        isCompleted: true,
        completedAt: new Date()
      });

      // Calculate stat increase based on difficulty
      const statIncrease = {
        easy: 1,
        medium: 2,
        hard: 3
      }[mission.difficulty] || 1;

      // Update user stats - support multiple stats
      const currentStats = await storage.getUserStats(userId);
      const statIncreases: Record<string, number> = {};
      
      if (currentStats) {
        const updates: Record<string, number> = {};
        
        // Generate random stat increases for each target stat (1 to statIncrease points based on difficulty)
        // Handle nested array format for targetStats
        const flatStats = Array.isArray(mission.targetStats[0]) ? mission.targetStats[0] : mission.targetStats;
        
        for (const stat of flatStats) {
          const currentValue = currentStats[stat as keyof typeof currentStats] as number;
          const randomIncrease = Math.floor(Math.random() * statIncrease) + 1; // 1 to statIncrease points
          updates[stat] = Math.min(99, currentValue + randomIncrease);
          statIncreases[stat] = randomIncrease;
        }
        
        // Recalculate total points and level
        const newStats = { ...currentStats, ...updates };
        const totalPoints = newStats.intelligence + newStats.creativity + newStats.social + 
                          newStats.physical + newStats.emotional + newStats.focus + newStats.adaptability;
        const level = Math.max(1, Math.floor(totalPoints / 50));
        
        await storage.updateUserStats(userId, {
          ...updates,
          totalPoints,
          level
        });

        // Create stat events for tracking recent changes
        try {
          for (const [stat, increase] of Object.entries(statIncreases)) {
            await storage.createStatEvent({
              userId,
              statName: stat,
              eventType: 'mission_complete',
              eventDescription: mission.title,
              statChange: increase,
              sourceId: missionId,
            });
          }
        } catch (eventError) {
          console.error("Failed to create stat events:", eventError);
          // Continue even if stat events fail
        }
      }

      res.json({ 
        message: "Mission completed successfully",
        mission,
        statIncrease: statIncreases
      });
    } catch (error) {
      console.error("Complete mission error:", error);
      res.status(500).json({ message: "Failed to complete mission" });
    }
  });

  // Delete mission
  app.delete("/api/user/missions/:id", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const missionId = parseInt(req.params.id);
      await storage.deleteMission(missionId);
      res.json({ message: "Mission deleted successfully" });
    } catch (error) {
      console.error("Delete mission error:", error);
      res.status(500).json({ message: "Failed to delete mission" });
    }
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Route error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
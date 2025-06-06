import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeUserInput, generateMissions } from "./bedrock";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  setupAuth(app);

  // Session management middleware
  app.use((req: any, res, next) => {
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

    req.session.questionnaireData = {
      inputMethod,
      inputData: answers
    };

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

      // Analyze user input with AI
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

  // Generate AI missions
  app.post("/api/user/generate-missions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentMissions = await storage.getUserMissions(userId);
      const activeMissions = currentMissions.filter(m => !m.isCompleted);
      
      if (activeMissions.length >= 10) {
        return res.status(400).json({ message: "Maximum mission limit reached" });
      }

      const userStats = await storage.getUserStats(userId);
      if (!userStats) {
        return res.status(400).json({ message: "User stats not found" });
      }

      const newMissions = await generateMissions(userId, userStats, 4);
      
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

      res.json({ message: "4개의 AI 미션이 생성되었습니다!" });
    } catch (error) {
      console.error("Generate missions error:", error);
      res.status(500).json({ message: "Failed to generate missions" });
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

      const statIncrease = { easy: 1, medium: 2, hard: 3 }[mission.difficulty] || 1;
      const currentStats = await storage.getUserStats(userId);
      const statIncreases: Record<string, number> = {};
      
      if (currentStats) {
        const updates: Record<string, number> = {};
        const flatStats = Array.isArray(mission.targetStats[0]) ? mission.targetStats[0] : mission.targetStats;
        
        for (const stat of flatStats) {
          const currentValue = currentStats[stat as keyof typeof currentStats] as number;
          const randomIncrease = Math.floor(Math.random() * statIncrease) + 1;
          updates[stat] = Math.min(99, currentValue + randomIncrease);
          statIncreases[stat] = randomIncrease;
        }
        
        const newStats = { ...currentStats, ...updates };
        const totalPoints = newStats.intelligence + newStats.creativity + newStats.social + 
                          newStats.physical + newStats.emotional + newStats.focus + newStats.adaptability;
        const level = Math.max(1, Math.floor(totalPoints / 50));
        
        await storage.updateUserStats(userId, {
          ...updates,
          totalPoints,
          level
        });

        // Create stat events
        for (const [stat, increase] of Object.entries(statIncreases)) {
          try {
            await storage.createStatEvent({
              userId,
              statName: stat,
              eventType: 'mission_complete',
              eventDescription: mission.title,
              statChange: increase,
              sourceId: missionId,
            });
          } catch (eventError) {
            console.error("Failed to create stat event:", eventError);
          }
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

  // Add custom mission
  app.post("/api/user/missions", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { title, description, difficulty, estimatedTime, targetStats } = req.body;
      
      if (!title || !description || !difficulty || !estimatedTime || !targetStats) {
        return res.status(400).json({ message: "Missing required fields" });
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

      res.json({ message: "Mission created successfully", mission });
    } catch (error) {
      console.error("Create mission error:", error);
      res.status(500).json({ message: "Failed to create mission" });
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

  const httpServer = createServer(app);
  return httpServer;
}
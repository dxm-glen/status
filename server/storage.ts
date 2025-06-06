import { users, userStats, userAnalysis, missions, diaryEntries, statEvents } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  UserStats, 
  InsertUserStats,
  UserAnalysis,
  InsertUserAnalysis,
  Mission,
  InsertMission,
  DiaryEntry,
  InsertDiaryEntry,
  StatEvent,
  InsertStatEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats>;

  // User analysis operations
  createUserAnalysis(analysis: InsertUserAnalysis): Promise<UserAnalysis>;
  getUserAnalysis(userId: number): Promise<UserAnalysis[]>;

  // Mission operations
  createMission(mission: InsertMission): Promise<Mission>;
  getUserMissions(userId: number): Promise<Mission[]>;
  updateMission(id: number, updates: Partial<Mission>): Promise<Mission>;
  deleteMission(id: number): Promise<void>;

  // Diary operations
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  getUserDiaryEntries(userId: number): Promise<DiaryEntry[]>;

  // Stat events operations
  createStatEvent(event: InsertStatEvent): Promise<StatEvent>;
  getRecentStatEvents(userId: number, statName?: string, limit?: number): Promise<StatEvent[]>;

  levelUpUser(userId: number): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const [userStat] = await db
      .insert(userStats)
      .values(stats)
      .returning();
    return userStat;
  }

  async updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats> {
    // Calculate total points if individual stats are being updated
    if (stats.intelligence !== undefined || stats.creativity !== undefined || 
        stats.social !== undefined || stats.physical !== undefined ||
        stats.emotional !== undefined || stats.focus !== undefined ||
        stats.adaptability !== undefined) {

      const currentStats = await this.getUserStats(userId);
      if (currentStats) {
        const newStats = { ...currentStats, ...stats };
        stats.totalPoints = newStats.intelligence + newStats.creativity + newStats.social + 
                           newStats.physical + newStats.emotional + newStats.focus + newStats.adaptability;
      }
    }

    const [updatedStats] = await db
      .update(userStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();

    // 레벨업 조건 체크
    const { checkLevelUpConditions } = await import('./levelSystem');
    const canLevelUp = checkLevelUpConditions(updatedStats);

    if (canLevelUp && !updatedStats.levelUpReady) {
      await db
        .update(userStats)
        .set({ levelUpReady: true })
        .where(eq(userStats.userId, userId));
      updatedStats.levelUpReady = true;
    }

    return updatedStats;
  }

  async createUserAnalysis(analysis: InsertUserAnalysis): Promise<UserAnalysis> {
    const [userAnalysisRecord] = await db
      .insert(userAnalysis)
      .values(analysis)
      .returning();
    return userAnalysisRecord;
  }

  async getUserAnalysis(userId: number): Promise<UserAnalysis[]> {
    return await db.select().from(userAnalysis).where(eq(userAnalysis.userId, userId));
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const [missionRecord] = await db
      .insert(missions)
      .values(mission)
      .returning();
    return missionRecord;
  }

  async getUserMissions(userId: number): Promise<Mission[]> {
    return await db.select().from(missions).where(eq(missions.userId, userId));
  }

  async updateMission(id: number, updates: Partial<Mission>): Promise<Mission> {
    const [updatedMission] = await db
      .update(missions)
      .set(updates)
      .where(eq(missions.id, id))
      .returning();
    return updatedMission;
  }

  async deleteMission(id: number): Promise<void> {
    await db.delete(missions).where(eq(missions.id, id));
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [diaryEntry] = await db
      .insert(diaryEntries)
      .values(entry)
      .returning();
    return diaryEntry;
  }

  async getUserDiaryEntries(userId: number): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries).where(eq(diaryEntries.userId, userId));
  }

  async createStatEvent(event: InsertStatEvent): Promise<StatEvent> {
    const [statEvent] = await db
      .insert(statEvents)
      .values(event)
      .returning();
    return statEvent;
  }

  async getRecentStatEvents(userId: number, statName?: string, limit: number = 3): Promise<StatEvent[]> {
    if (statName) {
      return await db.select().from(statEvents)
        .where(and(eq(statEvents.userId, userId), eq(statEvents.statName, statName)))
        .orderBy(desc(statEvents.createdAt))
        .limit(limit);
    }

    return await db.select().from(statEvents)
      .where(eq(statEvents.userId, userId))
      .orderBy(desc(statEvents.createdAt))
      .limit(limit);
  }

  async levelUpUser(userId: number): Promise<UserStats> {
    const currentStats = await this.getUserStats(userId);
    if (!currentStats) {
      throw new Error("User stats not found");
    }

    const newLevel = currentStats.level + 1;
    const [updatedStats] = await db
      .update(userStats)
      .set({ 
        level: newLevel,
        levelUpReady: false,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, userId))
      .returning();

    // 레벨업 이벤트 기록
    await this.createStatEvent({
      userId,
      statName: 'level',
      eventType: 'level_up',
      eventDescription: `레벨 ${currentStats.level}에서 레벨 ${newLevel}로 레벨업!`,
      statChange: 1,
      sourceId: null,
    });

    return updatedStats;
  }
}

export const storage = new DatabaseStorage();
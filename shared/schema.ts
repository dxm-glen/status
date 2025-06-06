import { pgTable, text, serial, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  nickname: text("nickname").notNull(),
  password: text("password").notNull(), // 4-digit numeric password stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  intelligence: integer("intelligence").notNull().default(0),
  creativity: integer("creativity").notNull().default(0),
  social: integer("social").notNull().default(0),
  physical: integer("physical").notNull().default(0),
  emotional: integer("emotional").notNull().default(0),
  focus: integer("focus").notNull().default(0),
  adaptability: integer("adaptability").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  canLevelUp: boolean("can_level_up").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAnalysis = pgTable("user_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  inputMethod: text("input_method").notNull(), // 'questionnaire' or 'gpt-paste'
  inputData: json("input_data").notNull(), // questionnaire answers or GPT response
  analysisResult: json("analysis_result"), // Bedrock analysis result
  summary: text("summary"), // AI generated user personality summary
  statExplanations: json("stat_explanations"), // AI explanations for each stat score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  estimatedTime: text("estimated_time").notNull(),
  targetStats: text("target_stats").array().notNull(), // which stats this mission improves (1-3 stats)
  isCompleted: boolean("is_completed").notNull().default(false),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  analysisResult: json("analysis_result"), // Bedrock sentiment/growth analysis
  statImpacts: json("stat_impacts"), // which stats were affected and by how much
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const statEvents = pgTable("stat_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  statName: text("stat_name").notNull(), // intelligence, creativity, etc.
  eventType: text("event_type").notNull(), // 'mission_complete', 'diary_analysis', 'manual'
  eventDescription: text("event_description").notNull(), // description of what caused the change
  statChange: integer("stat_change").notNull(), // +/- amount
  sourceId: integer("source_id"), // ID of mission, diary entry, etc. that caused this
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
  analysis: many(userAnalysis),
  missions: many(missions),
  diaryEntries: many(diaryEntries),
  statEvents: many(statEvents),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const userAnalysisRelations = relations(userAnalysis, ({ one }) => ({
  user: one(users, {
    fields: [userAnalysis.userId],
    references: [users.id],
  }),
}));

export const missionsRelations = relations(missions, ({ one }) => ({
  user: one(users, {
    fields: [missions.userId],
    references: [users.id],
  }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
  }),
}));

export const statEventsRelations = relations(statEvents, ({ one }) => ({
  user: one(users, {
    fields: [statEvents.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertUserAnalysisSchema = createInsertSchema(userAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
});

export const insertStatEventSchema = createInsertSchema(statEvents).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserAnalysis = typeof userAnalysis.$inferSelect;
export type InsertUserAnalysis = z.infer<typeof insertUserAnalysisSchema>;
export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type StatEvent = typeof statEvents.$inferSelect;
export type InsertStatEvent = z.infer<typeof insertStatEventSchema>;

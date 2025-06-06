import type { UserStats } from "@shared/schema";

export const STAT_NAMES = {
  intelligence: "🧠 지능",
  creativity: "🎨 창의성", 
  social: "👥 사회성",
  physical: "💪 체력",
  emotional: "❤️ 감성",
  focus: "🎯 집중력",
  adaptability: "🔄 적응력"
} as const;

export const STAT_KEYS = Object.keys(STAT_NAMES) as Array<keyof typeof STAT_NAMES>;

export const DIFFICULTY_MULTIPLIER = {
  easy: 1,
  medium: 2,
  hard: 3
} as const;

export function calculateStatTotal(stats: Partial<UserStats>): number {
  return STAT_KEYS.reduce((total, stat) => total + (stats[stat] || 0), 0);
}

export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 100);
}

export function canLevelUp(currentLevel: number, totalPoints: number): boolean {
  return totalPoints >= (currentLevel + 1) * 100;
}

export function getDefaultStats(): Omit<UserStats, 'id' | 'userId' | 'updatedAt'> {
  return {
    intelligence: 0,
    creativity: 0,
    social: 0,
    physical: 0,
    emotional: 0,
    focus: 0,
    adaptability: 0,
    totalPoints: 0,
    level: 1,
    canLevelUp: false,
  };
}

export function calculateStatIncreases(
  targetStats: string[], 
  difficulty: 'easy' | 'medium' | 'hard'
): Record<string, number> {
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const increases: Record<string, number> = {};
  
  for (const stat of targetStats) {
    increases[stat] = Math.floor(Math.random() * multiplier) + 1;
  }
  
  return increases;
}

export function formatStatIncreases(statIncreases: Record<string, number>): string {
  return Object.entries(statIncreases)
    .map(([stat, points]) => {
      const koreanName = STAT_NAMES[stat as keyof typeof STAT_NAMES] || stat;
      return `${koreanName} +${points}`;
    })
    .join(", ");
}
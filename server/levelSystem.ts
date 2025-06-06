
export interface LevelRequirement {
  minStatValue: number;
  totalPointsRequired: number;
}

// 각 레벨별 레벨업 조건 정의
export const LEVEL_REQUIREMENTS: Record<number, LevelRequirement> = {
  1: { minStatValue: 10, totalPointsRequired: 100 },
  2: { minStatValue: 15, totalPointsRequired: 150 },
  3: { minStatValue: 20, totalPointsRequired: 200 },
  4: { minStatValue: 25, totalPointsRequired: 250 },
  5: { minStatValue: 30, totalPointsRequired: 300 },
  6: { minStatValue: 35, totalPointsRequired: 350 },
  7: { minStatValue: 40, totalPointsRequired: 400 },
  8: { minStatValue: 45, totalPointsRequired: 450 },
  9: { minStatValue: 50, totalPointsRequired: 500 },
  10: { minStatValue: 55, totalPointsRequired: 550 },
  11: { minStatValue: 60, totalPointsRequired: 600 },
  12: { minStatValue: 65, totalPointsRequired: 650 },
  13: { minStatValue: 70, totalPointsRequired: 700 },
  14: { minStatValue: 75, totalPointsRequired: 750 },
  15: { minStatValue: 80, totalPointsRequired: 800 },
  // 최대 레벨 15까지 설정
};

export interface UserStats {
  intelligence: number;
  creativity: number;
  social: number;
  physical: number;
  emotional: number;
  focus: number;
  adaptability: number;
  totalPoints: number;
  level: number;
  levelUpReady: boolean;
}

export function checkLevelUpConditions(stats: UserStats): boolean {
  const currentLevel = stats.level;
  const requirement = LEVEL_REQUIREMENTS[currentLevel];
  
  if (!requirement || currentLevel >= 15) {
    return false; // 최대 레벨 도달 또는 요구사항 없음
  }

  // 모든 스탯이 최소값 이상인지 확인
  const allStatsAboveMin = [
    stats.intelligence,
    stats.creativity,
    stats.social,
    stats.physical,
    stats.emotional,
    stats.focus,
    stats.adaptability
  ].every(stat => stat >= requirement.minStatValue);

  // 총 포인트가 요구사항 이상인지 확인
  const totalPointsSufficient = stats.totalPoints >= requirement.totalPointsRequired;

  return allStatsAboveMin && totalPointsSufficient;
}

export function calculateLevelProgress(stats: UserStats): {
  currentRequirement: LevelRequirement | null;
  nextRequirement: LevelRequirement | null;
  canLevelUp: boolean;
  progressPercent: number;
  minStatProgress: number;
} {
  const currentLevel = stats.level;
  const currentRequirement = LEVEL_REQUIREMENTS[currentLevel];
  const nextRequirement = LEVEL_REQUIREMENTS[currentLevel + 1];
  
  if (!currentRequirement) {
    return {
      currentRequirement: null,
      nextRequirement: null,
      canLevelUp: false,
      progressPercent: 100,
      minStatProgress: 100
    };
  }

  const canLevelUp = checkLevelUpConditions(stats);
  
  // 총 포인트 진행도 계산
  const progressPercent = Math.min(100, (stats.totalPoints / currentRequirement.totalPointsRequired) * 100);
  
  // 최소 스탯 진행도 계산 (가장 낮은 스탯 기준)
  const minStat = Math.min(
    stats.intelligence,
    stats.creativity,
    stats.social,
    stats.physical,
    stats.emotional,
    stats.focus,
    stats.adaptability
  );
  const minStatProgress = Math.min(100, (minStat / currentRequirement.minStatValue) * 100);

  return {
    currentRequirement,
    nextRequirement,
    canLevelUp,
    progressPercent,
    minStatProgress
  };
}

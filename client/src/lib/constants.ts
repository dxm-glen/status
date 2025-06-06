export const STAT_NAMES = {
  intelligence: "🧠 지능",
  creativity: "🎨 창의성", 
  social: "👥 사회성",
  physical: "💪 체력",
  emotional: "❤️ 감성",
  focus: "🎯 집중력",
  adaptability: "🔄 적응력"
} as const;

export const STAT_DESCRIPTIONS = {
  intelligence: "논리적 사고, 문제 해결 능력, 학습 속도를 나타냅니다.",
  creativity: "독창적 아이디어 창출, 예술적 감각, 혁신적 사고력을 나타냅니다.",
  social: "대인관계 능력, 소통 스킬, 리더십과 협업 능력을 나타냅니다.",
  physical: "신체적 건강, 지구력, 활동성과 에너지 레벨을 나타냅니다.",
  emotional: "감정 이해력, 공감 능력, 정서적 안정성을 나타냅니다.",
  focus: "주의력, 집중 지속력, 목표 달성을 위한 몰입 능력을 나타냅니다.",
  adaptability: "변화에 대한 유연성, 새로운 환경 적응력, 문제 해결 유연성을 나타냅니다."
} as const;

export const DIFFICULTY_COLORS = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30"
} as const;

export const DIFFICULTY_LABELS = {
  easy: "쉬움",
  medium: "보통", 
  hard: "어려움"
} as const;

export function formatStatIncreases(statIncreases: Record<string, number>): string {
  return Object.entries(statIncreases)
    .map(([stat, points]) => {
      const koreanName = STAT_NAMES[stat as keyof typeof STAT_NAMES] || stat;
      return `${koreanName} +${points}`;
    })
    .join(", ");
}

export function getStatMaxValue(currentValue: number): number {
  if (currentValue >= 200) return 300;
  if (currentValue >= 100) return 200;
  return 100;
}

export function getStatPercentage(value: number, maxValue: number): number {
  return Math.min((value / maxValue) * 100, 100);
}
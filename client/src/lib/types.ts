export interface User {
  id: number;
  username: string;
  nickname: string;
}

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
}

export interface QuestionnaireAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  targetStats: string[];
  isCompleted: boolean;
  isAiGenerated: boolean;
}

export interface DiaryEntry {
  id: number;
  content: string;
  analysisResult?: any;
  statImpacts?: any;
  createdAt: string;
}

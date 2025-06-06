import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Clock, Target, RefreshCw } from "lucide-react";

interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  targetStats: string[];
  completedAt: string;
  completedAtLevel: number;
}

interface AchievementsByLevel {
  [level: number]: Mission[];
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const difficultyLabels = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움"
};

const statLabels: { [key: string]: string } = {
  intelligence: "🧠 지능",
  creativity: "🎨 창의성",
  social: "👥 사회성",
  physical: "💪 체력",
  emotional: "❤️ 감성",
  focus: "🎯 집중력",
  adaptability: "🔄 적응력"
};

export default function Achievements() {
  const queryClient = useQueryClient();
  
  const { data: missions, isLoading } = useQuery({
    queryKey: ["/api/user/missions/completed"],
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/missions/completed"] });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">업적</h1>
        </div>
        <div className="text-center text-muted-foreground">업적을 불러오는 중...</div>
      </div>
    );
  }

  const completedMissions = missions?.missions?.filter((mission: Mission) => 
    mission.completedAtLevel
  ) || [];

  // 레벨별로 미션 그룹화
  const achievementsByLevel: AchievementsByLevel = completedMissions.reduce((acc: AchievementsByLevel, mission: Mission) => {
    const level = mission.completedAtLevel;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(mission);
    return acc;
  }, {});

  const levels = Object.keys(achievementsByLevel).map(Number).sort((a, b) => b - a);

  if (completedMissions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">업적</h1>
        </div>
        <div className="text-center text-muted-foreground">
          아직 완료된 퀘스트가 없습니다. 퀘스트를 완료하여 업적을 쌓아보세요!
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">업적</h1>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>

      <div className="grid gap-2 mb-6">
        <div className="text-sm text-muted-foreground">
          총 완료 퀘스트: {completedMissions.length}개
        </div>
        <div className="text-sm text-muted-foreground">
          업적 달성 레벨: {levels.length > 0 ? `레벨 ${Math.min(...levels)} ~ 레벨 ${Math.max(...levels)}` : '없음'}
        </div>
      </div>

      <Tabs defaultValue={levels[0]?.toString()} className="w-full">
        <div className="overflow-x-auto mb-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-max">
            {levels.map(level => (
              <TabsTrigger 
                key={level} 
                value={level.toString()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                레벨 {level}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {levels.map(level => (
          <TabsContent key={level} value={level.toString()}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground">레벨 {level} 달성 업적</h2>
                <Badge variant="outline">{achievementsByLevel[level].length}개 완료</Badge>
              </div>
              
              <div className="grid gap-4">
                {achievementsByLevel[level].map((mission: Mission) => (
                  <Card key={mission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{mission.title}</CardTitle>
                        <Badge className={difficultyColors[mission.difficulty]}>
                          {difficultyLabels[mission.difficulty]}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {mission.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{mission.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(mission.completedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{mission.targetStats.map(stat => statLabels[stat] || stat).join(', ')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
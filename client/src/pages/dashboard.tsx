import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clock, TrendingUp, ChevronDown, ChevronUp, Star } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);

  // Level up mutation
  const levelUpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/user/level-up");
    },
    onSuccess: () => {
      toast({
        title: "레벨업 완료!",
        description: "축하합니다! 다음 레벨로 올라갔습니다."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "레벨업 실패",
        description: error.message || "레벨업 조건을 만족하지 않습니다.",
        variant: "destructive"
      });
    }
  });
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user?.user,
    retry: false,
    refetchInterval: (data) => {
      // Auto-refresh every 3 seconds if analysis is pending
      return data?.analysisStatus === 'pending' ? 3000 : false;
    }
  });

  // Fetch recent missions to show stat-affecting events
  const { data: missionsData } = useQuery({
    queryKey: ["/api/user/missions"],
    enabled: !!user?.user,
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/retry-analysis", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "분석 완료",
        description: "AI 분석이 성공적으로 완료되었습니다!",
      });
    },
    onError: (error) => {
      toast({
        title: "분석 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If not logged in, redirect to home
  if (!userLoading && !user?.user) {
    navigate("/");
    return null;
  }

  if (userLoading || statsLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-accent animate-matrix">
            로딩 중... ████████████████
          </div>
        </div>
      </main>
    );
  }

  const stats = statsData?.stats || {
    level: 1,
    totalPoints: 0,
    intelligence: 0,
    creativity: 0,
    social: 0,
    physical: 0,
    emotional: 0,
    focus: 0,
    adaptability: 0,
  };
  
  const analysisStatus = statsData?.analysisStatus || 'none';
  const hasAnalysisData = statsData?.hasAnalysisData || false;
  const progressPercentage = Math.min(100, (stats.totalPoints / 1000) * 100);

  // Helper function to get recent events for a specific stat
  const getRecentEventsForStat = (statName: string) => {
    if (!missionsData?.missions) return [];
    
    const completedMissions = missionsData.missions
      .filter((mission: any) => mission.isCompleted && mission.completedAt)
      .filter((mission: any) => {
        const flatStats = Array.isArray(mission.targetStats[0]) ? mission.targetStats[0] : mission.targetStats;
        return flatStats.includes(statName);
      })
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 3);
    
    return completedMissions.map((mission: any) => ({
      description: mission.title,
      date: mission.completedAt,
      type: 'mission_complete'
    }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="cyber-card">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-primary text-center mb-8 uppercase">
              &gt; {user.user.nickname}의 캐릭터 상태창
            </h2>
            
            {/* Character Level Display */}
            <div className="text-center mb-8">
              <div className="inline-block bg-background border-2 border-accent p-4">
                <div className="text-accent text-sm uppercase">현재 레벨</div>
                <div className="text-3xl font-bold text-foreground">Lv.{stats.level}</div>
                <div className="text-secondary text-sm">
                  {stats.totalPoints > 0 ? "성장하는 캐릭터" : "성장 준비자"}
                </div>
              </div>
            </div>

            {/* AI Analysis Status */}
            <div className="clean-card p-6 mb-8 text-center">
              <h3 className="text-foreground font-semibold mb-3 text-lg">
                {stats.totalPoints > 0 ? "AI 분석 완료!" : "AI 분석 진행 중"}
              </h3>
              
              {stats.totalPoints > 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    AI가 당신을 분석해서 스탯을 분배했습니다
                  </p>
                  
                  {/* AI Analysis Summary */}
                  {statsData?.analysisSummary && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="text-primary font-medium text-sm mb-3">당신에 대한 AI 분석</div>
                      <p className="text-foreground text-sm leading-relaxed mb-4">
                        {statsData.analysisSummary}
                      </p>
                      
                      {/* 각 스탯 설정 이유 - 토글 가능 */}
                      {statsData.statExplanations && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowAnalysisDetails(!showAnalysisDetails)}
                            className="flex items-center gap-2 text-primary font-medium text-xs mb-2 hover:text-primary/80 transition-colors"
                          >
                            <span>초기 캐릭터 스탯 설정 근거</span>
                            {showAnalysisDetails ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          
                          {showAnalysisDetails && (
                            <div className="space-y-1 text-xs animate-in slide-in-from-top-2 duration-200">
                              {Object.entries(statsData.statExplanations).map(([key, explanation]) => (
                                <div key={key} className="text-muted-foreground leading-relaxed">
                                  • {explanation}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-secondary text-sm">
                    총 성장 점수: {stats.totalPoints}점
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    계정이 생성되었습니다. AI 분석을 통해 스탯을 생성하는 중입니다.
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-pulse-soft h-3 w-3 bg-primary rounded-full"></div>
                    <span className="text-secondary text-sm">AI 분석 중...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Level Display */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-lg font-semibold text-foreground">레벨 {stats.level}</div>
                  <div className="text-sm text-muted-foreground">총 성장 점수: {stats.totalPoints}</div>
                </div>
                {stats.canLevelUp && (
                  <Button 
                    onClick={() => levelUpMutation.mutate()}
                    disabled={levelUpMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    {levelUpMutation.isPending ? "레벨업 중..." : "레벨업!"}
                  </Button>
                )}
              </div>
              
              {/* Level up requirements */}
              <div className="bg-background/30 border border-secondary p-3 rounded-lg">
                <div className="text-xs text-muted-foreground mb-2">레벨 {stats.level + 1} 달성 조건:</div>
                <div className="text-xs space-y-1">
                  <div>• 총 스탯 합계 {(stats.level + 1) * 100} 이상</div>
                  <div className="text-accent">현재 총합: {stats.intelligence + stats.creativity + stats.social + stats.physical + stats.emotional + stats.focus + stats.adaptability}</div>
                  <div className="text-muted-foreground">레벨 범위: 레벨 {stats.level} ({stats.level * 100}-{(stats.level + 1) * 100 - 1})</div>
                </div>
              </div>
            </div>

            {/* 7 Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { name: "🧠 지능", key: "intelligence", value: stats.intelligence, color: "primary", description: "논리적 사고, 문제 해결 능력, 학습 속도를 나타냅니다." },
                { name: "🎨 창의성", key: "creativity", value: stats.creativity, color: "accent", description: "독창적 아이디어 창출, 예술적 감각, 혁신적 사고력을 나타냅니다." },
                { name: "👥 사회성", key: "social", value: stats.social, color: "secondary", description: "대인관계 능력, 소통 스킬, 리더십과 협업 능력을 나타냅니다." },
                { name: "💪 체력", key: "physical", value: stats.physical, color: "primary", description: "신체적 건강, 지구력, 활동성과 에너지 레벨을 나타냅니다." },
                { name: "❤️ 감성", key: "emotional", value: stats.emotional, color: "accent", description: "감정 이해력, 공감 능력, 정서적 안정성을 나타냅니다." },
                { name: "🎯 집중력", key: "focus", value: stats.focus, color: "secondary", description: "주의력, 집중 지속력, 목표 달성을 위한 몰입 능력을 나타냅니다." },
                { name: "🔄 적응력", key: "adaptability", value: stats.adaptability, color: "primary", description: "변화에 대한 유연성, 새로운 환경 적응력, 문제 해결 유연성을 나타냅니다." },
              ].map((stat, index) => {
                // 동적 최대값 계산 (100 → 200 → 300)
                let maxValue = 100;
                if (stat.value >= 200) {
                  maxValue = 300;
                } else if (stat.value >= 100) {
                  maxValue = 200;
                }
                
                const percentage = Math.min((stat.value / maxValue) * 100, 100);
                
                return (
                  <div key={index} className="clean-card p-4 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-foreground font-medium text-sm">
                        {stat.name}
                      </span>
                      <span className="text-foreground font-semibold text-lg">{stat.value}/{maxValue}</span>
                    </div>
                    
                    <div className="text-muted-foreground text-xs leading-relaxed group-hover:text-foreground transition-colors mb-3">
                      {stat.description}
                    </div>
                    
                    <div className="progress-container h-2 mb-3">
                      <div 
                        className="progress-bar h-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Recent Events for this stat */}
                    {(() => {
                      const recentEvents = getRecentEventsForStat(stat.key);
                      return recentEvents.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            <span>최근 활동</span>
                          </div>
                          {recentEvents.map((event, eventIndex) => (
                            <div key={eventIndex} className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs py-0 px-2 h-5">
                                완료
                              </Badge>
                              <span className="text-muted-foreground truncate flex-1">
                                {event.description}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {new Date(event.date).toLocaleDateString('ko-KR', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Next Steps */}
            <div className="text-center space-y-4">
              <div className="bg-background/30 border border-secondary p-4">
                <p className="text-secondary text-sm">
                  🎯 성장을 위한 다음 단계:
                </p>
                <div className="text-accent text-xs mt-2 space-y-1">
                  <div>&gt; 일일 미션으로 스탯 증가</div>
                  <div>&gt; AI가 생성한 개인화된 미션 수행</div>
                  <div>&gt; 꾸준한 성장으로 레벨업</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="btn-primary px-8 py-3"
                  onClick={() => navigate("/missions")}
                >🎯 퀘스트 목록보기</Button>
                <Button 
                  variant="outline"
                  className="px-8 py-3"
                  onClick={() => navigate("/")}
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

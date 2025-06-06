import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
            <div className="bg-card/30 border border-primary p-6 mb-8 text-center">
              <h3 className="text-primary font-bold mb-2 uppercase">
                {stats.totalPoints > 0 ? "AI 분석 완료!" : "Phase 2 진행 중"}
              </h3>
              <p className="text-foreground text-sm mb-4">
                {stats.totalPoints > 0 
                  ? "AWS Bedrock AI가 당신의 입력을 분석하여 개인화된 스탯을 생성했습니다."
                  : "계정이 생성되었습니다. AI 분석을 통해 스탯을 생성하는 중입니다."
                }
              </p>
              <div className="text-accent text-xs">
                {stats.totalPoints > 0 ? (
                  <>
                    &gt; 분석 완료: Bedrock Claude 3 Sonnet<br />
                    &gt; 총 성장 점수: {stats.totalPoints}점<br />
                    &gt; 다음 단계: 미션 시스템 개발 예정
                  </>
                ) : (
                  <>
                    &gt; 현재 상태: 분석 대기 중<br />
                    &gt; 다음 단계: Bedrock AI 분석 및 스탯 생성
                  </>
                )}
              </div>
            </div>

            {/* Stats Display */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-secondary uppercase">총 성장 점수</span>
                <span className="text-accent">{stats.totalPoints} / 1000</span>
              </div>
              <div className="progress-container h-4">
                <div className="stat-bar h-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            {/* 7 Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { name: "🧠 지능 (INT)", value: stats.intelligence, color: "accent" },
                { name: "🎨 창의성 (CRT)", value: stats.creativity, color: "primary" },
                { name: "👥 사회성 (SOC)", value: stats.social, color: "secondary" },
                { name: "💪 체력 (PHY)", value: stats.physical, color: "accent" },
                { name: "❤️ 감성 (EMO)", value: stats.emotional, color: "primary" },
                { name: "🎯 집중력 (FOC)", value: stats.focus, color: "secondary" },
              ].map((stat, index) => (
                <div key={index} className={`bg-background/50 p-4 border border-${stat.color}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`text-${stat.color} uppercase text-sm font-bold`}>
                      {stat.name}
                    </span>
                    <span className="text-foreground">{stat.value}</span>
                  </div>
                  <div className="progress-container h-2">
                    <div 
                      className={`bg-${stat.color} h-full`} 
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {/* Adaptability - Full width */}
              <div className="bg-background/50 p-4 border border-accent col-span-1 md:col-span-2">
                <div className="flex justify-between mb-2">
                  <span className="text-accent uppercase text-sm font-bold">
                    🔄 적응력 (ADP)
                  </span>
                  <span className="text-foreground">{stats.adaptability}</span>
                </div>
                <div className="progress-container h-2">
                  <div 
                    className="bg-accent h-full" 
                    style={{ width: `${stats.adaptability}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-center">
              <div className="bg-background/30 border border-secondary p-4 mb-4">
                <p className="text-secondary text-sm">
                  📋 다음 단계 개발 예정:
                </p>
                <div className="text-accent text-xs mt-2 space-y-1">
                  <div>&gt; Phase 2: Bedrock AI 분석 및 스탯 생성</div>
                  <div>&gt; Phase 3: 상태창 시각화 개선</div>
                  <div>&gt; Phase 4: 일일 미션 시스템</div>
                  <div>&gt; Phase 5: 일기 작성 및 분석</div>
                </div>
              </div>
              
              <Button 
                className="cyber-button-green px-8 py-3"
                onClick={() => navigate("/")}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
